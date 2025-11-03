import React from 'react';
import { MarkdownRenderer } from '../features/blog/MarkdownRenderer';

export const MarkdownTest: React.FC = () => {
  // Test data - HTML content from TiptapEditor
  const htmlContent = `
    <h1>Test Blog Post</h1>
    <p>This is a <strong>test paragraph</strong> with <em>italic text</em> and some regular content.</p>
    <h2>Features</h2>
    <ul>
      <li>HTML to Markdown conversion</li>
      <li>Consistent rendering with <code>react-markdown</code></li>
      <li>Support for all common elements</li>
    </ul>
    <h3>Code Example</h3>
    <pre><code>const example = "Hello World";
console.log(example);</code></pre>
    <blockquote>
      <p>This is a blockquote to test the conversion.</p>
    </blockquote>
    <p>Here's a <a href="https://example.com">link example</a> for testing.</p>
  `;

  // Test data - Pure Markdown content
  const markdownContent = `
# Test Blog Post

This is a **test paragraph** with *italic text* and some regular content.

## Features

- HTML to Markdown conversion
- Consistent rendering with \`react-markdown\`
- Support for all common elements

### Code Example

\`\`\`javascript
const example = "Hello World";
console.log(example);
\`\`\`

> This is a blockquote to test the conversion.

Here's a [link example](https://example.com) for testing.
  `;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Markdown Renderer Test</h1>
        <p className="text-gray-600">Testing HTML to Markdown conversion and rendering</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* HTML Content Test */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🔧 HTML Content (from TiptapEditor)
            </h2>
            <p className="text-sm text-blue-700">
              This content simulates HTML output from TiptapEditor
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <MarkdownRenderer content={htmlContent} />
          </div>
        </div>

        {/* Markdown Content Test */}
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              📝 Pure Markdown Content
            </h2>
            <p className="text-sm text-green-700">
              This content is already in Markdown format
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <MarkdownRenderer content={markdownContent} />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          ✅ Test Results
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• HTML content should be automatically converted to Markdown</li>
          <li>• Both columns should render identically</li>
          <li>• All formatting (headers, lists, code, quotes) should work</li>
          <li>• Links and emphasis should be properly styled</li>
        </ul>
      </div>
    </div>
  );
};