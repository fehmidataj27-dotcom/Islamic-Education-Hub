import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function test() {
    try {
        console.log("Testing DB connection...");
        const result = await db.execute(sql`SELECT 1`);
        console.log("DB Connection SUCCESS:", result);

        const convs = await db.execute(sql`SELECT id, title FROM conversations`);
        const msgs = await db.execute(sql`SELECT count(*) FROM messages`);

        const fs = await import('fs');
        fs.writeFileSync('tmp/db_info.json', JSON.stringify({
            conversations: convs.rows,
            messagesCount: msgs.rows[0]
        }, null, 2));

        console.log("Results saved to tmp/db_info.json");

        process.exit(0);
    } catch (e) {
        console.error("DB Error:", e);
        process.exit(1);
    }
}

test();
