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
import { useToast } from '@/components/ui/use-toast';
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

function ChatDashboard() {
  // const [error, setError] = useState<ApolloError | undefined>(undefined);
  const [blogData, setBlogData] = useState<SinglePostByPublicationQuery | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  // Fetch the slug of the first post
  // const {
  //   data: postsData,
  //   loading: postsLoading,
  //   error: postsError,
  // } = useQuery<PostsByPublicationQuery, PostsByPublicationQueryVariables>(
  //   PostsByPublicationDocument,
  //   { variables: { host: 'aryan877.hashnode.dev', first: 1 } }
  // );

  const form = useForm<z.infer<typeof BlogUrlSchema>>({
    resolver: zodResolver(BlogUrlSchema),
  });

  const messageForm = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
  });

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
      const message = response.data.publication?.post?.content.markdown;
      console.log('Sending message:', message);

      // Sending message to chatbot API
      const chatbotResponse = await axios.post<ApiResponse>('api/embed', {
        message,
      });

      console.log('Chatbot response:', chatbotResponse.data.message);
    } catch (error) {
      console.error('Error:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const onMessageSubmit = async (data: z.infer<typeof MessageSchema>) => {
    //chat with ai
  };

  return (
    <div style={{ height: 'calc(100vh - 5rem)' }}>
      <header className="flex items-center justify-between px-8 h-16 bg-gray-800 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-lg font-semibold">AI Dashboard</h1>
          <nav className="flex gap-4">
            <Link className="hover:underline" href="#">
              Importer
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat History - Sidebar */}
          <ResizablePanel defaultSize={20} minSize={10} maxSize={20}>
            <ChatHistory/>
          </ResizablePanel>

          <ResizableHandle />
          {/* Main Content Area */}
          <ResizablePanel defaultSize={80} minSize={20}>
            <ResizablePanelGroup direction="horizontal">
              {/* Blog Loader Section */}
              <ResizablePanel defaultSize={33} minSize={15}>
                <BlogLoaderSection blogData={blogData} onSubmit={onSubmit}/>
              </ResizablePanel>

              <ResizableHandle />

              {/* AI Chat Section */}
              <ResizablePanel defaultSize={67} minSize={15}>
                <AIChatSection onMessageSubmit={onMessageSubmit}/>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

export default ChatDashboard;
