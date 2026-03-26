import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database functionality will not work.");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});
export const db = drizzle(pool, { schema });
