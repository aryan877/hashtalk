import { Conversation } from "@/model/Conversation";

export interface GetChatsApiResponse {
  success: boolean;
  message: string;
  conversations: Conversation[];
};

export interface GetChatApiResponse {
  success: boolean;
  message: string;
  conversation: Conversation;
};

export interface EmbedApiResponse {
  success: boolean;
  message: string;
  conversation: Conversation;
}

export interface StandardApiResponse {
  success: boolean;
  message: string;
}