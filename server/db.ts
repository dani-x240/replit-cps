import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

let connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL must be set.");
}

// Auto-convert direct Supabase connection (port 5432) to pooler (port 6543)
// because Replit blocks direct IPv6 connections to Supabase
if (connectionString.includes("db.") && connectionString.includes(".supabase.co:5432")) {
  const match = connectionString.match(/postgresql:\/\/postgres:(.+)@db\.([^.]+)\.supabase\.co:5432\/postgres/);
  if (match) {
    const [, password, ref] = match;
    connectionString = `postgresql://postgres.${ref}:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;
    console.log("[db] Auto-converted to Supabase pooler connection");
  }
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
