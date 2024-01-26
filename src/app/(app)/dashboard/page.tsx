'use client';

import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { toast, useToast } from '@/components/ui/use-toast';
import client from '@/lib/apolloClient';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { MessageSchema } from '@/schemas/messageSchema';
import {
  ConversationApiResponse,
  ConversationsApiResponse,
} from '@/types/ApiResponse';
import { ApolloError, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { ChevronDownIcon, Loader2, MenuIcon, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import AIChatSection from '../components/AIChatSection';
import BlogLoaderSection from '../components/BlogLoaderSection';
import ChatHistory from '../components/ChatHistory';

function ChatDashboard() {
  // const [error, setError] = useState<ApolloError | undefined>(undefined);
  const [blogData, setBlogData] = useState<SinglePostByPublicationQuery | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApolloError>();
  const router = useRouter();

  const queryClient = useQueryClient();

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
      const markdown = response.data.publication?.post?.content.html;
      const coverImage = response.data.publication?.post?.coverImage?.url;
      const tags =
        response.data.publication?.post?.tags?.map((tag) => tag.name) ?? [];

      const generateEmbeddingsToast = toast({
        title: 'Preparing Your Chat Session',
        description: 'Please hold on a moment...',
      });

      const chatCreationResponse = await axios.post<ConversationApiResponse>(
        'api/embed',
        {
          markdown,
          blogUrl: data.blogUrl,
          blogTitle,
          blogSubtitle,
          blogPublishDate,
          coverImage,
          tags,
        }
      );

      router.push(
        `/dashboard/chat/${chatCreationResponse.data.conversation._id}`
      );

      const currentChats = queryClient.getQueryData<ConversationsApiResponse>([
        'getChats',
      ]);

      if (currentChats && currentChats.conversations) {
        queryClient.setQueryData<ConversationsApiResponse>(['getChats'], {
          ...currentChats,
          conversations: [
            ...currentChats.conversations,
            chatCreationResponse.data.conversation,
          ],
        });
      }

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
          isLoading={loading}
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
