import APIBase from "./httpBase";
import type { Conversation, ConversationListItem, SSEChunk, ProvidersStatusMap } from "@/types";

class ChatService extends APIBase {
  async getProvidersStatus(): Promise<ProvidersStatusMap> {
    const response = await this.get<{ providers: ProvidersStatusMap }>(
      "chat/providers/status"
    );
    return response.data.providers;
  }

  async getConversations(): Promise<ConversationListItem[]> {
    const response = await this.get<{ conversations: ConversationListItem[] }>(
      "chat/conversations"
    );
    return response.data.conversations;
  }

  async getConversation(id: string): Promise<Conversation> {
    const response = await this.get<{ conversation: Conversation }>(
      `chat/conversations/${id}`
    );
    return response.data.conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.delete(`chat/conversations/${id}`);
  }

  /**
   * Sends a message and consumes the SSE stream.
   * Calls onChunk for each text chunk, onMeta for conversation metadata,
   * and onDone when the stream is complete.
   */
  async sendMessageStream(
    provider: string,
    message: string,
    conversationId: string | null,
    callbacks: {
      onMeta: (conversationId: string) => void;
      onChunk: (text: string) => void;
      onDone: () => void;
      onError: (error: string) => void;
    }
  ): Promise<void> {
    const baseUrl =
      (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8100/api";
    const url = `${baseUrl.replace(/\/+$/, "")}/chat/send`;

    const token = localStorage.getItem("access_token");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        provider,
        message,
        ...(conversationId ? { conversationId } : {}),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      callbacks.onError(errorData.message || "Failed to send message");
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError("No response stream available");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const chunk: SSEChunk = JSON.parse(jsonStr);

          switch (chunk.type) {
            case "meta":
              if (chunk.conversationId) callbacks.onMeta(chunk.conversationId);
              break;
            case "chunk":
              if (chunk.content) callbacks.onChunk(chunk.content);
              break;
            case "done":
              callbacks.onDone();
              break;
            case "error":
              callbacks.onError(chunk.message || "AI provider error");
              break;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}

export const chatService = new ChatService();
