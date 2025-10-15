import React, { useState, useRef, useEffect } from 'react';
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
  Calendar,
  Search
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { BlogFormData } from '@/types/api';
import { ContentScheduler } from './ContentScheduler';

export interface EnhancedBlogFormData extends BlogFormData {
  seo_data?: {
    slug?: string;
    meta_description?: string;
    meta_keywords?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    canonical_url?: string;
  };
  published_at?: string;
}

export interface EnhancedBlogFormProps {
  article?: Partial<EnhancedBlogFormData>;
  categories: string[];
  onSubmit: (data: EnhancedBlogFormData) => void;
  onPreview?: (data: EnhancedBlogFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
  postId?: number;
}

export const EnhancedBlogForm: React.FC<EnhancedBlogFormProps> = ({
  article,
  categories,
  onSubmit,
  onPreview,
  loading = false,
  onCancel,
  title = article ? 'Edit Article' : 'Create New Article',
  postId
}) => {
  const [formData, setFormData] = useState<EnhancedBlogFormData>({
    title: article?.title || '',
    summary: article?.summary || '',
    slug: article?.slug || '',
    content: article?.content || '',
    main_image: article?.main_image || '',
    youtube_id: article?.youtube_id || '',
    tags: article?.tags || [],
    category: article?.category || categories[0] || '',
    status: article?.status || 'draft',
    published_at: article?.published_at || '',
    seo_data: article?.seo_data || {
      slug: article?.slug || '',
      meta_description: '',
      meta_keywords: '',
      og_title: '',
      og_description: '',
      og_image: '',
      canonical_url: '',
    },
  });

  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string>(article?.main_image || '');
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'schedule'>('content');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof EnhancedBlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleScheduleUpdate = (status: string, publishDate?: string) => {
    setFormData(prev => ({
      ...prev,
      status: status as 'draft' | 'published' | 'archived',
      published_at: publishDate || prev.published_at
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, main_image: result }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, main_image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Merge SEO data with form data
    const submitData: EnhancedBlogFormData = {
      ...formData,
      slug: formData.seo_data?.slug || formData.slug || generateSlugFromTitle(formData.title),
      meta_description: formData.seo_data?.meta_description,
      meta_keywords: formData.seo_data?.meta_keywords,
      og_title: formData.seo_data?.og_title,
      og_description: formData.seo_data?.og_description,
      og_image: formData.seo_data?.og_image,
      canonical_url: formData.seo_data?.canonical_url,
    };

    onSubmit(submitData);
  };

  const handlePreview = () => {
    const previewData: EnhancedBlogFormData = {
      ...formData,
      slug: formData.seo_data?.slug || formData.slug || generateSlugFromTitle(formData.title),
    };
    onPreview?.(previewData);
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
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

  const getTabIcon = (tab: typeof activeTab) => {
    switch (tab) {
      case 'content':
        return <Edit3 className="w-4 h-4" />;
      case 'seo':
        return <Search className="w-4 h-4" />;
      case 'schedule':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Edit3 className="w-4 h-4" />;
    }
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (formData.title && !formData.slug && !formData.seo_data?.slug) {
      const slug = generateSlugFromTitle(formData.title);
      setFormData(prev => ({
        ...prev,
        slug,
        seo_data: { ...prev.seo_data, slug }
      }));
    }
  }, [formData.title]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
                {loading ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {(['content', 'seo', 'schedule'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getTabIcon(tab)}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
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
                  <p className="text-xs text-gray-500 mt-1">
                    This will also be used to generate the URL slug
                  </p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    placeholder="Brief description of the article (appears in article cards)"
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.summary.length}/200 characters
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

                {/* Category and YouTube ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube Video ID
                    </label>
                    <Input
                      placeholder="YouTube video ID (optional)"
                      value={formData.youtube_id || ''}
                      onChange={(e) => handleInputChange('youtube_id', e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Extract from YouTube URL: youtube.com/watch?v=VIDEO_ID
                    </p>
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

                    {formData.tags && formData.tags.length > 0 && (
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
                      Reading time: {calculateReadingTime(formData.content || '')} min
                    </span>
                  </div>

                  {/* Content Textarea */}
                  <textarea
                    id="content-editor"
                    placeholder="Write your article content here..."
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-b-md border-t-0 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    rows={15}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(formData.content || '').length} characters
                  </p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <p className="text-gray-500">SEO optimization features will be available soon.</p>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <ContentScheduler
                currentStatus={formData.status}
                currentPublishDate={formData.published_at}
                postId={postId}
                onUpdate={handleScheduleUpdate}
                disabled={loading}
              />
            )}

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
                disabled={loading || !formData.title || !formData.summary || !formData.content}
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

// Add missing import
import { Edit3 } from 'lucide-react';