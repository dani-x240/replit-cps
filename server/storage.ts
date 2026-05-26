import {
  users, reports, evidence, alerts, messages, reportTimeline,
  type User, type InsertUser, type Report, type InsertReport,
  type Evidence, type InsertEvidence, type Alert, type InsertAlert,
  type Message, type InsertMessage, type TimelineEntry, type InsertTimeline,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ne } from "drizzle-orm";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat";

export interface IStorage extends IChatStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getPoliceByStation(stationId: string): Promise<User[]>;
  getPendingUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  countAdmins(): Promise<number>;

  getReports(): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByUser(userId: number): Promise<Report[]>;
  getReportsByStation(stationId: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, updates: Partial<InsertReport>): Promise<Report>;

  createEvidence(ev: InsertEvidence): Promise<Evidence>;
  getEvidenceByReportId(reportId: number): Promise<Evidence[]>;
  getAllEvidenceByUser(userId: number): Promise<Evidence[]>;

  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;

  getMessages(reportId: number): Promise<Message[]>;
  createMessage(msg: InsertMessage): Promise<Message>;

  getTimeline(reportId: number): Promise<TimelineEntry[]>;
  addTimeline(entry: InsertTimeline): Promise<TimelineEntry>;
}

export class DatabaseStorage implements IStorage {
  async getConversation(id: number) { return chatStorage.getConversation(id); }
  async getAllConversations() { return chatStorage.getAllConversations(); }
  async createConversation(title: string) { return chatStorage.createConversation(title); }
  async deleteConversation(id: number) { return chatStorage.deleteConversation(id); }
  async getMessagesByConversation(id: number) { return chatStorage.getMessagesByConversation(id); }
  async createMessage(cidOrMsg: any, role?: string, content?: string): Promise<any> {
    if (typeof cidOrMsg === "number" && role && content) {
      return chatStorage.createMessage(cidOrMsg, role, content);
    }
    const [msg] = await db.insert(messages).values(cidOrMsg as InsertMessage).returning();
    return msg;
  }

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
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  async getPoliceByStation(stationId: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.stationId, stationId));
  }
  async getPendingUsers(): Promise<User[]> {
    return db.select().from(users).where(eq(users.accountStatus, "pending")).orderBy(desc(users.createdAt));
  }
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
  async countAdmins(): Promise<number> {
    const result = await db.select().from(users).where(eq(users.role, "admin"));
    return result.length;
  }

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
  async getReportsByStation(stationId: string): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.stationId, stationId)).orderBy(desc(reports.createdAt));
  }
  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }
  async updateReport(id: number, updates: Partial<InsertReport>): Promise<Report> {
    const [report] = await db.update(reports).set({ ...updates, updatedAt: new Date() }).where(eq(reports.id, id)).returning();
    return report;
  }

  async createEvidence(insertEvidence: InsertEvidence): Promise<Evidence> {
    const [ev] = await db.insert(evidence).values(insertEvidence).returning();
    return ev;
  }
  async getEvidenceByReportId(reportId: number): Promise<Evidence[]> {
    return db.select().from(evidence).where(eq(evidence.reportId, reportId));
  }
  async getAllEvidenceByUser(userId: number): Promise<Evidence[]> {
    return db.select().from(evidence).where(eq(evidence.uploadedById, userId)).orderBy(desc(evidence.createdAt));
  }

  async getAlerts(): Promise<Alert[]> {
    return db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async getMessages(reportId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.reportId, reportId)).orderBy(messages.createdAt);
  }

  async getTimeline(reportId: number): Promise<TimelineEntry[]> {
    return db.select().from(reportTimeline).where(eq(reportTimeline.reportId, reportId)).orderBy(reportTimeline.createdAt);
  }
  async addTimeline(entry: InsertTimeline): Promise<TimelineEntry> {
    const [row] = await db.insert(reportTimeline).values(entry).returning();
    return row;
  }
}

export const storage = new DatabaseStorage();
