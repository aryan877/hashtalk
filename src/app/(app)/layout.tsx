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
import React, { useContext, useEffect } from 'react';
import { fetchTokenFromDatabase } from '@/lib/fetchTokenFromDatabase';

import ChatHistory from './components/ChatHistory';
import { useToken } from '@/context/TokenContext';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const { setToken } = useToken();

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await fetchTokenFromDatabase();
      setToken(fetchedToken);
    };

    fetchToken();
  }, [setToken]);

  return (
    <>
      <div>
        <Navbar />
        <div className="mt-20">
          <div style={{ height: 'calc(100vh - 5rem)' }}>{children}</div>
        </div>
      </div>
    </>
  );
}
