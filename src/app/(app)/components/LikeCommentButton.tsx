'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { LikeCommentDocument } from '../../../../generated/graphql';
import { useMutation } from '@apollo/client';

interface LikeCommentButtonProps {
  commentId: string;
  totalReactions: number;
  myReactions: number;
  handleLikeIncrement: (commentId: string) => void;
}

const LikeCommentButton = ({
  commentId,
  totalReactions,
  myReactions,
  handleLikeIncrement,
}: LikeCommentButtonProps) => {
  const [localTotalReactions, setLocalTotalReactions] =
    useState(totalReactions);
  const [localMyReactions, setLocalMyReactions] = useState(myReactions);
  const [canUserLikeMore, setCanUserLikeMore] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const [likeComment, { loading: likingComment }] = useMutation(
    LikeCommentDocument,
    {
      onCompleted: (data) => {
        setLocalTotalReactions(data.likeComment.comment?.totalReactions ?? 0);
        setLocalMyReactions(localMyReactions + 1);
        handleLikeIncrement(commentId);
      },
      onError: (error) => {
        console.error('Error liking comment', error);
      },
    }
  );

  useEffect(() => {
    setCanUserLikeMore(localMyReactions < 10);
  }, [localMyReactions]);

  const handleLike = async () => {
    if (!canUserLikeMore) {
      return;
    }
    setIsAnimating(true);
    try {
      await likeComment({
        variables: {
          input: {
            commentId,
          },
        },
      });
    } catch (error) {
      console.error('Error executing likeComment', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const heartIconStyle =
    localMyReactions > 0 ? { color: 'red', fill: 'red' } : {};

  return (
    <div className="flex items-center">
      <button
        className="flex items-center focus:outline-none focus:ring-0 active:ring-0"
        onClick={handleLike}
        disabled={!canUserLikeMore || likingComment}
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
      </button>
    </div>
  );
};

export default LikeCommentButton;
