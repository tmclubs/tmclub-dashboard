import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Code,
    Quote,
    Undo,
    Redo,
    Type,
} from 'lucide-react';

export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing... Use the toolbar above to format your text.',
    className = '',
}) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none focus:ring-0',
                'data-placeholder': placeholder,
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Don't send empty paragraph as content
            if (html === '<p></p>') {
                onChange('');
            } else {
                onChange(html);
            }
        },
    });

    // Update editor content when value prop changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    if (!editor) {
        return (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-gray-400 text-sm">Loading editor...</p>
            </div>
        );
    }


    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
        disabled = false,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
        disabled?: boolean;
    }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded transition-all ${disabled
                ? 'opacity-50 cursor-not-allowed'
                : isActive
                    ? 'bg-orange-100 text-orange-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                {/* Text formatting */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="Inline Code"
                    >
                        <Code className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Headings */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        isActive={editor.isActive('paragraph')}
                        title="Normal Text"
                    >
                        <Type className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Blockquote"
                    >
                        <Quote className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* History */}
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* Editor Content */}
            <div className="relative">
                <EditorContent editor={editor} />
            </div>

            {/* Helper text */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    💡 Tip: Select text and click toolbar buttons to apply formatting
                </p>
            </div>
        </div>
    );
};
