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
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SinglePostByPublicationQuery } from '../../../../generated/graphql';
import BlogCard from './BlogCard';
import { useToken } from '@/context/TokenContext';
import { LockIcon } from 'lucide-react';

interface BlogLoaderSectionProps {
  blogData: SinglePostByPublicationQuery | null;
  onSubmit: (data: any) => void; // Define the correct type for data
  isLoading: boolean;
}

const BlogLoaderSection: React.FC<BlogLoaderSectionProps> = ({
  blogData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<z.infer<typeof BlogUrlSchema>>({
    resolver: zodResolver(BlogUrlSchema),
  });

  const { token } = useToken();

  return (
    <section
      className="flex flex-col w-full p-4 border-r"
      style={{ height: 'calc(100vh - 5rem)' }}
    >
      <h2 className="text-lg font-semibold mb-4">Blog Entry</h2>
      {
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mb-4"
          >
            <FormField
              control={form.control}
              name="blogUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blog URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter blog URL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!token || isLoading} type="submit">
              {token ? (
                'Load Blog'
              ) : (
                <>
                  <LockIcon className="h-4 w-4 mr-2" />
                  Add PAT token to Unlock
                </>
              )}
            </Button>
          </form>
        </Form>
      }
      <BlogCard
        title={blogData?.publication?.post?.title}
        subtitle={blogData?.publication?.post?.subtitle as string}
        contentMarkdown={
          blogData?.publication?.post?.content?.markdown as string
        }
        coverImage={blogData?.publication?.post?.coverImage?.url as string}
        tags={blogData?.publication?.post?.tags?.map((tag) => tag.name)}
      />
    </section>
  );
};

export default BlogLoaderSection;
