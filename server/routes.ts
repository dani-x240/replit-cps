import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import crypto from "crypto";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === AUTH SETUP ===
  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "cps-secret-key-2026",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, secure: false },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Unified Passport strategy: username = phone (citizen) OR service_number (police/admin)
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "No account found with these credentials." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        if (user.accountStatus === "rejected") {
          return done(null, false, { message: "Your account has been rejected. Contact admin." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });

  // === INTEGRATIONS ===
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // === CITIZEN REGISTER ===
  app.post("/api/auth/register/citizen", async (req, res, next) => {
    try {
      const { phone, fullName, nin, password, district, parish } = req.body;

      if (!phone || !fullName || !nin || !password) {
        return res.status(400).json({ message: "Phone, full name, NIN, and password are required." });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters." });
      }

      // Validate NIN against valid_citizens
      const validCitizen = await storage.getValidCitizen(nin.toUpperCase().trim());
      if (!validCitizen) {
        return res.status(400).json({ message: "NIN not found in the national citizens register. Contact your local government office." });
      }

      // Phone is the unique identifier (username)
      const phoneClean = phone.replace(/\s+/g, "").trim();
      const existing = await storage.getUserByUsername(phoneClean);
      if (existing) {
        return res.status(400).json({ message: "An account with this phone number already exists." });
      }

      const user = await storage.createUser({
        username: phoneClean,
        password,
        fullName: validCitizen.fullName, // Use name from register
        phone: phoneClean,
        role: "citizen",
        nin: nin.toUpperCase().trim(),
        district: district || null,
        parish: parish || null,
        isVerified: true,
        accountStatus: "approved",
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(sanitizeUser(user));
      });
    } catch (err: any) {
      next(err);
    }
  });

  // === UNIFIED LOGIN ===
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        res.status(200).json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).send();
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(sanitizeUser(req.user as any));
    } else {
      res.json(null);
    }
  });

  // === ADMIN USER MANAGEMENT ===
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const allUsers = await storage.getAllUsers();
    res.json(allUsers.map(sanitizeUser));
  });

  app.get("/api/admin/users/pending", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const pending = await storage.getPendingUsers();
    res.json(pending.map(sanitizeUser));
  });

  app.post("/api/admin/users/:id/approve", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const updated = await storage.updateUser(Number(req.params.id), { accountStatus: "approved", isVerified: true });
    res.json(sanitizeUser(updated));
  });

  app.post("/api/admin/users/:id/reject", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const updated = await storage.updateUser(Number(req.params.id), { accountStatus: "rejected" });
    res.json(sanitizeUser(updated));
  });

  // Admin creates police officer account
  app.post("/api/admin/users/create-officer", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const { serviceNumber, fullName, role, password, phone, email, stationId } = req.body;
    if (!phone || !fullName || !role || !password) {
      return res.status(400).json({ message: "Phone number, full name, role, and password are required." });
    }
    const phoneClean = phone.replace(/\s+/g, "").trim();
    const existing = await storage.getUserByUsername(phoneClean);
    if (existing) return res.status(400).json({ message: "An account with this phone number already exists." });
    const officer = await storage.createUser({
      username: phoneClean,   // phone is the login identifier
      password,
      fullName,
      role,
      serviceNumber: serviceNumber || null,
      phone: phoneClean,
      email: email || null,
      stationId: stationId || null,
      isVerified: true,
      accountStatus: "approved",
    });
    res.status(201).json(sanitizeUser(officer));
  });

  // === REPORTS ===
  app.get(api.reports.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (user.role === "citizen") {
      const rpts = await storage.getReportsByUser(user.id);
      res.json(rpts);
    } else {
      const rpts = await storage.getReports();
      res.json(rpts);
    }
  });

  app.post(api.reports.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const input = api.reports.create.input.parse(req.body);
      const user = req.user as any;
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rand = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
      const caseNumber = `CRI-${dateStr}-${rand}`;
      const report = await storage.createReport({
        ...input,
        createdById: user.id,
        caseNumber,
        stationId: user.stationId || user.district || "Kampala Central",
        status: "submitted",
      });
      await storage.addTimeline({
        reportId: report.id,
        action: "Report submitted",
        actorName: user.fullName,
        actorRole: user.role,
        notes: `Case number ${caseNumber} created`,
      });
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.reports.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const report = await storage.getReport(Number(req.params.id));
    if (!report) return res.status(404).send();
    res.json(report);
  });

  app.patch(api.reports.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    const id = Number(req.params.id);
    const report = await storage.updateReport(id, req.body);
    if (req.body.status) {
      await storage.addTimeline({
        reportId: id,
        action: `Status updated to: ${req.body.status}`,
        actorName: user.fullName,
        actorRole: user.role,
        notes: req.body.officerNotes || null,
      });
    }
    res.json(report);
  });

  app.patch("/api/reports/:id/assign", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (!["police_oc", "police_dpc", "admin"].includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    const id = Number(req.params.id);
    const { assignedToId, officerName } = req.body;
    const report = await storage.updateReport(id, { assignedToId, status: "assigned" });
    await storage.addTimeline({
      reportId: id,
      action: "Case assigned to officer",
      actorName: user.fullName,
      actorRole: user.role,
      notes: `Assigned to: ${officerName || assignedToId}`,
    });
    res.json(report);
  });

  app.get("/api/reports/:id/timeline", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const timeline = await storage.getTimeline(Number(req.params.id));
    res.json(timeline);
  });

  app.get("/api/reports/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const msgs = await storage.getMessages(Number(req.params.id));
    res.json(msgs);
  });

  app.post("/api/reports/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: "Content required" });
    const msg = await (storage as any).createMessage({
      reportId: Number(req.params.id),
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.role,
      content: content.trim(),
    });
    res.status(201).json(msg);
  });

  // === EVIDENCE ===
  app.post(api.evidence.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const user = req.user as any;
      const { reportId, fileUrl, fileType, description, fileName, dataBase64 } = req.body;
      let sha256Hash: string | undefined;
      if (dataBase64) {
        sha256Hash = crypto.createHash("sha256").update(dataBase64).digest("hex");
      }
      const ev = await storage.createEvidence({
        reportId: Number(reportId),
        fileUrl: fileUrl || "uploaded",
        fileType,
        description,
        fileName,
        sha256Hash,
        verificationStatus: "verified",
        uploadedById: user.id,
      });
      res.status(201).json(ev);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get("/api/evidence/my", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    const ev = await storage.getAllEvidenceByUser(user.id);
    res.json(ev);
  });

  app.get(api.evidence.listByReport.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const ev = await storage.getEvidenceByReportId(Number(req.params.id));
    res.json(ev);
  });

  // === ALERTS ===
  app.get(api.alerts.list.path, async (req, res) => {
    const alertList = await storage.getAlerts();
    res.json(alertList);
  });

  app.post(api.alerts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const input = api.alerts.create.input.parse(req.body);
      const alert = await storage.createAlert({ ...input, createdById: (req.user as any).id });
      res.status(201).json(alert);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // === SOS ===
  const sosAlerts: any[] = [];
  const sosRecordings = new Map<number, { kind: string; mimeType: string; size: number; receivedAt: string }[]>();

  app.post("/api/sos", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    const id = sosAlerts.length + 1;
    const alert = {
      id,
      userId: user.id,
      fullName: user.fullName,
      phone: user.phone,
      district: user.district,
      coords: req.body?.coords || null,
      triggeredAt: req.body?.triggeredAt || new Date().toISOString(),
      status: "active",
    };
    sosAlerts.push(alert);
    console.log(`[SOS] Alert #${id} from ${user.fullName} at`, alert.coords);
    res.status(201).json(alert);
  });

  app.post("/api/sos/recording", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const { alertId, kind, mimeType, dataBase64 } = req.body || {};
    if (!alertId || !kind || !dataBase64) {
      return res.status(400).json({ message: "Invalid recording payload" });
    }
    const size = Math.floor((dataBase64.length * 3) / 4);
    const list = sosRecordings.get(alertId) || [];
    list.push({ kind, mimeType, size, receivedAt: new Date().toISOString() });
    sosRecordings.set(alertId, list);
    res.status(201).json({ ok: true });
  });

  app.get("/api/sos", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const user = req.user as any;
    if (user.role === "citizen") {
      return res.json(sosAlerts.filter((a) => a.userId === user.id));
    }
    res.json(sosAlerts);
  });

  app.post("/api/emergency/quick", async (req, res) => {
    const { coords, mediaKind, mimeType, dataBase64, hasAudio } = req.body || {};
    if (!mediaKind || !dataBase64) {
      return res.status(400).json({ message: "media required" });
    }
    if (!["video", "photo"].includes(mediaKind)) {
      return res.status(400).json({ message: "invalid mediaKind" });
    }
    const id = sosAlerts.length + 1;
    const size = Math.floor((dataBase64.length * 3) / 4);
    const alert = {
      id,
      userId: null,
      fullName: "Anonymous",
      phone: null,
      district: null,
      coords: coords || null,
      triggeredAt: new Date().toISOString(),
      status: "active",
      anonymous: true,
    };
    sosAlerts.push(alert);
    sosRecordings.set(id, [
      { kind: mediaKind, mimeType: mimeType || "application/octet-stream", size, receivedAt: new Date().toISOString() },
    ]);
    console.log(`[QUICK-SOS] Alert #${id} anonymous ${mediaKind}${hasAudio ? "+audio" : ""} (${size} bytes) at`, coords);
    res.status(201).json({ ok: true, alertId: id });
  });

  return httpServer;
}

function sanitizeUser(user: any) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}
