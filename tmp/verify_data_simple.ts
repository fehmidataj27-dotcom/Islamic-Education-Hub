
import { db } from "../server/db";
import { users } from "@shared/schema";

async function verifyOriginalData() {
    try {
        const allUsers = await db.select().from(users);
        for (const u of allUsers) {
            console.log(`DATA: ${u.role}, ${u.firstName} ${u.lastName}, ${u.email}, ${u.username}`);
        }
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

verifyOriginalData();
