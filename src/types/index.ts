export type AIProvider = "claude" | "gemini" | "deepseek";

export interface User {
  id: string;
  name: string;
  email: string;
  accountType: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  provider?: AIProvider;
  files?: { path: string; name: string; mimeType: string }[];
  createdAt: string;
  isError?: boolean;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  aiProvider: AIProvider;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListItem {
  _id: string;
  title: string;
  aiProvider: AIProvider;
  createdAt: string;
  updatedAt: string;
}

export interface SSEChunk {
  type: "meta" | "chunk" | "done" | "error";
  content?: string;
  conversationId?: string;
  message?: string;
}

export interface ProviderStatus {
  available: boolean;
  error?: string;
}

export type ProvidersStatusMap = Record<AIProvider, ProviderStatus>;
