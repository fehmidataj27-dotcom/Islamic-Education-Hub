import multer from "multer";
import path from "path";
import fs from "fs";
import { type Request, Response } from "express";

// Media Upload Setup
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: multerStorage,
    limits: { fileSize: Infinity }
});

export const uploadFileHandler = (req: Request, res: Response) => {
    console.log(`[Upload-Handler] Request received: ${req.method} ${req.url}`);
    console.log(`[Upload-Handler] Content-Type: ${req.headers["content-type"]}`);
    console.log(`[Upload-Handler] Content-Length: ${req.headers["content-length"]} bytes (~${Math.round(Number(req.headers["content-length"]) / 1024 / 1024)} MB)`);

    upload.single("file")(req, res, (err: any) => {
        if (err) {
            console.error("[Upload-Handler] Multer error:", err);
            return res.status(400).json({ message: `Upload error: ${err.message || "Unknown error"}` });
        }
        if (!req.file) {
            console.error("[Upload-Handler] Error: No file found in request. Headers:", req.headers);
            return res.status(400).json({ message: "No file uploaded. Ensure field name is 'file'." });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        console.log(`[Upload-Handler] Success: ${req.file.filename} (Size: ${req.file.size} bytes)`);
        res.json({ url: fileUrl });
    });
};
