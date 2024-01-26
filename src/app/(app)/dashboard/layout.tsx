'use client';

import Navbar from '@/components/Navbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ConversationsApiResponse } from '@/types/ApiResponse';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';
import ChatHistory from '../components/ChatHistory';

interface RootLayoutProps {
  children: React.ReactNode;
}

// Function to fetch chats
async function fetchChats() {
  const { data } = await axios.get('/api/get-chats');
  return data;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Use React Query to fetch chats
  const {
    data: chats,
    isLoading,
    isError,
    error,
  } = useQuery<ConversationsApiResponse>({
    queryKey: ['getChats'],
    queryFn: fetchChats,
  });

  // if (isLoading) {
  //   return <div>Loading chats...</div>;
  // }

  if (isError) {
    return <div>Error loading chats: {error?.message || 'Unknown error'}</div>;
  }

  return (
    <main className="flex flex-col">
      <header className="flex items-center justify-between px-8 h-16 bg-blue-600 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-lg font-semibold">AI Dashboard</h1>
          <nav className="flex gap-4">
            <Link className="hover:underline" href="#">
              Importer
            </Link>
          </nav>
        </div>
      </header>
      <ResizablePanelGroup direction="horizontal">
        {/* Chat History - Sidebar */}
        <ResizablePanel defaultSize={20} minSize={10}>
          <ChatHistory chats={chats?.conversations} isLoading={isLoading} />
        </ResizablePanel>

        <ResizableHandle />
        {/* Main Content Area */}
        <ResizablePanel defaultSize={80} minSize={20}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
