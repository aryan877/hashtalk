import React from 'react';
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

interface AIChatSectionProps {
  onMessageSubmit: (data: any) => void; // Define the correct type for data
}

const AIChatSection: React.FC<AIChatSectionProps> = ({ onMessageSubmit }) => {
  const messageForm = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
  });

  return (
    <section
      className="w-full p-4 flex flex-col"
      style={{ height: 'calc(100vh - 9rem)' }}
    >
      <h2 className="text-lg font-semibold mb-4">AI Chat</h2>
      <ScrollArea className="flex-grow p-4 bg-gray-100">
        {/* Display chat messages here */}
      </ScrollArea>
      <Form {...messageForm}>
        <form
          onSubmit={messageForm.handleSubmit(onMessageSubmit)}
          className="space-y-6 mt-4"
        >
          <FormField
            control={messageForm.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Message</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Enter Message" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send Message</Button>
        </form>
      </Form>
    </section>
  );
};

export default AIChatSection;
