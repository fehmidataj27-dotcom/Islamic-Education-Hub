
import { storage } from "../server/storage";

async function dumpVideos() {
    try {
        const videos = await storage.getVideos();
        console.log(JSON.stringify(videos, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Failed to dump videos:", error);
        process.exit(1);
    }
}

dumpVideos();
