import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation, Message } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useChat() {
    const queryClient = useQueryClient();

    const useConversations = () => {
        return useQuery<Conversation[]>({
            queryKey: ["/api/conversations"],
        });
    };

    const useConversation = (id: number | null) => {
        return useQuery<Conversation & { messages: Message[] }>({
            queryKey: [`/api/conversations/${id}`],
            enabled: !!id,
        });
    };

    const useSendMessage = () => {
        return useMutation({
            mutationFn: async ({ conversationId, content, fileType, fileUrl, audio, replyToId, replyToContent, replyToAuthor }: { conversationId: number; content: string, fileType?: string, fileUrl?: string, audio?: string, replyToId?: number, replyToContent?: string, replyToAuthor?: string }) => {
                const res = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, { content, fileType, fileUrl, audio, replyToId, replyToContent, replyToAuthor });
                return res.json();
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: [`/api/conversations/${variables.conversationId}`] });
            },
        });
    };

    const useCreateConversation = () => {
        return useMutation({
            mutationFn: async ({ title, category }: { title: string, category?: string }) => {
                const res = await apiRequest("POST", "/api/conversations", { title, category });
                return res.json();
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
            },
        });
    };

    const useDeleteMessage = () => {
        return useMutation({
            mutationFn: async ({ messageId, conversationId, mode }: { messageId: number; conversationId: number; mode: 'me' | 'everyone' }) => {
                const res = await apiRequest("DELETE", `/api/messages/${messageId}/${mode}?conversationId=${conversationId}`);
                if (!res.ok) throw new Error("Failed to delete message");
                return true;
            },
            onSuccess: (_, variables) => {
                queryClient.invalidateQueries({ queryKey: [`/api/conversations/${variables.conversationId}`] });
            },
        });
    };

    return {
        useConversations,
        useConversation,
        useSendMessage,
        useCreateConversation,
        useDeleteMessage,
    };
}
