
import { db } from "../server/db";
import { users } from "@shared/schema";

async function verifyOriginalData() {
    try {
        const allUsers = await db.select().from(users);
        console.log(`\nVerified: Total Users in Database = ${allUsers.length}`);
        console.log("--------------------------------------------------");
        console.log(" ROLE       | NAME           | EMAIL                | USERNAME");
        console.log("--------------------------------------------------");

        allUsers.sort((a, b) => (a.role || "").localeCompare(b.role || "")).forEach(u => {
            const role = (u.role || "???").toUpperCase().padEnd(10);
            const name = `${u.firstName || ""} ${u.lastName || ""}`.padEnd(14);
            const email = (u.email || "N/A").padEnd(20);
            const username = u.username || "N/A";
            console.log(` ${role} | ${name} | ${email} | ${username}`);
        });
        console.log("--------------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

verifyOriginalData();
