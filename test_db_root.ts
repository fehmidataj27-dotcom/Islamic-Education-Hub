import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: "postgresql://postgres.hvxgfgrsukulvirfnfpp:Allah%40123Muhammad@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
});
console.log("Connecting from root...");
pool.query('SELECT NOW()').then(res => {
    console.log("Success:", res.rows[0]);
    process.exit(0);
}).catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
