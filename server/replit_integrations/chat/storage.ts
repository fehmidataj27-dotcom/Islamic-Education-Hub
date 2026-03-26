import { conversations, messages, type Message, type Conversation } from "@shared/schema";

export interface IChatStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string, category?: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number, userId?: string): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string, senderId?: string, fileType?: string, fileUrl?: string, replyToId?: number, replyToContent?: string, replyToAuthor?: string): Promise<Message>;
  deleteMessageForEveryone(messageId: number): Promise<void>;
  deleteMessageForUser(messageId: number, userId: string): Promise<void>;
  seed(): Promise<void>;
}

class MemChatStorage implements IChatStorage {
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private ids = { conversation: 1, message: 1 };

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.find(c => c.id === id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    return [...this.conversations].sort((a: Conversation, b: Conversation) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });
  }

  async createConversation(title: string, category: string = "general"): Promise<Conversation> {
    const c: Conversation = {
      id: this.ids.conversation++,
      title,
      category,
      createdAt: new Date()
    };
    this.conversations.push(c);
    return c;
  }

  async deleteConversation(id: number): Promise<void> {
    this.messages = this.messages.filter(m => m.conversationId !== id);
    this.conversations = this.conversations.filter(c => c.id !== id);
  }

  async getMessagesByConversation(conversationId: number, userId?: string): Promise<Message[]> {
    return this.messages
      .filter(m => {
        const isDeletedForEveryone = !!m.isDeletedForEveryone;
        const deletedForMe = userId && m.deletedForUsers && Array.isArray(m.deletedForUsers) && m.deletedForUsers.includes(userId);
        return m.conversationId === conversationId && !isDeletedForEveryone && !deletedForMe;
      })
      .sort((a: Message, b: Message) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tA - tB;
      });
  }

  async createMessage(conversationId: number, role: string, content: string, senderId?: string, fileType?: string, fileUrl?: string, replyToId?: number, replyToContent?: string, replyToAuthor?: string): Promise<Message> {
    const m: Message = {
      id: this.ids.message++,
      conversationId,
      senderId: senderId || null,
      role,
      content,
      fileType: fileType || null,
      fileUrl: fileUrl || null,
      replyToId: replyToId || null,
      replyToContent: replyToContent || null,
      replyToAuthor: replyToAuthor || null,
      isDeletedForEveryone: false,
      deletedForUsers: [],
      createdAt: new Date()
    };
    this.messages.push(m);
    return m;
  }

  async deleteMessageForEveryone(messageId: number): Promise<void> {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg) {
      msg.isDeletedForEveryone = true;
    }
  }

  async deleteMessageForUser(messageId: number, userId: string): Promise<void> {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg) {
      const deletedFor = (msg.deletedForUsers as string[]) || [];
      if (!deletedFor.includes(userId)) {
        msg.deletedForUsers = [...deletedFor, userId];
      }
    }
  }

  async syncGroups() {
    const oldNameGroup = this.conversations.find(c => c.title === "Teacher's Lounge (Official)");
    if (oldNameGroup) {
      oldNameGroup.title = "Teachers Main Group";
    }
    if (!this.conversations.some(c => c.title === "Teachers Main Group")) {
      await this.createConversation("Teachers Main Group", "teacher");
    }
    if (!this.conversations.some(c => c.title === "Islamic AI Assistant ✨")) {
      await this.createConversation("Islamic AI Assistant ✨", "general");
    }
  }

  async seed() {
    await this.syncGroups();
    if (this.conversations.length <= 3) {
      if (!this.conversations.some(c => c.title === "Islamic AI Tutor ✨")) {
        await this.createConversation("Islamic AI Tutor ✨", "student");
      }
      if (!this.conversations.some(c => c.title === "Admin Office")) {
        const c2 = await this.createConversation("Admin Office", "general");
        await this.createMessage(c2.id, "Admin", "Welcome to the Admin portal. How can we help you today?");
      }
    }
  }
}

class DatabaseChatStorage implements IChatStorage {
  async getConversation(id: number): Promise<Conversation | undefined> {
    const { db } = await import("../../db");
    const { eq } = await import("drizzle-orm");
    const [c] = await db.select().from(conversations).where(eq(conversations.id, id));
    return c;
  }

  async getAllConversations(): Promise<Conversation[]> {
    const { db } = await import("../../db");
    const { desc } = await import("drizzle-orm");
    return await db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async createConversation(title: string, category: string = "general"): Promise<Conversation> {
    const { db } = await import("../../db");
    const [c] = await db.insert(conversations).values({ title, category }).returning();
    return c;
  }

  async deleteConversation(id: number): Promise<void> {
    const { db } = await import("../../db");
    const { eq } = await import("drizzle-orm");
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessagesByConversation(conversationId: number, userId?: string): Promise<Message[]> {
    const { db } = await import("../../db");
    const { eq, and, asc, not, sql } = await import("drizzle-orm");

    // Filter out messages deleted for everyone OR deleted specifically for this user
    let conditions = and(
      eq(messages.conversationId, conversationId),
      eq(messages.isDeletedForEveryone, false)
    );

    if (userId) {
      // Safely check if userId is in the deletedForUsers array, handling NULL with COALESCE
      conditions = and(
        conditions,
        not(sql`COALESCE(${messages.deletedForUsers}, '[]'::jsonb) @> jsonb_build_array(${userId})`)
      );
    }

    return await db.select().from(messages).where(conditions).orderBy(asc(messages.createdAt));
  }

  async createMessage(conversationId: number, role: string, content: string, senderId?: string, fileType?: string, fileUrl?: string, replyToId?: number, replyToContent?: string, replyToAuthor?: string): Promise<Message> {
    const { db } = await import("../../db");
    const [m] = await db.insert(messages).values({
      conversationId,
      senderId: senderId || null,
      role,
      content,
      fileType: fileType || null,
      fileUrl: fileUrl || null,
      replyToId: replyToId || null,
      replyToContent: replyToContent || null,
      replyToAuthor: replyToAuthor || null,
    }).returning();
    return m;
  }

  async deleteMessageForEveryone(messageId: number): Promise<void> {
    const { db } = await import("../../db");
    const { eq } = await import("drizzle-orm");
    await db.update(messages)
      .set({ isDeletedForEveryone: true })
      .where(eq(messages.id, messageId));
  }

  async deleteMessageForUser(messageId: number, userId: string): Promise<void> {
    const { db } = await import("../../db");
    const { eq, sql } = await import("drizzle-orm");
    // Using sql append to handle jsonb array push
    await db.update(messages)
      .set({
        deletedForUsers: sql`COALESCE(deleted_for_users, '[]'::jsonb) || jsonb_build_array(${userId})`
      })
      .where(eq(messages.id, messageId));
  }

  async seed() {
    const all = await this.getAllConversations();
    if (all.length === 0) {
      await this.createConversation("Teachers Main Group", "teacher");
      await this.createConversation("Islamic AI Assistant ✨", "general");
      await this.createConversation("Islamic AI Tutor ✨", "student");
      const c = await this.createConversation("Admin Office", "general");
      await this.createMessage(c.id, "Admin", "Welcome to our support department.");
    }
  }
}

export const chatStorage = process.env.DATABASE_URL ? new DatabaseChatStorage() : new MemChatStorage();
