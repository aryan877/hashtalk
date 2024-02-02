'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { toast } from '@/components/ui/use-toast';
import { IMessage } from '@/model/Message';
import { MessageSchema } from '@/schemas/messageSchema';
import {
  ChatMessageApiResponse,
  ChatMessagesApiResponse,
  ConversationApiResponse,
  ConversationsApiResponse,
} from '@/types/ApiResponse';
import {
  dataTagSymbol,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useParams } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { z } from 'zod';
import AIChatSection from '../../../components/AIChatSection';
import LoadedBlog from '../components/LoadedBlog';

export type TemporaryIMessage = Pick<
  IMessage,
  | 'conversationId'
  | 'message'
  | 'messageType'
  | 'createdAt'
  | 'updatedAt'
  | '_id'
>;

function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [sendingHumanMessage, setSendingHumanMessage] =
    useState<boolean>(false);

  // Fetch chat data
  const fetchChat = async (chatId: string) => {
    const { data } = await axios.get<ConversationApiResponse>(
      `/api/get-chat/${chatId}`
    );
    return data;
  };

  // Fetch messages
  const fetchMessages = async (chatId: string) => {
    const { data } = await axios.get<ChatMessagesApiResponse>(
      `/api/get-chat-messages/${chatId}`
    );
    return data;
  };

  // Use the useQuery hook to fetch chat data
  const {
    data: conversationData,
    isLoading: isConversationLoading,
    error,
  } = useQuery<ConversationApiResponse, Error>({
    queryKey: ['chat', id],
    queryFn: () => fetchChat(id),
  });

  // Fetch messages using React Query
  const {
    data: messageData,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useQuery<ChatMessagesApiResponse, Error>({
    queryKey: ['messages', id],
    queryFn: () => fetchMessages(id),
  });

  const mutation = useMutation<
    AxiosResponse<ChatMessageApiResponse>,
    Error,
    Pick<IMessage, 'message'>
  >({
    mutationFn: (newMessage) =>
      axios.post(`/api/save-human-message/${id}`, newMessage),
    onSuccess: async (response) => {
      setLoading(true);
      setSendingHumanMessage(false);
      const humanMessage = response.data.message;
      const updateTemporaryMessage = (newContent: string) => {
        queryClient.setQueryData<ChatMessagesApiResponse>(
          ['messages', id],
          (oldData: ChatMessagesApiResponse | undefined) => {
            return {
              messages: oldData
                ? oldData.messages.map((message) =>
                    message._id === streamingTempMessageId
                      ? { ...message, message: newContent }
                      : message
                  )
                : [
                    {
                      ...humanMessage,
                      message: newContent,
                      _id: streamingTempMessageId,
                    },
                  ],
              success: oldData?.success ?? true,
            };
          }
        );
      };

      const updateQueryData = (
        newMessage: TemporaryIMessage | IMessage,
        removeTemp = false
      ) => {
        queryClient.setQueryData<ChatMessagesApiResponse>(
          ['messages', id],
          (oldData: ChatMessagesApiResponse | undefined) => {
            let updatedMessages = oldData
              ? [...oldData.messages, newMessage]
              : [newMessage];
            if (removeTemp) {
              updatedMessages = updatedMessages.filter(
                (message) => message._id !== streamingTempMessageId
              );
            }
            return {
              messages: updatedMessages,
              success: oldData?.success ?? true,
            };
          }
        );
      };

      updateQueryData(humanMessage);

      const streamingTempMessageId = generateTempObjectId();

      const tempAIMessage: TemporaryIMessage = {
        conversationId: id,
        message: '',
        messageType: 'ai',
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: streamingTempMessageId,
      };

      updateQueryData(tempAIMessage);

      try {
        const response = await fetch(`/api/ai-chat/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.body) {
          throw new Error('Response body is null. Unable to read the stream.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let receivedChunks = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          receivedChunks += chunk;

          if (chunk.startsWith('{') && chunk.endsWith('}')) {
            try {
              const finalMessage = JSON.parse(chunk);
              updateQueryData(finalMessage, true);
            } catch (error) {
              console.error('Error parsing final chunk:', error);
            }
          } else {
            updateTemporaryMessage(receivedChunks);
            console.log(messageData?.messages);
          }
        }
      } catch (error) {
        console.error('Error fetching response:', error);
      } finally {
      }
    },
    onError: (error) => {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setLoading(false);
      setSendingHumanMessage(false);
    },
  });

  // Function to generate a temporary ObjectId
  const generateTempObjectId = () => {
    return Array(24)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  };

  const onMessageSubmit = async (data: z.infer<typeof MessageSchema>) => {
    mutation.mutate({ message: data.userMessage });
    setSendingHumanMessage(true);
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* Blog Loader Section */}
      <ResizablePanel defaultSize={50} minSize={2} maxSize={98}>
        {/* <div className="panel-header">
          <button onClick={expandBlogPanel}>Expand Blog</button>
        </div> */}
        <LoadedBlog
          conversation={conversationData?.conversation}
          isLoading={isConversationLoading}
        />
      </ResizablePanel>

      <ResizableHandle />

      {/* AI Chat Section */}
      <ResizablePanel defaultSize={50} minSize={2} maxSize={98}>
        {/* <div className="panel-header">
          <button onClick={expandChatPanel}>Expand Chat</button>
        </div> */}
        <AIChatSection
          onMessageSubmit={onMessageSubmit}
          messages={messageData?.messages}
          isLoading={isMessagesLoading}
          isLoadingAIMessage={loading}
          isSendingHumanMessage={sendingHumanMessage}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ChatPage;
