import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Eye,
  Save,
  FileText,
  Bold,
  Italic,
  List,
  Link,
  Image as ImageIcon,
  Hash,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { type BlogArticle, type BlogAuthor, type BlogCategory } from './BlogArticleCard';

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

export interface BlogFormProps {
  article?: Partial<BlogArticle>;
  categories: BlogCategory[];
  authors: BlogAuthor[];
  onSubmit: (data: BlogFormData) => void;
  onPreview?: (data: BlogFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
}

export const BlogForm: React.FC<BlogFormProps> = ({
  article,
  categories,
  authors,
  onSubmit,
  onPreview,
  loading = false,
  onCancel,
  title = article ? 'Edit Article' : 'Create New Article',
}) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    featuredImage: article?.featuredImage || '',
    categoryId: article?.category.id || categories[0]?.id || '',
    tags: article?.tags || [],
    status: article?.status || 'draft',
    featured: article?.featured || false,
  });

  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string>(article?.featuredImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, featuredImage: result }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, featuredImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePreview = () => {
    onPreview?.(formData);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const newText = before + selectedText + after;

      const newContent =
        textarea.value.substring(0, start) +
        newText +
        textarea.value.substring(end);

      setFormData(prev => ({ ...prev, content: newContent }));

      // Set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {loading ? 'Saving...' : article ? 'Update Article' : 'Publish Article'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article Title *
              </label>
              <Input
                placeholder="Enter article title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="text-lg font-medium"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                placeholder="Brief description of the article (appears in article cards)"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length}/200 characters
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Featured image preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">No featured image</p>
                    </div>
                  </div>
                )}

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="featured-image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 16:9 ratio, at least 1200x675px
                  </p>
                </div>
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    leftIcon={<Hash className="w-4 h-4" />}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>

              {/* Editor Toolbar */}
              <div className="border border-gray-300 rounded-t-md bg-gray-50 p-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('**', '**')}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('*', '*')}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('\n- ')}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('[', '](url)')}
                  title="Link"
                >
                  <Link className="w-4 h-4" />
                </Button>
                <div className="h-4 w-px bg-gray-300 mx-1" />
                <span className="text-xs text-gray-500">
                  Reading time: {calculateReadingTime(formData.content)} min
                </span>
              </div>

              {/* Content Textarea */}
              <textarea
                id="content-editor"
                placeholder="Write your article content here..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-b-md border-t-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                rows={15}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length} characters
              </p>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Mark as featured article (will appear on homepage)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={loading}
              >
                Preview
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading || !formData.title || !formData.excerpt || !formData.content}
                className="flex-1"
              >
                {loading
                  ? 'Saving...'
                  : article
                    ? 'Update Article'
                    : formData.status === 'draft'
                      ? 'Save Draft'
                      : 'Publish Article'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};