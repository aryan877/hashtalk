'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import {
  useQuery,
  useMutation,
  useQueryClient,
  dataTagSymbol,
} from '@tanstack/react-query';
import { z } from 'zod';
import axios, { AxiosResponse } from 'axios';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import LoadedBlog from '../components/LoadedBlog';
import AIChatSection from '../../../components/AIChatSection';
import {
  GetChatsApiResponse,
  GetChatApiResponse,
  GetChatMessagesApiResponse,
  AIChatApiResponse,
} from '@/types/ApiResponse';
import { MessageSchema } from '@/schemas/messageSchema';
import { toast } from '@/components/ui/use-toast';
import { IMessage } from '@/model/Message';

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

  // Fetch chat data
  const fetchChat = async (chatId: string) => {
    const { data } = await axios.get<GetChatApiResponse>(
      `/api/get-chat/${chatId}`
    );
    return data;
  };

  // Fetch messages
  const fetchMessages = async (chatId: string) => {
    const { data } = await axios.get<GetChatMessagesApiResponse>(
      `/api/get-chat-messages/${chatId}`
    );
    return data;
  };

  // Use the useQuery hook to fetch chat data
  const {
    data: conversationData,
    isLoading: isConversationLoading,
    error,
  } = useQuery<GetChatApiResponse, Error>({
    queryKey: ['chat', id],
    queryFn: () => fetchChat(id),
  });

  // Fetch messages using React Query
  const {
    data: messageData,
    isLoading: isMessagesLoading,
    error: messagesError,
  } = useQuery<GetChatMessagesApiResponse, Error>({
    queryKey: ['messages', id],
    queryFn: () => fetchMessages(id),
  });

  // const mutation = useMutation<AxiosResponse<AIChatApiResponse>, Error, NewMessage>({
  //   mutationFn: (newMessage: NewMessage) =>
  //     axios.post('/api/ai-chat/${id}', newMessage),
  //     onSuccess: () => {
  //       take the message returned from data and add it to the messageData.message array
  //     }
  // });

  const mutation = useMutation<
    AxiosResponse<AIChatApiResponse>,
    Error,
    z.infer<typeof MessageSchema>
  >({
    mutationFn: (newMessage: z.infer<typeof MessageSchema>) =>
      axios.post(`/api/ai-chat/${id}`, newMessage),
    onSuccess: (response) => {
      const newMessage = response.data.message;
      const conversationId = response.data.message.conversationId;
      queryClient.setQueryData<GetChatMessagesApiResponse>(
        ['messages', conversationId],
        (oldData: GetChatMessagesApiResponse | undefined) => {
          // Construct the new data object with all required properties
          return {
            messages: oldData
              ? [...oldData.messages, newMessage]
              : [newMessage],
            success: oldData?.success ?? true,
          };
        }
      );
    },
    onError: (error) => {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Function to generate a temporary ObjectId
  const generateTempObjectId = () => {
    return Array(24)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  };

  const onMessageSubmit = (messageContent: z.infer<typeof MessageSchema>) => {
    const tempMessage: TemporaryIMessage = {
      conversationId: id,
      message: messageContent.userMessage,
      messageType: 'human',
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: generateTempObjectId(), // Temporary ObjectId
    };

    // Optimistically update the UI with the temporary message
    queryClient.setQueryData<GetChatMessagesApiResponse>(
      ['messages', id],
      (oldData: GetChatMessagesApiResponse | undefined) => ({
        messages: oldData ? [...oldData.messages, tempMessage] : [tempMessage],
        success: oldData?.success ?? true,
      })
    );

    // Perform the mutation
    mutation.mutate(messageContent);
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* Blog Loader Section */}
      <ResizablePanel defaultSize={33} minSize={15}>
        <LoadedBlog
          conversation={conversationData?.conversation}
          isLoading={isConversationLoading}
        />
      </ResizablePanel>

      <ResizableHandle />

      {/* AI Chat Section */}
      <ResizablePanel defaultSize={67} minSize={15}>
        <AIChatSection
          onMessageSubmit={onMessageSubmit}
          messages={messageData?.messages}
          isLoading={isMessagesLoading}
          isLoadingAIMessage={mutation.isPending}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ChatPage;
