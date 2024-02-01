/* eslint-disable @next/next/no-img-element */
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Head from 'next/head';
import React from 'react';
import { MarkdownToHtml } from './MarkdownToHtml';

interface BlogCardProps {
  title?: string;
  subtitle?: string;
  contentMarkdown?: string;
  coverImage?: string;
  tags?: string[];
  publishedOn?: string;
  readTime?: number | undefined;
}

const BlogCard: React.FC<BlogCardProps> = ({
  title,
  subtitle,
  contentMarkdown,
  coverImage,
  tags,
  publishedOn,
  readTime,
}) => {
  const highlightJsMonokaiTheme =
    '.hljs{display:block;overflow-x:auto;padding:.5em;background:#23241f}.hljs,.hljs-subst,.hljs-tag{color:#f8f8f2}.hljs-emphasis,.hljs-strong{color:#a8a8a2}.hljs-bullet,.hljs-link,.hljs-literal,.hljs-number,.hljs-quote,.hljs-regexp{color:#ae81ff}.hljs-code,.hljs-section,.hljs-selector-class,.hljs-title{color:#a6e22e}.hljs-strong{font-weight:700}.hljs-emphasis{font-style:italic}.hljs-attr,.hljs-keyword,.hljs-name,.hljs-selector-tag{color:#f92672}.hljs-attribute,.hljs-symbol{color:#66d9ef}.hljs-class .hljs-title,.hljs-params{color:#f8f8f2}.hljs-addition,.hljs-built_in,.hljs-builtin-name,.hljs-selector-attr,.hljs-selector-id,.hljs-selector-pseudo,.hljs-string,.hljs-template-variable,.hljs-type,.hljs-variable{color:#e6db74}.hljs-comment,.hljs-deletion,.hljs-meta{color:#75715e}';

  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: highlightJsMonokaiTheme }}
      ></style>
      <div className="flex flex-grow overflow-hidden">
        <Card className="flex flex-col w-full mb-4 p-4 overflow-y-auto">
          {/* Cover Image */}
          {coverImage && (
            <img
              src={coverImage}
              alt={title}
              className="mb-6 w-full object-cover rounded-lg"
            />
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {tags.map((tag, index) => (
                <Badge key={index} className="mb-1">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Published Date and Read Time */}
          <div className="text-sm text-gray-600 mb-6">
            {publishedOn && <span>Published on: {publishedOn}</span>}
            {publishedOn && readTime && <span> · </span>}
            {readTime && <span>{readTime} min read</span>}
          </div>

          {/* Title and Subtitle */}
          <div className="prose prose-xl mx-auto text-center">
            <h2 className="font-semibold mb-3 text-4xl">{title}</h2>
            <h3 className="text-xl mb-6">{subtitle}</h3>
          </div>

          {/* Markdown Content */}
          <MarkdownToHtml contentMarkdown={contentMarkdown as string} />
        </Card>
      </div>
    </>
  );
};

export default BlogCard;
