
import pg from 'pg';
const { Pool } = pg;

const connectionString = "postgresql://postgres.hvxgfgrsukulvirfnfpp:Allah%40123Muhammad@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
const pool = new Pool({ connectionString });

(async () => {
    try {
        console.log("Connecting to database...");
        const res = await pool.query('SELECT NOW()');
        console.log("Success:", res.rows[0]);
        await pool.end();
    } catch (err) {
        console.error("Connection failed:", err);
        process.exit(1);
    }
})();
