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
        let fileUrl = useCloudinary
            ? (req.file as any).path   // multer-storage-cloudinary sets file.path = secure_url
            : `/uploads/${req.file.filename}`;

        // FIX FOR EPHEMERAL STORAGE ON RENDER:
        // Try uploading directly to Supabase Storage first if keys are configured!
        let uploadedToSupabase = false;
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !useCloudinary) {
            try {
                const bucketName = "bucket";
                const fileName = `uploads/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
                const uploadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/${bucketName}/${fileName}`;
                
                const fileBuffer = fs.readFileSync(req.file.path);

                const response = await fetch(uploadUrl, {
                    method: "POST",
                    headers: {
                        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
                        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                        "Content-Type": req.file.mimetype,
                        "x-upsert": "true"
                    },
                    body: fileBuffer
                });

                if (response.ok) {
                    fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
                    uploadedToSupabase = true;
                    // Clean up local temp file instantly
                    fs.unlinkSync(req.file.path);
                    console.log(`[Upload-Handler] Successfully pushed file directly to permanent Supabase Storage: ${fileUrl}`);
                } else {
                    console.error("[Upload-Handler] Supabase Storage push failed:", await response.text());
                }
            } catch (supaErr) {
                console.error("[Upload-Handler] Failed uploading file to Supabase directly:", supaErr);
            }
        }

        // If Cloudinary and Supabase both failed or are unset, fallback to Base64 conversions for small files (< 15MB)
        if (!useCloudinary && !uploadedToSupabase && req.file && req.file.size < 15 * 1024 * 1024 && fs.existsSync(req.file.path)) {
            try {
                const base64Data = fs.readFileSync(req.file.path, { encoding: "base64" });
                fileUrl = `data:${req.file.mimetype};base64,${base64Data}`;
                // Clean up the ephemeral file to save disk space
                fs.unlinkSync(req.file.path);
                console.log(`[Upload-Handler] Converted file to Base64 for permanent DB storage (~${Math.round(base64Data.length / 1024)} KB)`);
            } catch (convertErr) {
                console.error("[Upload-Handler] Failed to convert file to base64, leaving on disk:", convertErr);
            }
        }

        console.log(
            `[Upload-Handler] Success: ${uploadedToSupabase ? 'Supabase URL' : (!useCloudinary && fileUrl.startsWith('data:') ? 'Base64 Data URI encoded' : fileUrl)} (Size: ${req.file.size} bytes)`
        );
        res.json({ url: fileUrl });
    });
};
