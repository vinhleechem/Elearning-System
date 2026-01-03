/**
 * ChatDB - IndexedDB for Chat Persistence
 * Using Dexie.js wrapper for better DX
 */

import Dexie, { type Table } from "dexie";

// ============= TYPES =============

export interface DBConversation {
    id: number; // Same as backend conversation_id
    user_id: number;
    title: string;
    created_at: string;
    updated_at: string;
    message_count?: number;
    last_message?: string;
}

export interface DBMessage {
    id?: number; // Auto-increment local ID
    conversation_id: number;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    sources?: Array<{
        content: string;
        title?: string;
        relevance?: number;
    }>;
    cached?: boolean;
    synced?: boolean; // Track if synced with backend
}

// ============= DATABASE =============

export class ChatDB extends Dexie {
    conversations!: Table<DBConversation, number>;
    messages!: Table<DBMessage, number>;

    constructor() {
        super("ELearningChatDB");

        // Define schema
        this.version(1).stores({
            // Indexes: Primary key (++id), indexed fields
            conversations:
                "id, user_id, updated_at", // id = conversation_id from backend
            messages:
                "++id, conversation_id, timestamp, [conversation_id+timestamp]", // Compound index for pagination
        });
    }

    // ===== CONVERSATION METHODS =====

    async saveConversation(conversation: DBConversation): Promise<void> {
        await this.conversations.put(conversation);
    }

    async getConversation(id: number): Promise<DBConversation | undefined> {
        return await this.conversations.get(id);
    }

    async getConversations(
        userId: number,
        limit: number = 20,
    ): Promise<DBConversation[]> {
        return await this.conversations
            .where("user_id")
            .equals(userId)
            .reverse()
            .sortBy("updated_at")
            .then((convs) => convs.slice(0, limit));
    }

    async deleteConversation(id: number): Promise<void> {
        // Delete conversation and all its messages
        await this.transaction("rw", this.conversations, this.messages, async () => {
            await this.conversations.delete(id);
            await this.messages.where("conversation_id").equals(id).delete();
        });
    }

    // ===== MESSAGE METHODS =====

    async saveMessage(message: DBMessage): Promise<number> {
        return await this.messages.add(message);
    }

    async saveMessages(messages: DBMessage[]): Promise<void> {
        await this.messages.bulkAdd(messages);
    }

    async updateMessage(id: number, changes: Partial<DBMessage>): Promise<void> {
        await this.messages.update(id, changes);
    }

    /**
     * Get messages with pagination
     * @param conversationId - Conversation ID
     * @param limit - Number of messages to fetch
     * @param before - Timestamp to fetch messages before (for pagination)
     */
    async getMessages(
        conversationId: number,
        limit: number = 50,
        before?: string,
    ): Promise<DBMessage[]> {
        let query = this.messages.where("conversation_id").equals(conversationId);

        if (before) {
            // Get messages before this timestamp
            query = query.and((msg) => msg.timestamp < before);
        }

        return await query
            .reverse()
            .sortBy("timestamp")
            .then((msgs) => msgs.slice(0, limit).reverse()); // Reverse to get chronological order
    }

    /**
     * Get recent messages (for display)
     */
    async getRecentMessages(
        conversationId: number,
        limit: number = 50,
    ): Promise<DBMessage[]> {
        return await this.messages
            .where("conversation_id")
            .equals(conversationId)
            .reverse()
            .sortBy("timestamp")
            .then((msgs) => msgs.slice(0, limit).reverse());
    }

    /**
     * Get message count for a conversation
     */
    async getMessageCount(conversationId: number): Promise<number> {
        return await this.messages
            .where("conversation_id")
            .equals(conversationId)
            .count();
    }

    /**
     * Clear all unsynced messages (for cleanup)
     */
    async clearUnsyncedMessages(): Promise<void> {
        await this.messages.filter(msg => msg.synced === false).delete();
    }

    /**
     * Mark messages as synced
     */
    async markMessagesSynced(conversationId: number): Promise<void> {
        await this.messages
            .where("conversation_id")
            .equals(conversationId)
            .modify({ synced: true });
    }

    // ===== UTILITY METHODS =====

    /**
     * Clear all data (for logout or reset)
     */
    async clearAll(): Promise<void> {
        await this.transaction("rw", this.conversations, this.messages, async () => {
            await this.conversations.clear();
            await this.messages.clear();
        });
    }

    /**
     * Get database stats
     */
    async getStats(): Promise<{
        totalConversations: number;
        totalMessages: number;
    }> {
        const [totalConversations, totalMessages] = await Promise.all([
            this.conversations.count(),
            this.messages.count(),
        ]);

        return { totalConversations, totalMessages };
    }

    /**
     * Migrate from localStorage to IndexedDB
     */
    async migrateFromLocalStorage(userId: number): Promise<void> {
        try {
            // Get conversation_id from localStorage
            const convIdStr = localStorage.getItem("chatbot_conversation_id");
            if (!convIdStr) return;

            const convId = parseInt(convIdStr);
            const cacheKey = `chatbot_messages_${convId}`;
            const cachedMessages = localStorage.getItem(cacheKey);

            if (cachedMessages) {
                const messages = JSON.parse(cachedMessages);

                // Save conversation
                await this.saveConversation({
                    id: convId,
                    user_id: userId,
                    title: `Chat ${new Date().toLocaleDateString()}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    message_count: messages.length,
                });

                // Save messages
                const dbMessages: DBMessage[] = messages.map((msg: any) => ({
                    conversation_id: convId,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp || new Date().toISOString(),
                    sources: msg.sources,
                    cached: msg.cached,
                    synced: true, // Assume already synced since from localStorage
                }));

                await this.saveMessages(dbMessages);

                // Clean up localStorage
                localStorage.removeItem(cacheKey);

                console.log("✅ Migrated from localStorage to IndexedDB");
            }
        } catch (error) {
            console.error("❌ Migration failed:", error);
        }
    }
}

// ============= SINGLETON INSTANCE =============

export const chatDB = new ChatDB();

// Auto-migrate on first load
if (typeof window !== "undefined") {
    // Check if we need to migrate
    const needsMigration = localStorage.getItem("chatbot_conversation_id");
    if (needsMigration) {
        console.log("🔄 Detected localStorage data, will migrate to IndexedDB");
    }
}

export default chatDB;
