/* eslint-disable @next/next/no-img-element */
import AuthorModal from '@/app/(app)/components/AuthorModal';
import BlogCard from '@/app/(app)/components/BlogCard';
import LikeBlogButton from '@/app/(app)/components/LikeBlogButton';
import LikeCommentButton from '@/app/(app)/components/LikeCommentButton';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useToken } from '@/context/TokenContext';
import { Conversation } from '@/model/Conversation';
import { BlogUrlSchema } from '@/schemas/blogUrlSchema';
import { CommentSchema } from '@/schemas/commentSchema';
import { MessageSchema } from '@/schemas/messageSchema';
import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import {
  Clipboard,
  CornerUpLeft,
  LockIcon,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  AddCommentDocument,
  AddCommentInput,
  AddCommentMutation,
  AddCommentMutationVariables,
  AddCommentPayload,
  AddReplyDocument,
  AddReplyMutation,
  Comment,
  CommentReplyConnection,
  CommentReplyEdge,
  Edge,
  MeDocument,
  MeQuery,
  MeQueryVariables,
  PageInfo,
  PostCommentEdge,
  RemoveCommentDocument,
  RemoveReplyDocument,
  Reply,
  SinglePostByPublicationDocument,
  SinglePostByPublicationQuery,
  SinglePostByPublicationQueryVariables,
  UpdateCommentDocument,
  UpdateReplyDocument,
} from '../../../../../../generated/graphql';
dayjs.extend(advancedFormat);

interface LoadedBlogProps {
  conversation: Conversation | undefined;
  isLoading: boolean;
}

type FormMode = 'comment' | 'reply' | 'editComment' | 'editReply';

