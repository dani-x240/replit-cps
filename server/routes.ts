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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === AUTH SETUP ===
  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
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
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === INTEGRATIONS ===
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // === API ROUTES ===

  // Auth
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(input);
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        next(err);
      }
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).send();
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.json(null);
    }
  });

  // Reports
  app.get(api.reports.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    // If citizen, only show their reports. If police, show all (or filtered).
    // For simplicity MVP:
    // @ts-ignore
    const user = req.user as any;
    if (user.role === 'citizen') {
      const reports = await storage.getReportsByUser(user.id);
      res.json(reports);
    } else {
      const reports = await storage.getReports();
      res.json(reports);
    }
  });

  app.post(api.reports.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const input = api.reports.create.input.parse(req.body);
      // @ts-ignore
      const report = await storage.createReport({ ...input, createdById: req.user.id });
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
    // Add logic to check permissions (only police can update status, etc)
    const report = await storage.updateReport(Number(req.params.id), req.body);
    res.json(report);
  });

  // Evidence
  app.post(api.evidence.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    try {
      const input = api.evidence.create.input.parse(req.body);
      // @ts-ignore
      const evidence = await storage.createEvidence({ ...input, uploadedById: req.user.id });
      res.status(201).json(evidence);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.evidence.listByReport.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const evidence = await storage.getEvidenceByReportId(Number(req.params.id));
    res.json(evidence);
  });

  // Alerts
  app.get(api.alerts.list.path, async (req, res) => {
    const alerts = await storage.getAlerts();
    res.json(alerts);
  });

  app.post(api.alerts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    // Check if police/admin
    try {
      const input = api.alerts.create.input.parse(req.body);
      // @ts-ignore
      const alert = await storage.createAlert({ ...input, createdById: req.user.id });
      res.status(201).json(alert);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUsers = await storage.getUserByUsername("admin");
  if (!existingUsers) {
    // 1. Citizen Demo
    await storage.createUser({
      username: "citizen_demo",
      password: "password123",
      fullName: "John Citizen",
      role: "citizen",
      phone: "0700123456",
      nin: "CM123456789012",
      district: "Kampala",
      parish: "Central",
      isVerified: true
    });

    // 2. IO Demo
    await storage.createUser({
      username: "io_demo",
      password: "password123",
      fullName: "Sgt. Sarah Namuli",
      role: "police_io",
      email: "sarah.n@police.ug",
      phone: "0772111222",
      stationId: "CPS-KAMPALA",
      isVerified: true
    });

    // 3. OC Demo
    await storage.createUser({
      username: "oc_demo",
      password: "password123",
      fullName: "Insp. David Okello",
      role: "police_oc",
      email: "david.o@police.ug",
      phone: "0782333444",
      stationId: "CPS-KAMPALA",
      isVerified: true
    });

    // 4. DPC Demo
    await storage.createUser({
      username: "dpc_demo",
      password: "password123",
      fullName: "SSP. Moses Mukasa",
      role: "police_dpc",
      email: "moses.m@police.ug",
      phone: "0752555666",
      stationId: "KAMPALA-METRO",
      isVerified: true
    });

    // 5. Admin Demo
    const admin = await storage.createUser({
      username: "admin",
      password: "password123",
      fullName: "CPS Administrator",
      role: "admin",
      email: "admin@cps.ug",
      phone: "0700000000",
      isVerified: true
    });

    // Create Initial Alerts
    await storage.createAlert({
      title: "Security Alert: Night Patrols",
      content: "Increased night patrols in Nakawa area starting 10PM.",
      type: "warning",
      severity: "warning",
      location: "Nakawa Division",
      createdById: admin.id
    });
  }
}
