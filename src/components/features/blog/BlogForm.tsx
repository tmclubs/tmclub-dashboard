import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Eye,
  Save,
  Bold,
  Italic,
  List,
  Link,
  Image as ImageIcon,
  Hash,
  Plus,
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { type BlogArticle, type BlogCategory } from './BlogArticleCard';

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  // Add optional file for backend upload
  featuredImageFile?: File;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

export interface BlogFormProps {
  article?: Partial<BlogArticle>;
  categories: BlogCategory[];
  onSubmit: (data: BlogFormData) => void;
  onPreview?: (data: BlogFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
}

export const BlogForm: React.FC<BlogFormProps> = ({
  article,
  categories,
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
    categoryId: article?.category?.id || categories[0]?.id || '',
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
      const file = files[0];
      // store raw File for backend upload in parent
      setFormData(prev => ({ ...prev, featuredImageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, featuredImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, featuredImage: '', featuredImageFile: undefined }));
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload a featured image for your article</p>
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="featured-image-input"
                        />
                        <label htmlFor="featured-image-input">
                          <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>Choose Image</Button>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <div className="flex items-center gap-2 mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => insertText('**', '**')} leftIcon={<Bold className="w-4 h-4" />}>Bold</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => insertText('*', '*')} leftIcon={<Italic className="w-4 h-4" />}>Italic</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => insertText('- ')} leftIcon={<List className="w-4 h-4" />}>List</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => insertText('[text](url)')} leftIcon={<Link className="w-4 h-4" />}>Link</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => insertText('![alt](image-url)')} leftIcon={<ImageIcon className="w-4 h-4" />}>Image</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => insertText('# ')} leftIcon={<Hash className="w-4 h-4" />}>Heading</Button>
              </div>
              <textarea
                id="content-editor"
                placeholder="Write your article content here"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Estimated reading time: {calculateReadingTime(formData.content)} mins</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} leftIcon={<Plus className="w-4 h-4" />}>Add Tag</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-red-500 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as BlogFormData['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">Show article in featured section</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
              )}
              <Button type="submit" loading={loading} leftIcon={<Save className="w-4 h-4" />}>{loading ? 'Saving...' : article ? 'Update Article' : 'Publish Article'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};