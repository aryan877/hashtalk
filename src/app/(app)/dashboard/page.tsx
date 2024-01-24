'use client';

import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast, useToast } from '@/components/ui/use-toast';
import client from '@/lib/apolloClient';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { MessageSchema } from '@/schemas/messageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { ApolloError, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { ChevronDownIcon, Loader2, MenuIcon, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { z } from 'zod';
import {
  PageByPublicationDocument,
  PostFullFragment,
  PostsByPublicationDocument,
  PostsByPublicationQuery,
  PostsByPublicationQueryVariables,
  PublicationFragment,
  SinglePostByPublicationDocument,
  SinglePostByPublicationQuery,
  SinglePostByPublicationQueryVariables,
  SlugPostsByPublicationDocument,
  StaticPageFragment,
} from '../../../../generated/graphql';
import ChatHistory from '../components/ChatHistory';
import BlogLoaderSection from '../components/BlogLoaderSection';
import AIChatSection from '../components/AIChatSection';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';

function ChatDashboard() {
  // const [error, setError] = useState<ApolloError | undefined>(undefined);
  const [blogData, setBlogData] = useState<SinglePostByPublicationQuery | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApolloError>();
  const router = useRouter();

  // Fetch the slug of the first post
  // const {
  //   data: postsData,
  //   loading: postsLoading,
  //   error: postsError,
  // } = useQuery<PostsByPublicationQuery, PostsByPublicationQueryVariables>(
  //   PostsByPublicationDocument,
  //   { variables: { host: 'aryan877.hashnode.dev', first: 1 } }
  // );

  // Extract slug from the first post
  // const firstPostSlug = postsData?.publication?.posts.edges[0]?.node?.slug;

  // Fetch full post details using the slug
  // const {
  //   data: fullPostData,
  //   loading: fullPostLoading,
  //   error: fullPostError,
  // } = useQuery(SinglePostByPublicationDocument, {
  //   variables: { slug: firstPostSlug as string, host: 'aryan877.hashnode.dev' },
  //   skip: !firstPostSlug,
  // });

  // if (fullPostLoading || postsLoading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;

  const onSubmit = async (data: z.infer<typeof BlogUrlSchema>) => {
    try {
      setLoading(true);

      // Validate the data first
      const validationResult = BlogUrlSchema.safeParse(data);
      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.error);
        setLoading(false);
        return;
      }

      // Extract blog URL components
      const url = new URL(data.blogUrl);
      const host = url.hostname;
      const slug = url.pathname.split('/').pop() as string;

      toast({
        title: 'Loading Blog Data',
        description: 'Fetching blog post from Hashnode.',
      });

      // GraphQL query
      const response = await client.query<
        SinglePostByPublicationQuery,
        SinglePostByPublicationQueryVariables
      >({
        query: SinglePostByPublicationDocument,
        variables: { slug, host },
      });

      setBlogData(response.data);

      // Extracting message from the GraphQL response
      const blogTitle = response.data.publication?.post?.title;
      const blogSubtitle = response.data.publication?.post?.subtitle;
      const blogPublishDate = response.data.publication?.post?.publishedAt;
      const markdown = response.data.publication?.post?.content.markdown;

      const generateEmbeddingsToast = toast({
        title: 'Please wait...',
        description: 'Generating embeddings for the blog post.',
      });

      const chatCreationResponse = await axios.post<ApiResponse>('api/embed', {
        markdown,
        blogUrl: data.blogUrl,
        blogTitle,
        blogSubtitle,
        blogPublishDate,
      });

      router.push(
        `/dashboard/chat/${chatCreationResponse.data.conversationId}`
      );

      generateEmbeddingsToast.dismiss();
    } catch (err) {
      console.error('Error:', err);
      setError(err as ApolloError);
      toast({
        title: 'Error',
        description: error?.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onMessageSubmit = async (data: z.infer<typeof MessageSchema>) => {
    //chat with ai
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      {/* Blog Loader Section */}
      <ResizablePanel defaultSize={33} minSize={15}>
        <BlogLoaderSection
          blogData={blogData}
          onSubmit={onSubmit}
          loading={loading}
        />
      </ResizablePanel>

      <ResizableHandle />

      {/* AI Chat Section */}
      <ResizablePanel defaultSize={67} minSize={15}>
        <AIChatSection onMessageSubmit={onMessageSubmit} chatEnabled={false} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default ChatDashboard;
