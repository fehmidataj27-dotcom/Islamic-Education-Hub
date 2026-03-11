import { type Express } from "express";

export function registerAudioRoutes(_app: Express): void {
  // Overlapping conversation routes have been merged into registerChatRoutes
  // to prevent route shadowing and 400 errors.
  // See server/replit_integrations/chat/routes.ts for the unified implementation.
  console.log("[AudioRoutes] Redundant routes deactivated. Logic merged into Chat routes.");
}
