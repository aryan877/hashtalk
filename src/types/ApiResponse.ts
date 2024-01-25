import { TemporaryIMessage } from '@/app/(app)/dashboard/chat/[id]/page';
import { Conversation } from '@/model/Conversation';
import { IMessage } from '@/model/Message';

export interface GetChatsApiResponse {
  success: boolean;
  message: string;
  conversations: Conversation[];
}

export interface GetChatMessagesApiResponse {
  success: boolean;
  messages: IMessage[] | TemporaryIMessage[];
}

export interface AIChatApiResponse {
  success: boolean;
  message: IMessage;
}


export interface GetChatApiResponse {
  success: boolean;
  message: string;
  conversation: Conversation;
}

export interface EmbedApiResponse {
  success: boolean;
  message: string;
  conversation: Conversation;
}

export interface StandardApiResponse {
  success: boolean;
  message: string;
}
