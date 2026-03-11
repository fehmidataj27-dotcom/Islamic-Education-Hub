
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function checkColumns() {
    try {
        const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
    `);
        console.log("Columns in messages table:");
        console.log(result.rows.map(r => r.column_name).join(", "));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkColumns();
