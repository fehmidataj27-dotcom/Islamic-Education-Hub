
import { db } from "../server/db";
import { users } from "@shared/schema";

async function listUsers() {
    try {
        const allUsers = await db.select().from(users);
        allUsers.forEach(u => {
            console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}, ID: ${u.id}`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Failed to list users:", error);
        process.exit(1);
    }
}

listUsers();
