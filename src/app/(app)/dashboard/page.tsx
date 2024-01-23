'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { ChevronDownIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { ApolloError, useQuery } from '@apollo/client';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  PostsByPublicationQuery,
  PostsByPublicationQueryVariables,
  PostsByPublicationDocument,
  PageByPublicationDocument,
  PostFullFragment,
  PublicationFragment,
  SinglePostByPublicationDocument,
  SlugPostsByPublicationDocument,
  SinglePostByPublicationQuery,
  StaticPageFragment,
} from '../../../../generated/graphql';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { MenuIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import client from '@/lib/apolloClient';
import { MessageSchema } from '@/schemas/messageSchema';

function UserDashboard() {
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
      const url = new URL(data.blogUrl);
      const host = url.hostname;
      const slug = url.pathname.split('/').pop() as string;

      // Now make the GraphQL query using axios or any other method
      const response = await client.query({
        query: SinglePostByPublicationDocument,
        variables: { slug, host },
      });

      // Handle the query response
      setBlogData(response.data);
      console.log(response.data.publication?.post?.content.markdown);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const onMessageSubmit = async (data: z.infer<typeof MessageSchema>) => {
    // Logic to handle message submission
    console.log(data.message);
    // You can integrate the logic to send this message to your AI chatbot here
  };

  // Render the full post details
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
          </ResizablePanel>

          <ResizableHandle />
          {/* Main Content Area */}
          <ResizablePanel defaultSize={80} minSize={20}>
            <ResizablePanelGroup direction="horizontal">
              {/* Blog Loader Section */}
              <ResizablePanel defaultSize={33} minSize={15}>
                <section
                  className="flex flex-col w-full p-4 border-r"
                  style={{ height: 'calc(100vh - 9rem)' }}
                >
                  <h2 className="text-lg font-semibold mb-4">Blog Entry</h2>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
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
                      <Button type="submit">Load Blog</Button>
                    </form>
                  </Form>

                  {blogData && (
                    <div className="flex flex-grow overflow-hidden">
                      {' '}
                      {/* Wrapper to take remaining space */}
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
              </ResizablePanel>

              <ResizableHandle />

              {/* AI Chat Section */}
              <ResizablePanel defaultSize={67} minSize={15}>
                <section
                  className="w-full p-4 flex flex-col"
                  style={{ height: 'calc(100vh - 9rem)' }}
                >
                  <h2 className="text-lg font-semibold mb-4">AI Chat</h2>
                  <ScrollArea className="flex-grow p-4 bg-gray-100">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div key={index} className="flex flex-col space-y-2">
                        <div className="flex items-start">
                          <span className="font-semibold">User:</span>
                          <p className="ml-2">Hello, AI!</p>
                        </div>
                        <div className="flex items-start">
                          <span className="font-semibold">AI:</span>
                          <p className="ml-2">
                            Hello, User! How can I assist you today?
                          </p>
                        </div>
                      </div>
                    ))}
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
                              <Textarea
                                {...field}
                                placeholder="Enter Message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Send Message</Button>
                    </form>
                  </Form>
                </section>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

export default UserDashboard;

// <div className="max-w-4xl mx-auto p-4 my-4">
//   <h1 className="text-3xl md:text-5xl font-bold mb-8">
//     {fullPostData?.publication?.post?.title}
//   </h1>
//   {fullPostData?.publication?.post?.content.markdown && (
//     <ReactMarkdown>
//       {fullPostData.publication.post.content.markdown}
//     </ReactMarkdown>
//   )}
//   {/* Render other details of the full post */}
// </div>
// <div className="flex flex-col h-screen">
//   <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
//     <h1 className="text-2xl font-bold">Blog Importer</h1>
//   </header>

//   <main className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900 flex justify-center">
//     <div className="w-full max-w-4xl">
//       {' '}
//       {/* Center and set maximum width */}
//       <form className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="blog-url">Blog URL</Label>
//           <Input id="blog-url" placeholder="Enter the URL of the blog" />
//         </div>
//         <Button className="w-full" type="submit">
//           Import Blog
//         </Button>
//       </form>
//       <Collapsible className="mt-8">
//         <div className="p-4 bg-white dark:bg-gray-800 rounded-t-lg">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-bold">Blog Content</h2>
//           </div>
//           <p className="text-gray-600 dark:text-gray-400 mt-4">
//             This is a sample of the blog content.
//           </p>
//           <CollapsibleTrigger>
//             <Button className="mt-4">Read More</Button>
//           </CollapsibleTrigger>
//         </div>
//         <CollapsibleContent className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
//           {/* Additional blog content goes here */}
//           <p className="text-gray-600 dark:text-gray-400">
//             This is collapsible.
//           </p>
//         </CollapsibleContent>
//       </Collapsible>
//       <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg">
//         <h2 className="text-xl font-bold mb-4">Chat with Blog</h2>
//         <div className="flex flex-col space-y-4">{/* Chat content */}</div>
//         <form className="mt-4 flex space-x-2">
//           <Input
//             className="flex-1"
//             placeholder="Type your message here..."
//           />
//           <Button type="submit" onClick={async ()=>{
//             await axios.post<ApiResponse>(
//               '/api/embed'
//             );
//           }}>Send</Button>
//         </form>
//       </div>
//     </div>
//   </main>
// </div>
