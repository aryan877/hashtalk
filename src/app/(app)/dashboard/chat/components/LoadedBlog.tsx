/* eslint-disable @next/next/no-img-element */
import BlogCard from '@/app/(app)/components/BlogCard';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Conversation } from '@/model/Conversation';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Clipboard } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
dayjs.extend(advancedFormat);

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
      style={{ height: 'calc(100vh - 5rem)' }}
    >
      <h2 className="text-lg font-semibold mb-4">Blog Entry</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          Loading...
        </div>
      ) : conversation ? (
        <>
          <div className="mb-4">
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
          </div>
          <BlogCard
            title={conversation.blogTitle}
            subtitle={conversation.blogSubtitle}
            contentMarkdown={conversation.markdown}
            coverImage={conversation.coverImage}
            tags={conversation.tags}
            publishedOn={dayjs(conversation.blogPublishDate).format(
              'Do MMM YY, h:mm A'
            )}
          />
        </>
      ) : (
        <div>No data available.</div>
      )}
    </section>
  );
};

export default LoadedBlog;
