
import { db } from "../server/db";
import { users } from "@shared/schema";

async function listUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log(`Total Users: ${allUsers.length}`);
        allUsers.forEach(u => {
            console.log(`- [${u.createdAt?.toISOString()}] Username: ${u.username || 'N/A'}, Email: ${u.email || 'N/A'}, StudentID: ${u.studentId || 'N/A'}`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Failed to list users:", error);
        process.exit(1);
    }
}

listUsers();