const LoadedBlog: React.FC<LoadedBlogProps> = ({ conversation, isLoading }) => {
  const [post, setPost] = useState<SinglePostByPublicationQuery | null>(null);
  const { token } = useToken();
  const [formMode, setFormMode] = useState<FormMode>('comment');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  let slug: string = '';
  let host: string = '';

  if (conversation?.blogUrl) {
    const url = new URL(conversation.blogUrl);
    host = url.host;
    slug = url.pathname.substring(1);
  }

  const { toast } = useToast();

  // Form Handling Logic
  // ---------------------------- START ----------------------------
  // Initialize the form with React Hook Form and Zod schema for validation
  const commentForm = useForm<z.infer<typeof CommentSchema>>({
    resolver: zodResolver(CommentSchema),
  });

  const {
    handleSubmit,
    control,
    reset,
    setFocus,
    formState: { errors, isSubmitted },
  } = commentForm;

  const handleFormSubmit = async (data: z.infer<typeof CommentSchema>) => {
    switch (formMode) {
      case 'comment':
        try {
          const response = await addComment({
            variables: {
              input: {
                postId: fullPostData?.publication?.post?.id as string,
                contentMarkdown: data.comment,
              },
            },
          });

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
        break;
      case 'reply':
        try {
          const response = await addReply({
            variables: {
              input: {
                commentId: activeCommentId as string,
                contentMarkdown: data.comment,
              },
            },
          });

          if (response.data?.addReply.reply) {
            handleReplyAdded(
              activeCommentId as string,
              response.data.addReply.reply
            );
          }

          toast({
            title: 'Reply Added!',
            description: 'Your reply has been successfully added.',
          });
          reset({ comment: '' });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'There was an error posting your reply.',
          });
        }
        break;
      case 'editComment':
        try {
          const response = await updateComment({
            variables: {
              input: {
                id: activeCommentId as string,
                contentMarkdown: data.comment,
              },
            },
          });

          if (response.data?.updateComment.comment) {
            handleCommentUpdated(activeCommentId as string, data.comment);
          }

          toast({
            title: 'Comment Updated!',
            description: 'Your comment has been successfully updated.',
          });
          reset({ comment: '' });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'There was an error updating your comment.',
          });
        }
        break;
      case 'editReply':
        try {
          const response = await updateReply({
            variables: {
              input: {
                commentId: activeCommentId as string,
                replyId: activeReplyId as string,
                contentMarkdown: data.comment,
              },
            },
          });

          if (response.data?.updateReply.reply) {
            handleReplyUpdated(
              activeCommentId as string,
              activeReplyId as string,
              data.comment
            );
          }

          toast({
            title: 'Reply Updated!',
            description: 'Your reply has been successfully updated.',
          });
          reset({ comment: '' });
        } catch (error) {
          toast({
            title: 'Error',
            description: 'There was an error updating your reply.',
          });
        }
        break;
      default:
        toast({
          title: 'Error',
          description: 'Invalid form mode.',
        });
        break;
    }
    resetFormMode();
  };

  // ----------------------------- END -----------------------------

  // GraphQL Queries
  // ---------------------------- START ----------------------------

  // Fetch me
  const {
    data: meData,
    loading: meLoading,
    error: meError,
  } = useQuery<MeQuery, MeQueryVariables>(MeDocument, {});

  // Fetch full post details based on the extracted slug and host

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
  });

  // Update local state with fetched post details.
  useEffect(() => {
    if (fullPostData) {
      setPost(fullPostData);
    }
  }, [fullPostData]);

  // ----------------------------- END -----------------------------

  // GraphQL Mutations
  // ---------------------------- START ----------------------------
  const [addComment, { loading: addingComment, error: addCommentError }] =
    useMutation(AddCommentDocument);

  const [addReply, { loading: addingReply, error: addReplyError }] =
    useMutation(AddReplyDocument);

  const [
    updateComment,
    { loading: updatingComment, error: updateCommentError },
  ] = useMutation(UpdateCommentDocument);

  const [updateReply, { loading: updatingReply, error: updateReplyError }] =
    useMutation(UpdateReplyDocument);

  const [
    removeComment,
    { loading: removingComment, error: removeCommentError },
  ] = useMutation(RemoveCommentDocument);

  const [removeReply, { loading: removingReply, error: removeReplyError }] =
    useMutation(RemoveReplyDocument);
  // ----------------------------- END -----------------------------

  // User Interaction Handlers
  // ---------------------------- START ----------------------------
  // Handler for clicking the delete button on comment
  const handleDeleteCommentClick = async (id: string) => {
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

  // Handler for clicking the delete button on reply
  const handleDeleteReplyClick = async (commentId: string, replyId: string) => {
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

  // Handler for clicking the reply button
  const handleReplyClick = (commentId: string) => {
    setFormMode('reply');
    setActiveCommentId(commentId);
    setActiveReplyId(null);
    setFocus('comment');
  };

  // Handler for clicking the edit comment button
  const handleEditCommentClick = (commentId: string) => {
    setFormMode('editComment');
    setActiveCommentId(commentId);
    setActiveReplyId(null);
    setFocus('comment');
  };

  // Handler for clicking the edit reply button
  const handleEditReplyClick = (commentId: string, replyId: string) => {
    setFormMode('editReply');
    setActiveCommentId(commentId);
    setActiveReplyId(replyId);
    setFocus('comment');
  };
  // ----------------------------- END -----------------------------

  // Utility Functions
  // ---------------------------- START ----------------------------
  // Reset form mode and IDs
  const resetFormMode = () => {
    setFormMode('comment');
    setActiveCommentId(null);
    setActiveReplyId(null);
  };

  // Dynamic form heading
  const getFormHeading = () => {
    switch (formMode) {
      case 'comment':
        return 'Add a Comment';
      case 'reply':
        return (
          <div className="flex flex-center">
            <CornerUpLeft size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
            <p className="ml-2">Replying to Comment</p>
          </div>
        );
      case 'editComment':
        return 'Edit Comment';
      case 'editReply':
        return 'Edit Reply';
      default:
        return 'Add a Comment';
    }
  };

  // Dynamic submit button text
  const getSubmitButtonText = () => {
    switch (formMode) {
      case 'comment':
        return 'Post Comment';
      case 'reply':
        return 'Post Reply';
      case 'editComment':
        return 'Update Comment';
      case 'editReply':
        return 'Update Reply';
      default:
        return 'Post Comment';
    }
  };

  // Copy to clipboard utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'URL Copied!',
      description: 'Blog URL has been copied to clipboard.',
    });
  };
  // ----------------------------- END -----------------------------

  // State Update Functions
  // ---------------------------- START ----------------------------
  // Function to update state when a comment is added
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

  // Function to update state when a reply is added to a specific comment
  const handleReplyAdded = (
    commentId: string,
    newReply: AddReplyMutation['addReply']['reply']
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

      // Map through the comments to update the correct one
      const updatedComments = prevPost.publication.post.comments.edges.map(
        (commentEdge) => {
          if (commentEdge.node.id === commentId) {
            const newReplyEdge: CommentReplyEdge = {
              __typename: 'CommentReplyEdge',
              node: newReply as Reply,
              cursor: '',
            };

            const currentTotalDocuments = commentEdge.node.replies
              ? commentEdge.node.replies.totalDocuments
              : 0;

            // Update replies with the new reply
            const updatedReplies: CommentReplyConnection = {
              __typename: 'CommentReplyConnection',
              edges: [
                ...(commentEdge.node.replies?.edges || []),
                newReplyEdge,
              ] as CommentReplyEdge[],
              pageInfo: {
                ...commentEdge.node.replies?.pageInfo,
              },
              totalDocuments: currentTotalDocuments + 1,
            };

            // Return the updated comment with the new reply
            return {
              ...commentEdge,
              node: {
                ...commentEdge.node,
                replies: updatedReplies,
              },
            };
          }
          return commentEdge;
        }
      );

      // Construct the updated post object
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

  // Function to update state when a liked is added
  const handleLikeIncrement = (commentId: string) => {
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
        (edge) => {
          if (edge.node.id === commentId) {
            // Safely increment the like and myReactions count
            const updatedLikeCount = (edge.node.totalReactions || 0) + 1;
            const updatedMyReactions = (edge.node.myTotalReactions || 0) + 1;

            return {
              ...edge,
              node: {
                ...edge.node,
                totalReactions: updatedLikeCount,
                myTotalReactions: updatedMyReactions,
              },
            };
          }

          return edge;
        }
      );

      // Create an updated post object with the new comments
      const updatedPost = {
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
            const updatedReplies = comment.node.replies.edges.filter(
              (reply) => reply.node.id !== deletedReplyId
            );

            const updatedTotalDocuments =
              comment.node.replies.totalDocuments - 1;

            return {
              ...comment,
              node: {
                ...comment.node,
                replies: {
                  ...comment.node.replies,
                  edges: updatedReplies,
                  totalDocuments: updatedTotalDocuments,
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

  // Function to update state when a comment is edited
  const handleCommentUpdated = (updatedCommentId: string, content: string) => {
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
        (edge) => {
          if (edge.node.id === updatedCommentId) {
            return {
              ...edge,
              node: {
                ...edge.node,
                content: {
                  ...edge.node.content,
                  markdown: content,
                },
              },
            };
          }
          return edge;
        }
      );

      return {
        ...prevPost,
        publication: {
          ...prevPost.publication,
          post: {
            ...prevPost.publication?.post,
            comments: {
              ...prevPost.publication?.post?.comments,
              edges: updatedComments,
            },
          },
        },
      };
    });
  };

  // Function to update state when a reply is edited
  const handleReplyUpdated = (
    commentId: string,
    updatedReplyId: string,
    content: string
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

      const updatedComments = prevPost.publication.post.comments.edges.map(
        (comment) => {
          if (comment.node.id === commentId) {
            const updatedReplies = comment.node.replies.edges.map((reply) => {
              if (reply.node.id === updatedReplyId) {
                return {
                  ...reply,
                  node: {
                    ...reply.node,
                    content: {
                      ...reply.node.content,
                      markdown: content,
                    },
                  },
                };
              }
              return reply;
            });

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

  // Function to update state when a follow status is toggled
  const toggleFollowing = (following: boolean) => {
    setPost((prevPost) => {
      if (
        !prevPost ||
        !prevPost.publication ||
        !prevPost.publication.post ||
        !prevPost.publication.post.author
      ) {
        return prevPost;
      }

      // Toggle the following status
      const updatedFollowingStatus = following;

      const updatedPost = {
        ...prevPost,
        publication: {
          ...prevPost.publication,
          post: {
            ...prevPost.publication.post,
            author: {
              ...prevPost.publication.post.author,
              following: updatedFollowingStatus,
            },
          },
        },
      };

      return updatedPost;
    });
  };
  // ----------------------------- END -----------------------------

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
            <div className="flex flex-wrap items-center mb-4 gap-2">
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
              {/* Comments Modal, Author Modal, Like Button */}
              {token && post?.publication?.post && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="ml-2">Comments</Button>
                    </DialogTrigger>
                    <DialogContent className="flex flex-col w-11/12 sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-1/3 min-h-[70vh] max-h-[80vh] max-w-[80%] mx-auto my-auto overflow-hidden">
                      <DialogHeader>
                        <DialogTitle>Comments</DialogTitle>
                      </DialogHeader>

                      {post?.publication?.post?.comments.edges &&
                      post?.publication?.post?.comments.edges.length > 0 ? (
                        <div className="flex-grow overflow-y-auto p-4 bg-gray-800 text-gray-300">
                          {post?.publication?.post?.comments.edges.map(
                            (edge, index, array) => (
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
                                    <div className="flex-grow">
                                      <div className="flex items-center">
                                        <div className="font-semibold text-white inline-block mr-2">
                                          {edge.node.author.name}
                                        </div>
                                        {/* Conditionally render the badge */}
                                        {edge.node.author.id ===
                                          fullPostData?.publication?.post
                                            ?.author.id && (
                                          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                            Author
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-400 inline-block">
                                        {dayjs(edge.node.dateAdded).format(
                                          'DD MMM YY'
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Comment Content */}
                                  <div className="flex items-center bg-gray-300 p-3 rounded-lg">
                                    <MarkdownToHtml
                                      contentMarkdown={
                                        edge.node.content.markdown
                                      }
                                    />
                                    {edge.node.author.id === meData?.me.id && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button
                                            aria-label="Options"
                                            className="focus:outline-none focus:ring-0 active:ring-0"
                                          >
                                            <MoreVertical
                                              size={16}
                                              className="text-gray-800"
                                            />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          <DropdownMenuItem
                                            disabled={removingComment}
                                            onSelect={() => {
                                              handleDeleteCommentClick(
                                                edge.node.id
                                              );
                                            }}
                                          >
                                            Delete
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onSelect={() => {
                                              /* handle edit */
                                              handleEditCommentClick(
                                                edge.node.id
                                              );
                                            }}
                                          >
                                            Edit
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>

                                  {/* Reactions, Reply Count, and Reply to Comment */}
                                  <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                                    <div className="flex items-center">
                                      <LikeCommentButton
                                        myReactions={edge.node.myTotalReactions}
                                        commentId={edge.node.id}
                                        totalReactions={
                                          edge.node.totalReactions
                                        }
                                        handleLikeIncrement={
                                          handleLikeIncrement
                                        }
                                      />
                                      <span className="mx-2">&middot;</span>
                                      <span>
                                        {edge.node.replies?.totalDocuments}{' '}
                                        replies
                                      </span>
                                      <span className="mx-2">&middot;</span>
                                      <button
                                        aria-label="Reply"
                                        className="focus:outline-none focus:ring-0 active:ring-0 text-white"
                                        onClick={() => {
                                          handleReplyClick(edge.node.id);
                                        }}
                                      >
                                        Reply
                                      </button>
                                    </div>
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
                                          {reply.node?.author
                                            .profilePicture && (
                                            <img
                                              src={
                                                reply.node.author.profilePicture
                                              }
                                              alt={reply.node.author.name}
                                              className="w-8 h-8 rounded-full mr-2 border border-gray-600"
                                            />
                                          )}
                                          <div className="flex-grow">
                                            <div className="flex items-center">
                                              <div className="font-semibold text-white inline-block mr-2">
                                                {reply.node?.author.name}
                                              </div>
                                              {/* Conditionally render the badge */}
                                              {reply.node?.author.id ===
                                                fullPostData?.publication?.post
                                                  ?.author.id && (
                                                <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                                  Author
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                              {reply.node.dateAdded
                                                ? dayjs(
                                                    reply.node.dateAdded
                                                  ).format('DD MMM YY')
                                                : 'Date not available'}
                                            </div>
                                          </div>
                                        </div>
                                        {/* Reply Content */}
                                        <div className="bg-gray-300 p-3 rounded-lg flex">
                                          <MarkdownToHtml
                                            contentMarkdown={
                                              reply.node.content.markdown
                                            }
                                          />
                                          {reply.node?.author.id ===
                                            meData?.me.id && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <button
                                                  aria-label="Options"
                                                  className="focus:outline-none focus:ring-0 active:ring-0"
                                                >
                                                  <MoreVertical
                                                    size={16}
                                                    className="text-gray-800"
                                                  />
                                                </button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent>
                                                <DropdownMenuItem
                                                  disabled={removingReply}
                                                  onSelect={() => {
                                                    /* handle delete */
                                                    handleDeleteReplyClick(
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
                                                    handleEditReplyClick(
                                                      edge.node.id,
                                                      reply.node.id
                                                    );
                                                  }}
                                                >
                                                  Edit
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>

                                        {/* Reactions and Reply to Comment */}
                                        <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                                          <button
                                            aria-label="Reply"
                                            className="focus:outline-none focus:ring-0 active:ring-0 text-white"
                                            onClick={() => {
                                              handleReplyClick(edge.node.id);
                                            }}
                                          >
                                            Reply
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {index < array.length - 1 && (
                                  <div className="mt-4">
                                    <Separator />
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
                                    <FormLabel>{getFormHeading()}</FormLabel>
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
                              disabled={
                                isLoading ||
                                addingComment ||
                                updatingComment ||
                                addingReply ||
                                updatingReply
                              }
                              className="flex-shrink-0"
                            >
                              {getSubmitButtonText()}
                            </Button>
                            {formMode !== 'comment' && (
                              <Button
                                onClick={resetFormMode}
                                className="flex-shrink-0 bg-gray-400 hover:bg-gray-500 text-white"
                              >
                                Cancel
                              </Button>
                            )}
                          </form>
                        </Form>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {post?.publication?.post?.author && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="ml-2">Author</Button>
                      </DialogTrigger>
                      <DialogContent className="flex flex-col min-h-[70vh] max-h-[80vh] w-full max-w-md mx-auto my-auto overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>Author</DialogTitle>
                        </DialogHeader>
                        <AuthorModal
                          me={meData?.me.username || ''}
                          toggleFollowingState={toggleFollowing}
                          authorName={
                            post.publication.post.author.name ||
                            'Unknown Author'
                          }
                          authorHandle={
                            post.publication.post.author.username ||
                            'unknown_handle'
                          }
                          authorBio={
                            post.publication.post.author.bio?.markdown ||
                            'No bio available.'
                          }
                          authorAvatarSrc={
                            post.publication.post.author.profilePicture || ''
                          }
                          authorProfileLink={
                            post.publication.post.author.socialMediaLinks
                              ?.twitter || ''
                          }
                          memberSince={
                            post.publication.post.author.dateJoined || ''
                          }
                          location={post.publication.post.author.location || ''}
                          following={post.publication.post.author.following}
                          followersCount={
                            post.publication.post.author.followersCount
                          }
                          followingsCount={
                            post.publication.post.author.followingsCount
                          }
                        />
                        <DialogFooter>
                          {/* Additional buttons or info if necessary */}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
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
              'DD MMM YY'
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
