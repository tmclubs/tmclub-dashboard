import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  Eye,
  Save,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { type BlogArticle, type BlogCategory } from './BlogArticleCard';
import { TiptapEditor } from './TiptapEditor';

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



  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <CardTitle className="text-lg sm:text-xl truncate">{title}</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                leftIcon={<Eye className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm touch-manipulation"
                aria-label="Preview article"
              >
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                leftIcon={<Save className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm touch-manipulation"
                aria-label={article ? "Update article" : "Publish article"}
              >
                {loading ? 'Saving...' : article ? 'Update Article' : 'Publish Article'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Article Title *
              </label>
              <Input
                placeholder="Enter article title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                className="text-base sm:text-lg font-medium"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Excerpt *
              </label>
              <textarea
                placeholder="Brief description of the article (appears in article cards)"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.excerpt.length}/200 characters
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Featured Image
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Featured image preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 touch-manipulation"
                      aria-label="Remove featured image"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      <p className="text-xs sm:text-sm text-gray-600">Upload a featured image for your article</p>
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
                          <Button 
                            variant="outline" 
                            leftIcon={<Upload className="w-3 h-3 sm:w-4 sm:h-4" />} 
                            className="text-xs sm:text-sm touch-manipulation"
                            aria-label="Choose featured image"
                          >
                            Choose Image
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Content *
              </label>
              <div className="border border-gray-300 rounded-md min-h-[200px] sm:min-h-[300px]">
                <TiptapEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Write your article content here..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Estimated reading time: {calculateReadingTime(formData.content)} mins</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Tags
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 text-sm sm:text-base"
                />
                <Button 
                  type="button" 
                  onClick={addTag} 
                  leftIcon={<Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
                  className="w-full sm:w-auto text-xs sm:text-sm touch-manipulation"
                  aria-label="Add tag"
                >
                  Add Tag
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)} 
                      className="text-red-500 hover:text-red-600 touch-manipulation p-0.5"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Published
                  </label>
                  <p className="text-xs text-gray-500">
                    Make this article visible to readers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.status === 'published'}
                  onChange={(e) => handleInputChange('status', e.target.checked ? 'published' : 'draft')}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Featured
                  </label>
                  <p className="text-xs text-gray-500">
                    Highlight this article on homepage
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
              {onCancel && (
                <Button 
                  variant="outline" 
                  onClick={onCancel} 
                  className="w-full sm:w-auto text-sm touch-manipulation"
                  aria-label="Cancel editing"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const draftData = { ...formData, status: 'draft' as const };
                  onSubmit(draftData);
                }} 
                loading={loading}
                className="w-full sm:w-auto text-sm touch-manipulation"
                aria-label="Save as draft"
              >
                Save as Draft
              </Button>
              <Button 
                type="submit" 
                loading={loading} 
                leftIcon={<Save className="w-4 h-4" />}
                className="w-full sm:w-auto text-sm touch-manipulation"
                aria-label={article ? "Update article" : "Publish article"}
              >
                {loading ? 'Saving...' : article ? 'Update Article' : 'Publish Article'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};