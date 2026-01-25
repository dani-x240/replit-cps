import { users, reports, evidence, alerts, type User, type InsertUser, type Report, type InsertReport, type Evidence, type InsertEvidence, type Alert, type InsertAlert } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat";

export interface IStorage extends IChatStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Reports
  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByUser(userId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, updates: Partial<InsertReport>): Promise<Report>;

  // Evidence
  createEvidence(evidence: InsertEvidence): Promise<Evidence>;
  getEvidenceByReportId(reportId: number): Promise<Evidence[]>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
}

export class DatabaseStorage implements IStorage {
  // --- Chat Storage Delegation ---
  async getConversation(id: number) { return chatStorage.getConversation(id); }
  async getAllConversations() { return chatStorage.getAllConversations(); }
  async createConversation(title: string) { return chatStorage.createConversation(title); }
  async deleteConversation(id: number) { return chatStorage.deleteConversation(id); }
  async getMessagesByConversation(id: number) { return chatStorage.getMessagesByConversation(id); }
  async createMessage(cid: number, role: string, content: string) { return chatStorage.createMessage(cid, role, content); }

  // --- Users ---
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // --- Reports ---
  async getReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.createdById, userId)).orderBy(desc(reports.createdAt));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async updateReport(id: number, updates: Partial<InsertReport>): Promise<Report> {
    const [report] = await db.update(reports).set(updates).where(eq(reports.id, id)).returning();
    return report;
  }

  // --- Evidence ---
  async createEvidence(insertEvidence: InsertEvidence): Promise<Evidence> {
    const [ev] = await db.insert(evidence).values(insertEvidence).returning();
    return ev;
  }

  async getEvidenceByReportId(reportId: number): Promise<Evidence[]> {
    return db.select().from(evidence).where(eq(evidence.reportId, reportId));
  }

  // --- Alerts ---
  async getAlerts(): Promise<Alert[]> {
    return db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }
}

export const storage = new DatabaseStorage();
