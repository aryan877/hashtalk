/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownToHtml } from './MarkdownToHtml';
import dayjs from 'dayjs';

interface BlogCardProps {
  title?: string;
  subtitle?: string;
  contentMarkdown?: string;
  coverImage?: string;
  tags?: string[];
  publishedOn?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  subtitle,
  contentMarkdown,
  coverImage,
  tags,
  publishedOn
}) => {
  return (
    <div className="flex flex-grow overflow-hidden">
      <Card className="flex flex-col w-full mb-4 p-4 overflow-y-auto">
        {coverImage && <img src={coverImage} alt={title} className="mb-4" />}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <Badge key={index} className="mb-2 mr-2">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-sm mb-4">
          Published on: {publishedOn}
        </p>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <h3 className="text-md mb-4">{subtitle}</h3>
        {/* <div
          className="flex-grow"
          dangerouslySetInnerHTML={{
            __html: contentMarkdown || '',
          }}
        /> */}
        <MarkdownToHtml contentMarkdown={contentMarkdown as string} />
      </Card>
    </div>
  );
};

export default BlogCard;
