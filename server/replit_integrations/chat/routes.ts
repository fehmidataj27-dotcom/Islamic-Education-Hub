import express, { type Express, Request, Response } from "express";
import { chatStorage } from "./storage";
import { openai, speechToText, ensureCompatibleFormat } from "../audio/client";
import { getLocalIslamicAnswer, getRandomIslamicQuote } from "./knowledge";
import { isAuthenticated } from "../auth";
import { pool } from "../../db";

const audioBodyParser = express.json({ limit: "50mb" });

export function registerChatRoutes(app: Express): void {
  // Ensure storage is seeded when routes are registered (with safety)
  chatStorage.seed().catch(err => console.error("[ChatStorage] Seed error:", err));

  // Get all conversations
  app.get("/api/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const allConversations = await chatStorage.getAllConversations();
      const user = (req as any).user;
      const role = (user?.role || user?.claims?.role || "student").toLowerCase();

      // Filter based on role
      const filtered = allConversations.filter(c => {
        if (role === "admin") return true;
        if (role === "teacher") return c.category === "teacher" || c.category === "general";
        if (role === "student") return c.category === "student" || c.category === "general";
        if (role === "parent") return c.category === "parent" || c.category === "general";
        return c.category === "general";
      });

      res.json(filtered);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const user = (req as any).user;
      const userId = user?.id || user?.sub;
      const messages = await chatStorage.getMessagesByConversation(id, userId);
      console.log(`[ChatRoutes] Fetched ${messages.length} messages for conversation ${id}`);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("[ChatRoutes] GET /api/conversations/:id error:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { title, category } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Group Chat", category || "general");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Unified Message Route: Handles both TEXT and VOICE
  app.post("/api/conversations/:id/messages", isAuthenticated, audioBodyParser, async (req: Request, res: Response) => {
    console.log(`[ChatRoutes] POST /api/conversations/${req.params.id}/messages - Unified Handler Ready`);
    try {
      const { content, audio, fileType, fileUrl, voice = "alloy", replyToId, replyToContent, replyToAuthor } = req.body;
      const user = (req as any).user;
      const userRole = user?.claims?.first_name || user?.firstName || "user";

      let userText = content || "";

      // Handle Voice Input (Directly from audio field)
      if (audio) {
        console.log("[ChatRoutes] Processing audio input for transcription...");
        try {
          const rawBuffer = Buffer.from(audio, "base64");
          const { buffer: audioBuffer, format: inputFormat } = await ensureCompatibleFormat(rawBuffer);
          userText = await speechToText(audioBuffer, inputFormat);
          console.log(`[ChatRoutes] Transcribed: "${userText.substring(0, 30)}..."`);
        } catch (sttError) {
          console.error("[ChatRoutes] Speech-to-Text failed:", (sttError as Error).message);
          userText = content || "Voice Message (Transcription Unavailable)";
        }
      }

      if (!userText && !audio && !fileUrl) {
        return res.status(400).json({ error: "Message content, audio, or fileUrl is required" });
      }

      const conversationId = parseInt(req.params.id as string);
      if (isNaN(conversationId)) {
        return res.status(400).json({ error: "Invalid conversation ID" });
      }

      const userId = String(user?.id || user?.sub || "");
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      // Save user message
      console.log(`[ChatRoutes] Creating message for user ${userId} in conv ${conversationId}`);
      await chatStorage.createMessage(conversationId, userRole, userText, userId, fileType, fileUrl, replyToId, replyToContent, replyToAuthor);

      const messages = await chatStorage.getMessagesByConversation(conversationId, userId);
      const chatMessages = messages.map((m) => ({
        role: (m.role.toLowerCase() === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content || "",
      }));

      const isStreaming = req.headers["accept"] === "text/event-stream";
      let fullResponse = "";

      if (isStreaming) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
      }

      const conversation = await chatStorage.getConversation(conversationId);
      const conversationTitle = (conversation?.title || "").toLowerCase();
      const isAIEnabled =
        conversationTitle.includes("ai assistant") ||
        conversationTitle.includes("ai tutor") ||
        conversationTitle.includes("islamic ai") ||
        conversationId === 1;

      if (isAIEnabled) {
        try {
          if (audio) {
            // Voice-specific streaming completion (gpt-audio)
            console.log("[ChatRoutes] Using gpt-audio for voice response...");
            const stream = await openai.chat.completions.create({
              model: "gpt-4o-audio-preview",
              modalities: ["text", "audio"],
              audio: { voice, format: "pcm16" },
              messages: chatMessages,
              stream: true,
            });

            for await (const chunk of stream) {
              const delta = chunk.choices?.[0]?.delta as any;
              if (!delta) continue;
              if (delta?.audio?.transcript) {
                fullResponse += delta.audio.transcript;
                if (isStreaming) res.write(`data: ${JSON.stringify({ type: "transcript", data: delta.audio.transcript })}\n\n`);
              }
              if (delta?.audio?.data && isStreaming) {
                res.write(`data: ${JSON.stringify({ type: "audio", data: delta.audio.data })}\n\n`);
              }
            }
          } else {
            // Standard text-specific streaming completion (gpt-4o)
            console.log("[ChatRoutes] Using gpt-4o for text response...");
            const stream = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: chatMessages,
              stream: true,
              max_completion_tokens: 2048,
            });

            for await (const chunk of stream) {
              const val = chunk.choices[0]?.delta?.content || "";
              if (val) {
                fullResponse += val;
                if (isStreaming) res.write(`data: ${JSON.stringify({ content: val })}\n\n`);
              }
            }
          }
          // Save assistant message if AI is enabled
          await chatStorage.createMessage(conversationId, "assistant", fullResponse);
        } catch (aiError) {
          console.error("[ChatRoutes] AI Error, using local knowledge base fallback:", aiError);
          const localAnswer = getLocalIslamicAnswer(userText || "");
          fullResponse = localAnswer || `JazakAllah Khair for your question. ${getRandomIslamicQuote()}`;
          if (isStreaming) {
            const type = audio ? "transcript" : "content";
            res.write(`data: ${JSON.stringify({ [type]: fullResponse })}\n\n`);
          }
          await chatStorage.createMessage(conversationId, "assistant", fullResponse);
        }
      }

      if (isStreaming) {
        if (!isAIEnabled && audio) {
          res.write(`data: ${JSON.stringify({ type: "user_transcript", data: userText })}\n\n`);
        }
        res.write(`data: ${JSON.stringify({ done: true, type: "done", transcript: fullResponse })}\n\n`);
        res.end();
      } else {
        const userId = (req as any).user?.id || (req as any).user?.sub;
        const allMessages = await chatStorage.getMessagesByConversation(conversationId, userId);
        res.json({ ...conversation, messages: allMessages, content: fullResponse });
      }
    } catch (error: any) {
      console.error("[ChatRoutes] CRITICAL Error processing message:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "";

      // Log to remote DB for debugging Render
      try {
        await pool.query(
          "INSERT INTO server_errors (message, stack, conversation_id, user_id) VALUES ($1, $2, $3, $4)",
          [errorMessage, errorStack, req.params.id ? parseInt(req.params.id as string) : null, (req as any).user?.id || null]
        );
      } catch (dbLogErr) {
        console.error("[ChatRoutes] Failed to log error to DB:", dbLogErr);
      }
      
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: errorMessage, type: "error" })}\n\n`);
        res.end();
      } else {
        // ALWAYS returning details temporarily to debug Render issue
        res.status(500).json({ 
          error: "Failed to process message", 
          details: errorMessage 
        });
      }
    }
  });
  // Delete Message for Everyone (Sender or Admin/Teacher only)
  app.delete("/api/messages/:messageId/everyone", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const user = (req as any).user;
      const conversationIdQuery = req.query.conversationId;
      const conversationId = parseInt(Array.isArray(conversationIdQuery) ? String(conversationIdQuery[0]) : String(conversationIdQuery || ''));
      if (isNaN(conversationId)) return res.status(400).json({ error: "conversationId is required" });

      const userId = String(user?.id || user?.sub || user?.claims?.sub || "");
      const userRoleFull = ((user?.role || user?.claims?.role || "student") as string).toLowerCase();

      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const message = messages.find(m => m.id === messageId);

      if (!message) return res.status(404).json({ error: "Message not found" });

      // Permission check
      const isAdminOrTeacher = userRoleFull === "admin" || userRoleFull === "teacher";
      const isOwner = message.senderId === userId;

      if (!isOwner && !isAdminOrTeacher) {
        return res.status(403).json({ error: "You don't have permission to delete this message for everyone" });
      }

      await chatStorage.deleteMessageForEveryone(messageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting message for everyone:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Delete Message for Me
  app.delete("/api/messages/:messageId/me", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const user = (req as any).user;
      const userId = String(user?.id || user?.sub || user?.claims?.sub || "");

      if (!userId) return res.status(401).json({ error: "User ID not found" });

      await chatStorage.deleteMessageForUser(messageId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting message for me:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });
}
