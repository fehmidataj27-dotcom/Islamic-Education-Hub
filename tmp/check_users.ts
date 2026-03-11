
import { db } from "../server/db";
import { users } from "@shared/schema";

async function checkUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log(`Found ${allUsers.length} users in the database:`);
        console.log(JSON.stringify(allUsers, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        process.exit(1);
    }
}

checkUsers();
