import { pgTable, serial, integer, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").default("general").notNull(), // 'general', 'student', 'teacher'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id"), // ID of the user who sent the message
  role: text("role").notNull(), // This is used as the display name of the sender
  content: text("content").notNull(),
  fileType: text("file_type"), // 'voice', 'image', 'file'
  fileUrl: text("file_url"),
  replyToId: integer("reply_to_id"),
  replyToContent: text("reply_to_content"),
  replyToAuthor: text("reply_to_author"),
  isDeletedForEveryone: boolean("is_deleted_for_everyone").default(false).notNull(),
  deletedForUsers: jsonb("deleted_for_users").default([]).notNull(), // Array of user IDs who deleted for themselves
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

