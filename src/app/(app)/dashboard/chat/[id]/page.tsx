'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import LoadedBlog from '../components/LoadedBlog';
import AIChatSection from '../../../components/AIChatSection';
import { GetChatsApiResponse } from '@/types/ApiResponse';
import { Conversation } from '@/model/Conversation';
import { GetChatApiResponse } from '@/types/ApiResponse';


function ChatPage() {
  const { id } = useParams<{ id: string }>();

  // Define a function to fetch chat data
  const fetchChat = async (chatId: string) => {
    const { data } = await axios.get<GetChatApiResponse>(
      `/api/get-chat/${chatId}`
    );
    return data;
  };

  // Use the useQuery hook to fetch chat data
  const {
    data: conversationData,
    isLoading,
    error,
  } = useQuery<GetChatApiResponse, Error>({
    queryKey: ['chat', id],
    queryFn: () => fetchChat(id),
  });

  const onMessageSubmit = async (data: any) => {
    // Handle chat submission logic here
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* Blog Loader Section */}
      <ResizablePanel defaultSize={33} minSize={15}>
        <LoadedBlog conversation={conversationData?.conversation} isLoading={isLoading} />
      </ResizablePanel>

      <ResizableHandle />

      {/* AI Chat Section */}
      <ResizablePanel defaultSize={67} minSize={15}>
        <AIChatSection onMessageSubmit={onMessageSubmit} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ChatPage;
