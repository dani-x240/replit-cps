import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export * from "./models/chat";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull(),
  nin: text("nin"),
  isVerified: boolean("is_verified").default(false),
  accountStatus: text("account_status").default("approved"), // 'pending' | 'approved' | 'rejected'
  district: text("district"),
  parish: text("parish"),
  stationId: text("station_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// === REPORTS ===
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  status: text("status").default("submitted"),
  location: text("location"),
  gpsCoordinates: jsonb("gps_coordinates"),
  priority: text("priority").default("medium"),
  createdById: integer("created_by_id").notNull(),
  assignedToId: integer("assigned_to_id"),
  stationId: text("station_id"),
  officerNotes: text("officer_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, updatedAt: true });

// === EVIDENCE ===
export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  fileType: text("file_type").notNull(),
  fileSizeBytes: integer("file_size_bytes"),
  description: text("description"),
  sha256Hash: text("sha256_hash"),
  verificationStatus: text("verification_status").default("verified"),
  uploadedById: integer("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEvidenceSchema = createInsertSchema(evidence).omit({ id: true, createdAt: true });

// === ALERTS ===
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  location: text("location"),
  severity: text("severity").default("info"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });

// === MESSAGES (citizen ↔ police on a case) ===
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  senderId: integer("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderRole: text("sender_role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// === REPORT TIMELINE ===
export const reportTimeline = pgTable("report_timeline", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  action: text("action").notNull(),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTimelineSchema = createInsertSchema(reportTimeline).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type TimelineEntry = typeof reportTimeline.$inferSelect;
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;

export type LoginRequest = { username: string; password: string };
export type AuthResponse = User;
