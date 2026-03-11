import { chatStorage } from '../server/replit_integrations/chat/storage';

async function testChat() {
    try {
        console.log("Testing chat storage...");
        const convs = await chatStorage.getAllConversations();
        console.log("Conversations fetched successfully:", convs.length);

        if (convs.length > 0) {
            const cid = convs[0].id;
            console.log(`Testing message creation for conversation ${cid}...`);
            const msg = await chatStorage.createMessage(cid, "Admin", "Test message from script");
            console.log("Message created successfully:", msg.id);
        } else {
            console.log("No conversations found to test message creation.");
        }
        process.exit(0);
    } catch (e) {
        console.error("Chat Storage Error:", e);
        process.exit(1);
    }
}

testChat();
