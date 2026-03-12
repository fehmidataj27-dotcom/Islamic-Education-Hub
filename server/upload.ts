import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";
import { type Request, Response } from "express";

// ─────────────────────────────────────────────
// Cloudinary configuration (uses env variables)
// ─────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const useCloudinary =
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;

// ─────────────────────────────────────────────
// Fallback: local disk storage (for development)
// ─────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// ─────────────────────────────────────────────
// Cloudinary storage — auto-detects resource type
// ─────────────────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: (req: any, file: Express.Multer.File) => {
        const ext = path.extname(file.originalname).toLowerCase();

        // Determine Cloudinary resource_type based on MIME type
        let resourceType: "image" | "video" | "raw" = "raw";
        if (file.mimetype.startsWith("image/")) {
            resourceType = "image";
        } else if (
            file.mimetype.startsWith("video/") ||
            file.mimetype.startsWith("audio/")
        ) {
            // Cloudinary handles audio under "video" resource type
            resourceType = "video";
        }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const publicId = `islamic-hub/${uniqueSuffix}`;

        return {
            resource_type: resourceType,
            public_id: publicId,
            // Keep original file extension for raw (PDF, webm, ogg, etc.)
            format: resourceType === "raw" ? ext.replace(".", "") : undefined,
        };
    },
} as any);

// ─────────────────────────────────────────────
// Select storage backend based on env variables
// ─────────────────────────────────────────────
const storage = useCloudinary ? cloudinaryStorage : diskStorage;

const upload = multer({
    storage,
    limits: { fileSize: Infinity },
});

// ─────────────────────────────────────────────
// Upload handler — works for both Cloudinary & local
// ─────────────────────────────────────────────
export const uploadFileHandler = (req: Request, res: Response) => {
    console.log(`[Upload-Handler] Request received: ${req.method} ${req.url}`);
    console.log(`[Upload-Handler] Content-Type: ${req.headers["content-type"]}`);
    console.log(
        `[Upload-Handler] Content-Length: ${req.headers["content-length"]} bytes (~${Math.round(Number(req.headers["content-length"]) / 1024 / 1024)} MB)`
    );
    console.log(`[Upload-Handler] Storage: ${useCloudinary ? "Cloudinary ☁️" : "Local Disk 💾"}`);

    upload.single("file")(req, res, (err: any) => {
        if (err) {
            console.error("[Upload-Handler] Multer/Cloudinary error:", err);
            return res
                .status(400)
                .json({ message: `Upload error: ${err.message || "Unknown error"}` });
        }

        if (!req.file) {
            console.error(
                "[Upload-Handler] Error: No file found in request. Headers:",
                req.headers
            );
            return res
                .status(400)
                .json({ message: "No file uploaded. Ensure field name is 'file'." });
        }

        // Cloudinary gives a `path` (or `secure_url`) field; local gives `filename`
        const fileUrl = useCloudinary
            ? (req.file as any).path   // multer-storage-cloudinary sets file.path = secure_url
            : `/uploads/${req.file.filename}`;

        console.log(
            `[Upload-Handler] Success: ${fileUrl} (Size: ${req.file.size} bytes)`
        );
        res.json({ url: fileUrl });
    });
};
