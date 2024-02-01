'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';

const LikeBlogButton = () => {
  return (
    <div className="flex items-center">
      <Button onClick={() => {}}>
        <HeartIcon className="mr-2" />
        Like
      </Button>
    </div>
  );
};

export default LikeBlogButton;