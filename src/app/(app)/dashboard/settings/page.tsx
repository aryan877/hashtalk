'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { skip } from 'node:test';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  MeDocument,
  MeQuery,
  MeQueryVariables,
} from '../../../../../generated/graphql';

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

  // Fetch me
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery<MeQuery, MeQueryVariables>(MeDocument, {});

  console.log(meData);

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
    <>
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
            {isLoadingPAT ? (
              <p>Fetching user data...</p>
            ) : patData?.patToken ? (
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
                <AlertDialog>
                  <AlertDialogTrigger>
                    {' '}
                    <Button className="mt-4" variant="destructive">
                      Delete Token
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your token and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
        {patData?.patToken && (
          <Card className="w-full max-w-md mt-8">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Here are your user details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <Avatar>
                  <AvatarImage
                    src={meData?.me.profilePicture as string}
                    alt={`@${meData?.me.username}`}
                  />
                  <AvatarFallback>{meData?.me.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <p className="text-gray-700" id="username">
                  {meData?.me.username}
                </p>

                <Label htmlFor="name">Name</Label>
                <p className="text-gray-700" id="name">
                  {meData?.me.name}
                </p>

                <Label htmlFor="bio">Bio</Label>
                <p className="text-gray-700" id="bio">
                  {meData?.me.bio?.text}
                </p>

                <Label htmlFor="tagline">Tagline</Label>
                <p className="text-gray-700" id="tagline">
                  {meData?.me.tagline}
                </p>

                <Label htmlFor="dateJoined">Date Joined</Label>
                <p className="text-gray-700" id="dateJoined">
                  {dayjs(meData?.me.dateJoined).format('DD MMM YY, h:mm A')}
                </p>
                <Label htmlFor="location">Location</Label>
                <p className="text-gray-700" id="location">
                  {meData?.me.location}
                </p>
              </div>

              {/* Social Media Links */}
              <div className="space-y-2">
                <Label>Social Media Links</Label>
                <div className="flex flex-col space-y-1">
                  {Object.entries(meData?.me.socialMediaLinks || {}).map(
                    ([key, value]) =>
                      key !== '__typename' &&
                      value && (
                        <a
                          href={value as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                          key={key}
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}{' '}
                        </a>
                      )
                  )}
                </div>
              </div>

              {/* Follower Counts */}
              <div className="flex justify-between">
                <div>
                  <Label htmlFor="followersCount">Followers</Label>
                  <p className="text-gray-700" id="followersCount">
                    {meData?.me.followersCount}
                  </p>
                </div>
                <div>
                  <Label htmlFor="followingsCount">Following</Label>
                  <p className="text-gray-700" id="followingsCount">
                    {meData?.me.followingsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

export default Settings;
