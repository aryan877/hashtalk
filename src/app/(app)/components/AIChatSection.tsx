import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { MessageSchema } from '@/schemas/messageSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IMessage } from '@/model/Message';
import { TemporaryIMessage } from '../dashboard/chat/[id]/page';

interface AIChatSectionProps {
  onMessageSubmit: (data: z.infer<typeof MessageSchema>) => void;
  chatEnabled?: boolean;
  messages?: IMessage[] | TemporaryIMessage[];
  isLoading?: boolean;
  isLoadingAIMessage?: boolean;
}

const AIChatSection: React.FC<AIChatSectionProps> = ({
  onMessageSubmit,
  chatEnabled = true,
  messages,
  isLoading,
  isLoadingAIMessage,
}) => {
  const messageForm = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitted },
  } = messageForm;

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(handleFormSubmit)();
    }
  };
  const handleFormSubmit = (data: z.infer<typeof MessageSchema>) => {
    onMessageSubmit(data);
    reset({ userMessage: '' }); 
  };

  return (
    <section
      className="w-full p-4 flex flex-col"
      style={{ height: 'calc(100vh - 9rem)' }}
    >
      <h2 className="text-lg font-semibold mb-4">AI Chat</h2>
      <div className="flex-grow overflow-auto p-4 pb-8 bg-gray-200">
        {isLoading ? (
          <div>Loading chats...</div>
        ) : !chatEnabled ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-center text-gray-600">
              Enter a Hashnode blog URL to enable chat.
            </p>
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex items-end ${
                message.messageType === 'ai' ? 'justify-start' : 'justify-end'
              } space-x-2 mb-8`}
            >
              {message.messageType === 'ai' && (
                <Avatar>
                  <AvatarImage alt="AI" src="/ai-avatar.jpg" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-1/2 p-4 rounded-lg  ${
                  message.messageType === 'ai'
                    ? 'bg-gray-100'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {message.message}
              </div>
              {message.messageType === 'human' && (
                <Avatar>
                  <AvatarImage alt="User" src="/user-avatar.jpg" />
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        ) : (
          <div>No messages yet, send a chat.</div>
        )}
        {isLoadingAIMessage && <div>Generating response...</div>}
      </div>
      <Form {...messageForm}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6 mt-4"
        >
          <FormField
            disabled={!chatEnabled}
            control={control}
            name="userMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Message</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter Message"
                    onKeyDown={onKeyDown}
                  />
                </FormControl>
                {isSubmitted && errors.userMessage && (
                  <FormMessage>{errors.userMessage.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          <Button disabled={!chatEnabled} type="submit">
            Send Message
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default AIChatSection;
