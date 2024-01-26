/* eslint-disable @next/next/no-img-element */
import React from 'react';
import DOMPurify from 'dompurify';
import { Card } from '@/components/ui/card';

interface BlogCardProps {
  title?: string;
  subtitle?: string;
  contentMarkdown?: string; // Assuming content is provided as markdown
  coverImage?: string;
  tags?: string[];
}

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  subtitle,
  contentMarkdown,
  coverImage,
  tags,
}) => {
  return (
    <div className="flex flex-grow overflow-hidden">
      <Card className="flex flex-col w-full my-4 p-4 overflow-y-auto">
        {coverImage && <img src={coverImage} alt={title} className="mb-4" />}
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <h3 className="text-md mb-2">{subtitle}</h3>
        <div
          className="flex-grow"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(contentMarkdown || ''),
          }}
        />
        {tags && tags.length > 0 && (
          <ul className="tags mt-4">
            {tags.map((tag, index) => (
              <li key={index} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default BlogCard;