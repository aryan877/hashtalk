import { useEmbeds } from '@/helpers/renderer/hooks/useEmbeds';
import { markdownToHtml } from '@/helpers/renderer/markdownToHtml';
import { memo } from 'react';

type Props = {
  contentMarkdown: string;
};

const _MarkdownToHtml = ({ contentMarkdown }: Props) => {
  useEmbeds({ enabled: true });

  if (!contentMarkdown) {
    return null; // or return a placeholder component/message
  }

  const content = markdownToHtml(contentMarkdown);

  return (
    <div
      className="flex-grow hashnode-content-style"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export const MarkdownToHtml = memo(_MarkdownToHtml);
