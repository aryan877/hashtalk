'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ChatHistory from './components/ChatHistory';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types/ApiResponse';

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
  } = useQuery<ApiResponse>({ queryKey: ['getChats'], queryFn: fetchChats });

  // if (isLoading) {
  //   return <div>Loading chats...</div>;
  // }

  if (isError) {
    return <div>Error loading chats: {error?.message || 'Unknown error'}</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="mt-20">
        <div style={{ height: 'calc(100vh - 5rem)' }}>
          <header className="flex items-center justify-between px-8 h-16 bg-gray-800 text-white">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
              <h1 className="text-lg font-semibold">AI Dashboard</h1>
              <nav className="flex gap-4">
                <Link className="hover:underline" href="#">
                  Importer
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex">
            <ResizablePanelGroup direction="horizontal">
              {/* Chat History - Sidebar */}
              <ResizablePanel defaultSize={20} minSize={10}>
                <ChatHistory
                  chats={chats?.conversations}
                  isLoading={isLoading}
                />
              </ResizablePanel>

              <ResizableHandle />
              {/* Main Content Area */}
              <ResizablePanel defaultSize={80} minSize={20}>
                {children}
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        </div>
      </div>
    </div>
  );
}
