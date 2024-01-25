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
import { Card, CardTitle} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { SinglePostByPublicationQuery } from '../../../../generated/graphql';

interface BlogLoaderSectionProps {
  blogData: SinglePostByPublicationQuery | null;
  onSubmit: (data: any) => void; // Define the correct type for data
  isLoading: boolean;
}

const BlogLoaderSection: React.FC<BlogLoaderSectionProps> = ({
  blogData,
  onSubmit,
  isLoading
}) => {
  const form = useForm<z.infer<typeof BlogUrlSchema>>({
    resolver: zodResolver(BlogUrlSchema),
  });

  return (
    <section
      className="flex flex-col w-full p-4 border-r"
      style={{ height: 'calc(100vh - 9rem)' }}
    >
      <h2 className="text-lg font-semibold mb-4">Blog Entry</h2>
      {<Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <Button type="submit" disabled={isLoading}>Load Blog</Button>
        </form>
      </Form>}

      {blogData && (
        <div className="flex flex-grow overflow-hidden">
          <Card className="flex flex-col w-full my-4 p-4 overflow-y-auto">
            <CardTitle className="mb-4">
              {blogData?.publication?.post?.title}
            </CardTitle>
            <ReactMarkdown className="flex-grow">
              {blogData?.publication?.post?.content.markdown}
            </ReactMarkdown>
          </Card>
        </div>
      )}
    </section>
  );
};

export default BlogLoaderSection;
