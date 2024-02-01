/* eslint-disable @next/next/no-img-element */
import BlogCard from '@/app/(app)/components/BlogCard';
import { MarkdownToHtml } from '@/app/(app)/components/MarkdownToHtml';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LockIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Conversation } from '@/model/Conversation';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { CommentSchema } from '@/schemas/commentSchema';
import { MessageSchema } from '@/schemas/messageSchema';
import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { Clipboard, MoreVertical, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Comment,
  AddCommentDocument,
  AddCommentInput,
  AddCommentMutation,
  AddCommentMutationVariables,
  AddCommentPayload,
  MeDocument,
  MeQuery,
  MeQueryVariables,
  PostCommentEdge,
  RemoveCommentDocument,
  RemoveReplyDocument,
  SinglePostByPublicationDocument,
  SinglePostByPublicationQuery,
  SinglePostByPublicationQueryVariables,
} from '../../../../../../generated/graphql';
import LikeBlogButton from '@/app/(app)/components/LikeBlogButton';
import { useToken } from '@/context/TokenContext';
dayjs.extend(advancedFormat);

interface LoadedBlogProps {
  conversation: Conversation | undefined;
  isLoading: boolean;
}

const LoadedBlog: React.FC<LoadedBlogProps> = ({ conversation, isLoading }) => {
  const [post, setPost] = useState<SinglePostByPublicationQuery | null>(null);
  const { token } = useToken();

  const { toast } = useToast(); // Use toast for notifications

  const commentForm = useForm<z.infer<typeof CommentSchema>>({
    resolver: zodResolver(CommentSchema),
  });

  // Fetch me
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery<MeQuery, MeQueryVariables>(MeDocument, {});

  const [addComment, { loading: addingComment, error: addCommentError }] =
    useMutation(AddCommentDocument);
  let slug: string = '';
  let host: string = '';

  if (conversation?.blogUrl) {
    const url = new URL(conversation.blogUrl);
    host = url.host;
    slug = url.pathname.substring(1);
  }

  const [
    removeComment,
    { loading: removingComment, error: removeCommentError },
  ] = useMutation(RemoveCommentDocument);

  const [removeReply, { loading: removingReply, error: removeReplyError }] =
    useMutation(RemoveReplyDocument);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitted },
  } = commentForm;

  const handleFormSubmit = async (data: z.infer<typeof CommentSchema>) => {
    try {
      const response = await addComment({
        variables: {
          input: {
            postId: fullPostData?.publication?.post?.id as string,
            contentMarkdown: data.comment,
          },
        },
      });

      // Assuming 'response.data.addComment.comment' is the added comment object
      if (response.data?.addComment.comment) {
        handleCommentAdded(response.data.addComment.comment);
      }

      toast({
        title: 'Comment Added!',
        description: 'Your comment has been successfully added.',
      });
      reset({ comment: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error posting your comment.',
      });
    }
  };

  const handleCommentAdded = (
    newComment: AddCommentMutation['addComment']['comment']
  ) => {
    setPost((prevPost) => {
      if (
        !prevPost ||
        !prevPost.publication ||
        !prevPost.publication.post ||
        !prevPost.publication.post.comments
      ) {
        return null;
      }

      const newCommentEdge: PostCommentEdge = {
        __typename: 'PostCommentEdge',
        node: newComment as Comment,
        cursor: '',
      };

      // Append the new comment edge
      const updatedComments = [
        ...prevPost.publication.post.comments.edges,
        newCommentEdge,
      ];

      // Create an updated post object with the new comments
      const updatedPost: SinglePostByPublicationQuery = {
        ...prevPost,
        publication: {
          ...prevPost.publication,
          post: {
            ...prevPost.publication.post,
            comments: {
              ...prevPost.publication.post.comments,
              edges: updatedComments,
            },
          },
        },
      };

      return updatedPost;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'URL Copied!',
      description: 'Blog URL has been copied to clipboard.',
    });
  };

  // Fetch full post details using the extracted slug and host
  const {
    data: fullPostData,
    loading: fullPostLoading,
    error: fullPostError,
  } = useQuery<
    SinglePostByPublicationQuery,
    SinglePostByPublicationQueryVariables
  >(SinglePostByPublicationDocument, {
    variables: {
      slug,
      host,
      userIds: meData?.me?.id ? [meData.me.id] : undefined,
    },
    skip: !meData?.me?.id,
  });

  console.log(fullPostData);

  // Update state when query data changes
  useEffect(() => {
    if (fullPostData) {
      setPost(fullPostData);
    }
  }, [fullPostData]);

  // Function to update state when a comment is deleted
  const handleCommentDeleted = (deletedCommentId: string) => {
    setPost((prevPost) => {
      if (
        !prevPost ||
        !prevPost.publication ||
        !prevPost.publication.post ||
        !prevPost.publication.post.comments
      ) {
        return null;
      }

      const updatedComments = prevPost.publication.post.comments.edges.filter(
        (comment) => comment.node.id !== deletedCommentId
      );

      return {
        ...prevPost,
        publication: {
          ...prevPost.publication,
          post: {
            ...prevPost.publication.post,
            comments: {
              ...prevPost.publication.post.comments,
              edges: updatedComments,
            },
          },
        },
      };
    });
  };

  // Function to update state when a reply is deleted
  const handleReplyDeleted = (commentId: string, deletedReplyId: string) => {
    setPost((prevPost) => {
      if (
        !prevPost ||
        !prevPost.publication ||
        !prevPost.publication.post ||
        !prevPost.publication.post.comments
      ) {
        return null;
      }

      const updatedComments = prevPost.publication.post.comments.edges.map(
        (comment) => {
          // Check for the comment to update
          if (comment.node.id === commentId) {
            // Filter out the deleted reply
            const updatedReplies = comment.node.replies.edges.filter(
              (reply) => reply.node.id !== deletedReplyId
            );

            return {
              ...comment,
              node: {
                ...comment.node,
                replies: {
                  ...comment.node.replies,
                  edges: updatedReplies,
                },
              },
            };
          }
          return comment;
        }
      );

      return {
        ...prevPost,
        publication: {
          ...prevPost.publication,
          post: {
            ...prevPost.publication.post,
            comments: {
              ...prevPost.publication.post.comments,
              edges: updatedComments,
            },
          },
        },
      };
    });
  };

  // Delete comment function
  const deleteComment = async (id: string) => {
    try {
      await removeComment({
        variables: { input: { id } },
      });
      handleCommentDeleted(id);
      toast({
        title: 'Comment Removed!',
        description: 'Your comment has been successfully removed.',
      });
      reset({ comment: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error removing your comment.',
      });
    }
  };

  // Delete reply function
  const deleteReply = async (commentId: string, replyId: string) => {
    try {
      await removeReply({
        variables: {
          input: {
            commentId,
            replyId,
          },
        },
      });
      handleReplyDeleted(commentId, replyId);
      toast({
        title: 'Comment Removed!',
        description: 'Your comment has been successfully removed.',
      });
      reset({ comment: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error removing your comment.',
      });
    }
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
            <div className="flex items-center mb-4 gap-2">
              {/* Input and Copy Button Container */}
              <div className="flex items-center">
                <Input
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

              {/* Comments Button */}

              {post?.publication?.post && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="ml-2">Comments</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Comments</DialogTitle>
                      </DialogHeader>

                      {post?.publication?.post?.comments.edges &&
                      post?.publication?.post?.comments.edges.length > 0 ? (
                        <div className="overflow-y-auto h-72 p-4 bg-gray-800 text-gray-300">
                          {post?.publication?.post?.comments.edges.map(
                            (edge) => (
                              <div
                                key={edge.node.id}
                                className="mb-6 last:mb-0"
                              >
                                {/* Comment Section */}
                                <div className="mb-4">
                                  {/* Comment Author's Information */}
                                  <div className="flex items-center mb-2">
                                    {edge.node.author.profilePicture && (
                                      <img
                                        src={edge.node.author.profilePicture}
                                        alt={edge.node.author.name}
                                        className="w-10 h-10 rounded-full mr-2 border border-gray-700"
                                      />
                                    )}
                                    <div>
                                      <div className="font-semibold text-white">
                                        {edge.node.author.name}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        @{edge.node.author.username}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Comment Content */}
                                  <div className="bg-gray-300 p-3 rounded-lg">
                                    <MarkdownToHtml
                                      contentMarkdown={
                                        edge.node.content.markdown
                                      }
                                    />
                                  </div>

                                  {/* Reactions and Other Info */}
                                  <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                                    <span>
                                      {edge.node.totalReactions} Reactions
                                    </span>
                                    <span>
                                      {dayjs(edge.node.dateAdded).format(
                                        'Do MMM YY, h:mm A'
                                      )}
                                    </span>
                                    {edge.node.author.username ===
                                      meData?.me.username && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button aria-label="Options">
                                            <MoreVertical size={16} />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem
                                            disabled={removingComment}
                                            onSelect={() => {
                                              deleteComment(edge.node.id);
                                            }}
                                          >
                                            Delete
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onSelect={() => {
                                              /* handle edit */
                                            }}
                                          >
                                            Edit
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>

                                {/* Replies Section */}
                                {edge.node.replies?.edges.length > 0 && (
                                  <div className="ml-10">
                                    {edge.node.replies?.edges.map((reply) => (
                                      <div
                                        key={reply.node.id}
                                        className="mb-4 last:mb-0"
                                      >
                                        {/* Reply Author's Information */}
                                        <div className="flex items-center mb-2">
                                          {reply.node.author.profilePicture && (
                                            <img
                                              src={
                                                reply.node.author.profilePicture
                                              }
                                              alt={reply.node.author.name}
                                              className="w-8 h-8 rounded-full mr-2 border border-gray-600"
                                            />
                                          )}
                                          <div>
                                            <div className="font-semibold text-white">
                                              {reply.node.author.name}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                              @{reply.node.author.username}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Reply Content */}
                                        <div className="bg-gray-300 p-3 rounded-lg">
                                          <MarkdownToHtml
                                            contentMarkdown={
                                              reply.node.content.markdown
                                            }
                                          />
                                        </div>

                                        {/* Reactions and Other Info */}
                                        <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                                          <span>
                                            {reply.node.totalReactions}{' '}
                                            Reactions
                                          </span>
                                          <span>
                                            {dayjs(reply.node.dateAdded).format(
                                              'Do MMM YY, h:mm A'
                                            )}
                                          </span>
                                          {reply.node.author.username ===
                                            meData?.me.username && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button aria-label="Options">
                                                  <MoreVertical size={16} />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent>
                                                <DropdownMenuItem
                                                  disabled={removingReply}
                                                  onSelect={() => {
                                                    /* handle delete */
                                                    deleteReply(
                                                      edge.node.id,
                                                      reply.node.id
                                                    );
                                                  }}
                                                >
                                                  Delete
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                  onSelect={() => {
                                                    /* handle edit */
                                                  }}
                                                >
                                                  Edit
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p>No comments yet...</p>
                      )}

                      <DialogFooter>
                        <Form {...commentForm}>
                          <form
                            onSubmit={handleSubmit(handleFormSubmit)}
                            className="flex items-end space-x-2 w-full"
                          >
                            <FormField
                              control={control}
                              name="comment"
                              render={({ field }) => (
                                <div className="flex-grow">
                                  <FormItem>
                                    <FormLabel>Comment</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        {...field}
                                        placeholder="Enter comment"
                                      />
                                    </FormControl>
                                    {isSubmitted && errors.comment && (
                                      <FormMessage>
                                        {errors.comment.message}
                                      </FormMessage>
                                    )}
                                  </FormItem>
                                </div>
                              )}
                            />
                            <Button
                              type="submit"
                              disabled={isLoading || addingComment}
                              className="flex-shrink-0"
                            >
                              Comment
                            </Button>
                          </form>
                        </Form>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <LikeBlogButton
                    postId={post?.publication?.post?.id}
                    totalReactions={post?.publication?.post?.reactionCount ?? 0}
                    myReactions={
                      post?.publication?.post?.likedBy?.edges[0]
                        ?.reactionCount ?? 0
                    }
                  />
                </>
              )}
              {!token && (
                <Button variant="outline">
                  <LockIcon className="h-4 w-4 mr-2" />
                  Add PAT token to Unlock
                </Button>
              )}
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
            readTime={post?.publication?.post?.readTimeInMinutes}
          />
        </>
      ) : (
        <div>No data available.</div>
      )}
    </section>
  );
};

export default LoadedBlog;
