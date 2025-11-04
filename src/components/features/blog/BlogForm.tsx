import React, { useState } from 'react';
import {
  X,
  Eye,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { type BlogPost, type BlogFormData as ApiBlogFormData } from '@/types/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TiptapEditor } from './TiptapEditor';

export interface BlogFormData extends ApiBlogFormData {
  // For UI state management
  mainImageFile?: File;
  previewImage?: string;
}

export interface BlogFormProps {
  article?: Partial<BlogPost>;
  onSubmit: (data: BlogFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
  mode?: 'create' | 'edit';
}

export const BlogForm: React.FC<BlogFormProps> = ({
  article,
  onSubmit,
  loading = false,
  onCancel,
  title = article ? 'Edit Article' : 'Create New Article',
  mode = 'create',
}) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: article?.title || '',
    summary: article?.summary || '',
    content: article?.content || '',
    slug: article?.slug || '',
    main_image: article?.main_image ? (typeof article.main_image === 'string' ? article.main_image : String(article.main_image)) : undefined,
    youtube_id: article?.youtube_id || '',
    albums_id: article?.albums_id || [],
    mainImageFile: undefined,
    previewImage: article?.main_image_url || '',
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          mainImageFile: file,
          previewImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      mainImageFile: undefined,
      previewImage: '',
      main_image: undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            type="submit"
            form="blog-form"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
          </Button>
        </div>
      </div>

      <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter article title"
            required
          />
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
            Summary *
          </label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            placeholder="Brief description of the article"
            rows={3}
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug
          </label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="url-friendly-article-title"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to auto-generate from title
          </p>
        </div>

        {/* Main Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          {formData.previewImage ? (
            <div className="relative">
              <img
                src={formData.previewImage}
                alt="Featured image preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="main-image" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload an image
                    </span>
                    <input
                      id="main-image"
                      name="main-image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* YouTube ID */}
        <div>
          <label htmlFor="youtube_id" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video ID
          </label>
          <Input
            id="youtube_id"
            value={formData.youtube_id}
            onChange={(e) => handleInputChange('youtube_id', e.target.value)}
            placeholder="YouTube video ID (optional)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter the YouTube video ID (e.g., dQw4w9WgXcQ)
          </p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <TiptapEditor
            content={formData.content}
            onChange={(content) => handleInputChange('content', content)}
            placeholder="Write your article content using the rich text editor"
            className="w-full"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Use the rich text editor to format your article content. Content will be rendered as HTML.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
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
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Article' : 'Update Article')}
          </Button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black opacity-25" onClick={() => setShowPreview(false)} />
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Preview</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <article className="prose prose-lg max-w-none">
                <h1>{formData.title || 'Article Title'}</h1>
                {formData.summary && (
                  <div className="text-gray-600 text-lg mb-4">{formData.summary}</div>
                )}
                {formData.previewImage && (
                  <img
                    src={formData.previewImage}
                    alt="Featured image"
                    className="w-full h-64 object-cover rounded-lg mb-6"
                  />
                )}
                {formData.content && (
                  <div className="mt-6">
                    <MarkdownRenderer content={formData.content} />
                  </div>
                )}
              </article>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};