import React, { useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Card } from '@/components/ui/card';
import 'highlight.js/styles/github-dark.css';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage = React.memo(function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  // Add error boundary for long content
  if (!content || content.length === 0) {
    return null;
  }

  const components: Partial<Components> = useMemo(() => ({
    code: ({ inline, className, children, ...props }: {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    }) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <code className={className} {...props}>
          {children}
        </code>
      ) : (
        <code
          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ href, children, ...props }: {
      href?: string;
      children?: React.ReactNode;
    }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:text-primary/80"
        {...props}
      >
        {children}
      </a>
    ),
    p: ({ children, ...props }: { children?: React.ReactNode }) => (
      <p className="mb-4 last:mb-0" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-4 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2" {...props}>
        {children}
      </ol>
    ),
    h1: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h1 className="text-2xl font-bold mb-4 mt-6" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h2 className="text-xl font-semibold mb-3 mt-5" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h3 className="text-lg font-semibold mb-2 mt-4" {...props}>
        {children}
      </h3>
    ),
    blockquote: ({ children, ...props }: { children?: React.ReactNode }) => (
      <blockquote
        className="border-l-4 border-muted-foreground pl-4 italic my-4"
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: { children?: React.ReactNode }) => (
      <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: { children?: React.ReactNode }) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),
  }), []);

  try {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </div>
      </Card>
    );
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return (
      <Card className={`p-6 ${className}`}>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-red-500">Error rendering markdown content</p>
          <pre className="mt-2 text-xs overflow-auto max-h-96">{content}</pre>
        </div>
      </Card>
    );
  }
});
