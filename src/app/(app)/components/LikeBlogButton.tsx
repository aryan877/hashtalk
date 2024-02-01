'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LikePostDocument,
  SinglePostByPublicationDocument,
  SinglePostByPublicationQuery,
  SinglePostByPublicationQueryVariables,
} from '../../../../generated/graphql';
import { useMutation, useQuery } from '@apollo/client';

interface LikeBlogButtonProps {
  postId: string | undefined;
  totalReactions: number | undefined;
  myReactions: number | undefined;
}

const LikeBlogButton = ({
  postId,
  totalReactions,
  myReactions,
}: LikeBlogButtonProps) => {
  const [localTotalReactions, setLocalTotalReactions] = useState(
    totalReactions || 0
  );
  const [localMyReactions, setLocalMyReactions] = useState(myReactions || 0);
  const [canUserLikeMore, setCanUserLikeMore] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const [likePost, { loading: likingPost, error: likePostError }] = useMutation(
    LikePostDocument,
    {
      onCompleted: (response) => {
        setLocalTotalReactions(response.likePost.post?.reactionCount as number);
        setLocalMyReactions((prevMyLikes) => prevMyLikes + 1);
      },
      onError: (error) => {
        console.error('Error liking post', error);
      },
    }
  );

  useEffect(() => {
    setCanUserLikeMore(localMyReactions < 10);
  }, [localMyReactions]);

  const handleLike = async () => {
    if (!postId || !canUserLikeMore) {
      return;
    }
    setIsAnimating(true);
    await likePost({
      variables: {
        input: {
          postId,
        },
      },
    });
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const heartIconStyle =
    localMyReactions > 0 ? { color: 'red', fill: 'red' } : {};

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={handleLike}
              disabled={!canUserLikeMore || likingPost}
            >
              <HeartIcon style={heartIconStyle} />
              {localTotalReactions > 0 && (
                <span className="ml-2">{localTotalReactions}</span>
              )}
              {isAnimating && (
                <motion.span
                  initial={{ scale: 0.5, y: 0, opacity: 0 }}
                  animate={{ scale: 1.2, y: -20, opacity: 1 }}
                  exit={{ scale: 0, y: -30, opacity: 0 }}
                  transition={{
                    duration: 0.8,
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="reaction-increment"
                  onAnimationComplete={() => setIsAnimating(false)}
                >
                  +1
                </motion.span>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Like post</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LikeBlogButton;
