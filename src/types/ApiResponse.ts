import { Conversation } from "@/model/Conversation";

export interface ApiResponse {
  success: boolean;
  message: string;
  conversationId: string;
  conversations: [Conversation]
};
