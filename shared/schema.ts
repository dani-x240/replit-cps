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
  role: text("role").notNull(), // 'citizen', 'police_io', 'police_oc', 'police_dpc', 'admin'
  nin: text("nin"), // National ID Number
  isVerified: boolean("is_verified").default(false),
  district: text("district"),
  parish: text("parish"),
  stationId: text("station_id"), // For police officers
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// === REPORTS ===
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'theft', 'assault', 'missing_person', etc.
  status: text("status").default("pending"), // 'pending', 'investigating', 'resolved', 'closed'
  location: text("location"),
  gpsCoordinates: jsonb("gps_coordinates"), // { lat: number, lng: number }
  priority: text("priority").default("medium"),
  createdById: integer("created_by_id").notNull(), // Citizen ID
  assignedToId: integer("assigned_to_id"), // IO ID
  stationId: text("station_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, updatedAt: true });

// === EVIDENCE ===
export const evidence = pgTable("evidence", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'image', 'video', 'document'
  description: text("description"),
  uploadedById: integer("uploaded_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEvidenceSchema = createInsertSchema(evidence).omit({ id: true, createdAt: true });

// === ALERTS ===
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'missing_person', 'stolen_vehicle', 'riot', 'traffic'
  location: text("location"),
  severity: text("severity").default("info"), // 'info', 'warning', 'critical'
  createdById: integer("created_by_id").notNull(), // Police/Admin ID
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });

// === RELATIONS ===
// (Optional: Define relations if using drizzle query builder with relations)

// === EXPLICIT API TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type LoginRequest = { username: string; password: string };
export type AuthResponse = User;
