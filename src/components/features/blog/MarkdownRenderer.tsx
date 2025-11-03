import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Helper function to detect if content is HTML
const isHtmlContent = (content: string): boolean => {
  const htmlPattern = /<[^>]+>/;
  return htmlPattern.test(content);
};

// Enhanced HTML to Markdown conversion for TiptapEditor output
const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  
  let markdown = html;
  
  // Convert headers (h1-h6)
  markdown = markdown.replace(/<h([1-6])(?:[^>]*)>(.*?)<\/h[1-6]>/gis, (_, level, content) => {
    const headerLevel = '#'.repeat(parseInt(level));
    const cleanContent = content.replace(/<[^>]+>/g, '').trim();
    return `${headerLevel} ${cleanContent}\n\n`;
  });
  
  // Convert code blocks (pre + code)
  markdown = markdown.replace(/<pre(?:[^>]*)><code(?:[^>]*)>(.*?)<\/code><\/pre>/gis, (_, content) => {
    const cleanContent = content
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
    return '```\n' + cleanContent + '\n```\n\n';
  });
  
  // Convert inline code
  markdown = markdown.replace(/<code(?:[^>]*)>(.*?)<\/code>/gi, (_, content) => {
    const cleanContent = content.replace(/<[^>]+>/g, '').trim();
    return `\`${cleanContent}\``;
  });
  
  // Convert blockquotes
  markdown = markdown.replace(/<blockquote(?:[^>]*)>(.*?)<\/blockquote>/gis, (_, content) => {
    const cleanContent = content
      .replace(/<p(?:[^>]*)>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
    const lines = cleanContent.split('\n').filter((line: string) => line.trim());
     const quotedLines = lines.map((line: string) => `> ${line.trim()}`).join('\n');
    return quotedLines + '\n\n';
  });
  
  // Convert unordered lists
  markdown = markdown.replace(/<ul(?:[^>]*)>(.*?)<\/ul>/gis, (_, content) => {
    const items = content.match(/<li(?:[^>]*)>(.*?)<\/li>/gis);
    if (items) {
      const listItems = items.map((item: string) => {
        const itemContent = item
          .replace(/<li(?:[^>]*)>/gi, '')
          .replace(/<\/li>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        return `- ${itemContent}`;
      }).join('\n');
      return `${listItems}\n\n`;
    }
    return '';
  });
  
  // Convert ordered lists
  markdown = markdown.replace(/<ol(?:[^>]*)>(.*?)<\/ol>/gis, (_, content) => {
    const items = content.match(/<li(?:[^>]*)>(.*?)<\/li>/gis);
    if (items) {
      const listItems = items.map((item: string, index: number) => {
        const itemContent = item
          .replace(/<li(?:[^>]*)>/gi, '')
          .replace(/<\/li>/gi, '')
          .replace(/<[^>]+>/g, '')
          .trim();
        return `${index + 1}. ${itemContent}`;
      }).join('\n');
      return `${listItems}\n\n`;
    }
    return '';
  });
  
  // Convert bold text
  markdown = markdown.replace(/<(strong|b)(?:[^>]*)>(.*?)<\/(strong|b)>/gi, '**$2**');
  
  // Convert italic text
  markdown = markdown.replace(/<(em|i)(?:[^>]*)>(.*?)<\/(em|i)>/gi, '*$2*');
  
  // Convert links
  markdown = markdown.replace(/<a(?:[^>]*)\s+href=["']([^"']+)["'](?:[^>]*)>(.*?)<\/a>/gi, '[$3]($1)');
  
  // Convert images
  markdown = markdown.replace(/<img(?:[^>]*)\s+src=["']([^"']+)["'](?:[^>]*)\s+alt=["']([^"']*)["'](?:[^>]*)\/?>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img(?:[^>]*)\s+alt=["']([^"']*)["'](?:[^>]*)\s+src=["']([^"']+)["'](?:[^>]*)\/?>/gi, '![$1]($2)');
  markdown = markdown.replace(/<img(?:[^>]*)\s+src=["']([^"']+)["'](?:[^>]*)\/?>/gi, '![]($1)');
  
  // Convert horizontal rules
  markdown = markdown.replace(/<hr\s*\/?>/gi, '---\n\n');
  
  // Convert paragraphs
  markdown = markdown.replace(/<p(?:[^>]*)>(.*?)<\/p>/gis, '$1\n\n');
  
  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  markdown = markdown
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Clean up extra whitespace and newlines
  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace from start and end
    .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space
  
  return markdown;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  // Process content based on type
  const processedContent = React.useMemo(() => {
    if (isHtmlContent(content)) {
      // Try to convert HTML to Markdown first
      const convertedMarkdown = htmlToMarkdown(content);
      // If conversion is successful and clean, use it; otherwise use original HTML with rehype-raw
      if (convertedMarkdown.length > 0 && !isHtmlContent(convertedMarkdown)) {
        return convertedMarkdown;
      }
      return content; // Return original HTML to be processed by rehype-raw
    }
    return content; // Already Markdown
  }, [content]);

  // Determine if we need rehype-raw (for HTML content that couldn't be converted)
  const needsRehypeRaw = isHtmlContent(processedContent);

  return (
    <div className={`prose prose-gray max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={needsRehypeRaw ? [rehypeRaw] : []}
        components={{
          // Headers
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-6">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2 mt-3">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-medium text-gray-700 dark:text-gray-200 mb-1 mt-2">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 mt-2">
              {children}
            </h6>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300">
              {children}
            </li>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-gray-50 dark:bg-gray-800 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          
          // Code
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4" {...props}>
                {children}
              </code>
            );
          },
          
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
              {children}
            </pre>
          ),
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // Images
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg shadow-md mb-4"
            />
          ),
          
          // Horizontal Rule
          hr: () => (
            <hr className="border-gray-300 dark:border-gray-600 my-6" />
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-gray-900">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};