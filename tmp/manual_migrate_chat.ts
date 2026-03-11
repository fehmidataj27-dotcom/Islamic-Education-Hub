
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function migrate() {
    try {
        console.log("Checking if messages table exists...");

        // Check if columns exist first to avoid errors
        const colsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
    `);
        const cols = colsResult.rows.map(r => r.column_name);

        if (!cols.includes('sender_id')) {
            console.log("Adding sender_id column...");
            await db.execute(sql`ALTER TABLE messages ADD COLUMN sender_id TEXT`);
        }

        if (!cols.includes('is_deleted_for_everyone')) {
            console.log("Adding is_deleted_for_everyone column...");
            await db.execute(sql`ALTER TABLE messages ADD COLUMN is_deleted_for_everyone BOOLEAN DEFAULT FALSE NOT NULL`);
        }

        if (!cols.includes('deleted_for_users')) {
            console.log("Adding deleted_for_users column...");
            await db.execute(sql`ALTER TABLE messages ADD COLUMN deleted_for_users JSONB DEFAULT '[]'::jsonb NOT NULL`);
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
