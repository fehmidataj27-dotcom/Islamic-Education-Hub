import fs from "node:fs";
import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";

let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!_openai) {
    try {
      const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing OpenAI API Key");
      }
      _openai = new OpenAI({
        apiKey: apiKey,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
    } catch (error) {
      console.warn("[OpenAI Image] Initialization failed, using mock client:", (error as Error).message);
      _openai = new Proxy({} as any, {
        get: (target, prop) => {
          if (prop === "images") return { generate: async () => { throw new Error("AI Image features disabled: Missing API Key"); }, edit: async () => { throw new Error("AI Image features disabled: Missing API Key"); } };
          return () => { throw new Error(`AI Image features disabled: Missing API Key (tried to access ${String(prop)})`); };
        }
      });
    }
  }
  return _openai!;
}
export const openai = undefined as unknown as OpenAI; // kept for type compat

/**
 * Generate an image and return as Buffer.
 * Uses gpt-image-1 model via Replit AI Integrations.
 */
export async function generateImageBuffer(
  prompt: string,
  size: "1024x1024" | "512x512" | "256x256" = "1024x1024"
): Promise<Buffer> {
  const response = await getOpenAI().images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });
  const data = response.data;
  const base64 = (data && data.length > 0) ? data[0].b64_json ?? "" : "";
  return Buffer.from(base64, "base64");
}

/**
 * Edit/combine multiple images into a composite.
 * Uses gpt-image-1 model via Replit AI Integrations.
 */
export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string
): Promise<Buffer> {
  const images = await Promise.all(
    imageFiles.map((file) =>
      toFile(fs.createReadStream(file), file, {
        type: "image/png",
      })
    )
  );

  const response = await getOpenAI().images.edit({
    model: "gpt-image-1",
    image: images,
    prompt,
  });

  const data = response.data;
  const imageBase64 = (data && data.length > 0) ? data[0].b64_json ?? "" : "";
  const imageBytes = Buffer.from(imageBase64, "base64");

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBytes);
  }

  return imageBytes;
}

