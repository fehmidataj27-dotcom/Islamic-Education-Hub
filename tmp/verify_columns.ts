
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function verify() {
    const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name IN ('sender_id', 'is_deleted_for_everyone', 'deleted_for_users')
  `);
    console.log(`Found ${result.rows.length} new columns:`, result.rows.map(r => r.column_name).join(", "));
    process.exit(0);
}

verify();
