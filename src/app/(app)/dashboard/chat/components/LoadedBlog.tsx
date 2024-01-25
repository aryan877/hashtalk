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
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { Conversation } from '@/model/Conversation';
import { useToast } from '@/components/ui/use-toast';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);
import { Clipboard } from 'lucide-react';

interface LoadedBlogProps {
  conversation: Conversation | undefined;
  isLoading: boolean;
}

const LoadedBlog: React.FC<LoadedBlogProps> = ({ conversation, isLoading }) => {
  const { toast } = useToast(); // Use toast for notifications

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'URL Copied!',
      description: 'Blog URL has been copied to clipboard.',
    });
  };

  return (
    <section
      className="flex flex-col w-full p-4 border-r"
      style={{ height: 'calc(100vh - 9rem)' }}
    >
      <h2 className="text-lg font-semibold mb-4">Blog Entry</h2>
      <h2 className="text-lg font-semibold mb-4">{conversation?.blogTitle}</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          Loading...
        </div>
      ) : conversation ? (
        <>
          <div className="mb-4">
            <h3 className="text-md mb-2">{conversation.blogSubtitle}</h3>
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={conversation.blogUrl}
                disabled
                className="input input-bordered w-full p-2 mr-2"
              />
              <Button
                onClick={() => {
                  copyToClipboard(conversation.blogUrl);
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-sm mb-4">
              Published on:{' '}
              {dayjs(conversation.blogPublishDate).format('Do MMM YY, h:mm A')}
            </p>
          </div>

          <Card className="flex flex-col w-full mb-4 p-4 overflow-y-auto">
            <ReactMarkdown className="flex-grow">
              {conversation.markdown}
            </ReactMarkdown>
          </Card>
        </>
      ) : (
        <div>No data available.</div>
      )}
    </section>
  );
};

export default LoadedBlog;
