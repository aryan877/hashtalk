'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { PersonalTokenSchema } from '@/schemas/personalTokenSchema';
import { PatTokenApiResponse, StandardApiResponse } from '@/types/ApiResponse';
import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useMutation,
  useQueryClient,
  useQuery as useReactQuery,
} from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { skip } from 'node:test';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
// import {
//   PostsByPublicationDocument,
//   PostsByPublicationQuery,
//   PostsByPublicationQueryVariables,
//   Docuent
// } from '../../../../../generated/graphql';

function Settings() {
  const [showToken, setShowToken] = useState(false);
  const { data: patData, isLoading: isLoadingPAT } = useReactQuery<
    PatTokenApiResponse,
    Error
  >({
    queryKey: ['pat'],
    queryFn: () => axios.get('/api/pat').then((response) => response.data),
  });

  const messageForm = useForm<z.infer<typeof PersonalTokenSchema>>({
    resolver: zodResolver(PersonalTokenSchema),
  });

  const mutation = useMutation<
    AxiosResponse<StandardApiResponse>,
    Error,
    z.infer<typeof PersonalTokenSchema>
  >({
    mutationFn: (tokenData) => axios.post(`/api/pat`, tokenData),
    onSuccess: async (response) => {
      toast({
        title: 'Success',
        description: response.data.message,
      });
    },
    onError: (error) => {
      toast({
        title: 'Something went wrong',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // // Fetch the slug of the first post
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

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitted },
  } = messageForm;

  const handleFormSubmit = (data: z.infer<typeof PersonalTokenSchema>) => {
    mutation.mutate({ token: data.token });
    reset({ token: '' });
  };
  const toggleShowToken = () => setShowToken(!showToken);

  return (
    <main
      style={{ height: 'calc(100vh - 5rem)' }}
      className="overflow-y-auto flex flex-col py-12 bg-gray-50 sm:px-6 lg:px-8 dark:bg-gray-900"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Personal Access Token</CardTitle>
          <CardDescription>
            Enter your personal access token below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLoadingPAT && patData?.patToken ? (
            <div>
              <Label>Token</Label>
              <div className="flex items-center">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={patData.patToken}
                  readOnly
                />
                <Button
                  className="ml-4"
                  variant="ghost"
                  onClick={toggleShowToken}
                >
                  {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </div>
            </div>
          ) : (
            <Form {...messageForm}>
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6 mt-4"
              >
                <FormField
                  control={control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Hashnode PAT</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="token"
                          placeholder="Enter your access token"
                        />
                      </FormControl>
                      {isSubmitted && errors.token && (
                        <FormMessage>{errors.token.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      <Card className="w-full max-w-md mt-8">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>Here are your user details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <p className="text-gray-700 dark:text-gray-300" id="id">
              123456
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <p className="text-gray-700 dark:text-gray-300" id="username">
              john_doe
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <p className="text-gray-700 dark:text-gray-300" id="name">
              John Doe
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <p className="text-gray-700 dark:text-gray-300" id="bio">
              Software developer with a passion for open source.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default Settings;
