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
import ChatHistory from './components/ChatHistory';

interface RootLayoutProps {
  children: React.ReactNode;
}

// Function to fetch chats
async function fetchChats() {
  const { data } = await axios.get('/api/get-chats');
  return data;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div>
      <Navbar />
      <div className="mt-20">
        <div style={{ height: 'calc(100vh - 5rem)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
