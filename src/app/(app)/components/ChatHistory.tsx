import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MenuIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatHistory = () => {
  return (
    <section
      className="w-full p-4 border-r flex flex-col"
      style={{ height: 'calc(100vh - 9rem)' }}
    >
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Chat History</h1>
        <Button variant="outline">New Chat</Button>
      </header>
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {Array.from({ length: 14 }, (_, index) => (
            <Card
              key={index}
              className="p-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-bold">Chat with Alice</h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MenuIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem>Delete Chat</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last message: Hi there!
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

export default ChatHistory;
