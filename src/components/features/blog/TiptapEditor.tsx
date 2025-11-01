import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  Undo,
  Redo,
  Link,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing your content...",
  className = "",
  disabled = false
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none min-h-[200px] sm:min-h-[300px] p-3 sm:p-4 text-sm sm:text-base',
        style: 'outline: none;',
        'data-placeholder': placeholder,
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      // Insert HTML image tag instead of markdown
      editor.chain().focus().insertContent(`<img src="${url}" alt="Image" style="max-width: 100%; height: auto;" />`).run();
    }
  };

  // CSS styles for the editor
  const editorStyles = `
    .tiptap-editor-content {
      outline: none !important;
    }
    
    .tiptap-editor-content h1 {
      font-size: 2rem !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      margin: 1rem 0 0.5rem 0 !important;
      color: #1f2937 !important;
    }
    
    .tiptap-editor-content h2 {
      font-size: 1.5rem !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      margin: 0.8rem 0 0.4rem 0 !important;
      color: #374151 !important;
    }
    
    .tiptap-editor-content h3 {
      font-size: 1.25rem !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
      margin: 0.6rem 0 0.3rem 0 !important;
      color: #4b5563 !important;
    }
    
    .tiptap-editor-content h4 {
      font-size: 1.125rem !important;
      font-weight: 600 !important;
      line-height: 1.4 !important;
      margin: 0.5rem 0 0.25rem 0 !important;
      color: #6b7280 !important;
    }
    
    .tiptap-editor-content h5 {
      font-size: 1rem !important;
      font-weight: 600 !important;
      line-height: 1.5 !important;
      margin: 0.4rem 0 0.2rem 0 !important;
      color: #6b7280 !important;
    }
    
    .tiptap-editor-content h6 {
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      line-height: 1.5 !important;
      margin: 0.3rem 0 0.15rem 0 !important;
      color: #9ca3af !important;
    }
    
    .tiptap-editor-content p {
      margin: 0.5rem 0 !important;
      line-height: 1.6 !important;
    }
    
    .tiptap-editor-content strong {
      font-weight: 700 !important;
    }
    
    .tiptap-editor-content em {
      font-style: italic !important;
    }
    
    .tiptap-editor-content code {
      background-color: #f3f4f6 !important;
      padding: 0.125rem 0.25rem !important;
      border-radius: 0.25rem !important;
      font-family: 'Courier New', monospace !important;
      font-size: 0.875em !important;
    }
    
    .tiptap-editor-content ul {
      list-style-type: disc !important;
      margin: 0.5rem 0 !important;
      padding-left: 1.5rem !important;
    }
    
    .tiptap-editor-content ol {
      list-style-type: decimal !important;
      margin: 0.5rem 0 !important;
      padding-left: 1.5rem !important;
    }
    
    .tiptap-editor-content li {
      margin: 0.25rem 0 !important;
    }
    
    .tiptap-editor-content blockquote {
      border-left: 4px solid #d1d5db !important;
      padding-left: 1rem !important;
      margin: 1rem 0 !important;
      font-style: italic !important;
      color: #6b7280 !important;
    }
    
    .tiptap-editor-content a {
      color: #3b82f6 !important;
      text-decoration: underline !important;
    }
    
    .tiptap-editor-content img {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 0.375rem !important;
      margin: 0.5rem 0 !important;
    }
    
    .tiptap-editor-content:focus {
      outline: none !important;
    }
    
    .tiptap-editor-content p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #9ca3af;
      pointer-events: none;
      height: 0;
    }
  `;

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-1 sm:p-2 flex flex-wrap items-center gap-1 bg-gray-50 overflow-x-auto">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${editor.isActive('bold') ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Bold className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${editor.isActive('italic') ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Italic className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`${editor.isActive('code') ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Code className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Heading1 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Heading2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Heading3 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${editor.isActive('bulletList') ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${editor.isActive('orderedList') ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <ListOrdered className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${editor.isActive('blockquote') ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Quote className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Links and Images */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1 sm:pr-2 mr-1 sm:mr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            className={`${editor.isActive('link') ? 'bg-gray-200' : ''} p-1 sm:p-2`}
            disabled={disabled}
          >
            <Link className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addImage}
            className="p-1 sm:p-2"
            disabled={disabled}
          >
            <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo() || disabled}
            className="p-1 sm:p-2"
          >
            <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo() || disabled}
            className="p-1 sm:p-2"
          >
            <Redo className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px] relative">
        <EditorContent 
          editor={editor} 
          className="focus-within:outline-none"
        />
      </div>
    </div>
  );
};