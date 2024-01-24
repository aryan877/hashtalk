'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { GetChatsApiResponse, StandardApiResponse } from '@/types/ApiResponse';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MenuIcon } from 'lucide-react';
import { Conversation } from '@/model/Conversation';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface ChatHistoryProps {
  chats: Conversation[] | undefined;
  isLoading: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chats, isLoading }) => {
  const pathname = usePathname();
  const params = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleDeleteChat = async (chatId: string) => {
    try {
      await axios.delete<StandardApiResponse>(`/api/delete-chat/${chatId}`);
      toast({
        title: 'Chat Deleted',
        description: 'The chat has been successfully deleted.',
      });

      // Get the current data in the cache for 'getChats'
      const currentChats = queryClient.getQueryData<GetChatsApiResponse>([
        'getChats',
      ]) as GetChatsApiResponse;

      // Filter out the deleted chat
      const updatedChats =
        currentChats?.conversations.filter((chat) => chat._id !== chatId) || [];

      // Update the cache with the new array of chats
      queryClient.setQueryData<GetChatsApiResponse>(['getChats'], {
        ...currentChats,
        conversations: updatedChats,
      });

      if (params.id && params.id === chatId) {
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error deleting the chat.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section
      className="w-full p-4 border-r flex flex-col"
      style={{ height: 'calc(100vh - 9rem)' }}
    >
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Chat History</h1>
        <Link
          href="/dashboard"
          onClick={() => {
            if (pathname === '/dashboard') {
              toast({
                title: 'Ready to Start Chat',
                description:
                  'Please enter a blog URL to begin a new chat session.',
              });
            }
          }}
        >
          <Button variant="outline">New Chat</Button>
        </Link>
      </header>
      <div className="h-full overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading Chats...</p>
          </div>
        ) : chats && chats.length > 0 ? (
          <div className="space-y-4 p-4">
            {chats.map((chat) => (
              <Card
                key={chat._id}
                className="p-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Link href={`/dashboard/chat/${chat._id}`} passHref>
                  <div className="flex flex-col gap-2 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <h2
                        className="text-lg font-bold flex-1 pr-2"
                        style={{
                          maxWidth: 'calc(100% - 40px)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {chat.blogTitle}
                      </h2>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MenuIcon className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleDeleteChat(chat._id)}
                          >
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p
                      className="text-sm text-gray-500 dark:text-gray-400"
                      style={{
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {chat.blogSubtitle.substring(0, 50)}...
                    </p>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p>No Chat History.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatHistory;
