import { TemporaryIMessage } from '@/app/(app)/dashboard/chat/[id]/page';
import { Conversation } from '@/model/Conversation';
import { IMessage } from '@/model/Message';

export interface ConversationsApiResponse {
  success: boolean;
  message: string;
  conversations: Conversation[];
}

export interface ChatMessagesApiResponse {
  success: boolean;
  messages: IMessage[] | TemporaryIMessage[];
}

export interface ChatMessageApiResponse {
  success: boolean;
  message: IMessage;
}

export interface ConversationApiResponse {
  success: boolean;
  message: string;
  conversation: Conversation;
}

export interface StandardApiResponse {
  success: boolean;
  message: string;
}

export interface PatTokenApiResponse {
  success: boolean;
  message: string;
  patToken: string;
}