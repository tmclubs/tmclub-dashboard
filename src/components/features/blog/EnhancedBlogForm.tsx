import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  Eye,
  Save,
  Image as ImageIcon,
  Hash,
  Plus,
  Calendar,
  Search,
  Loader2
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge, LazyImage } from '@/components/ui';
import { BlogFormData } from '@/types/api';
import { ContentScheduler } from './ContentScheduler';
import { TiptapEditor } from './TiptapEditor';
import { validateFile, createImagePreview, cleanupImagePreview } from '@/lib/utils/file-upload';
import { blogApi } from '@/lib/api/blog';
import { parseYouTubeId } from '@/lib/utils/validators';

export interface EnhancedBlogFormData extends BlogFormData {
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
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
  onSubmit: (data: EnhancedBlogFormData) => void;
  onPreview?: (data: EnhancedBlogFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  title?: string;
  postId?: number;
}

export const EnhancedBlogForm: React.FC<EnhancedBlogFormProps> = ({
  article,
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
    setFormData(prev => {
      const next = { ...prev, [field]: value } as EnhancedBlogFormData;
      if (field === 'youtube_id') {
        const parsed = parseYouTubeId(String(value || ''));
        next.youtube_id = parsed || '';
        (next as any).youtube_embeded = parsed ? `https://www.youtube-nocookie.com/embed/${parsed}` : '';
      }
      return next;
    });
  };



  const handleScheduleUpdate = (status: string, publishDate?: string) => {
    setFormData(prev => ({
      ...prev,
      status: status as 'draft' | 'published' | 'archived',
      published_at: publishDate
    }));
  };

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Create preview
      const preview = await createImagePreview(file);
      setImagePreview(preview);

      // Upload file
      const result = await blogApi.uploadMainImage(file);
      
      clearInterval(progressInterval);
      
      // Update form data with file ID
      setFormData(prev => ({ 
        ...prev, 
        main_image: result.data?.file_id || '' 
      }));

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload gagal. Silakan coba lagi.');
      removeImage();
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      cleanupImagePreview(imagePreview);
    }
    setImagePreview('');
    setFormData(prev => ({ ...prev, main_image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadProgress(0);
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
                      <div className="relative w-full rounded-lg overflow-hidden">
                        <LazyImage
                          src={imagePreview}
                          alt="Featured image preview"
                          className="w-full max-h-96 object-contain bg-gray-50"
                          showSkeleton={false}
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
                      <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
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
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        leftIcon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      >
                        {isUploading ? 'Uploading...' : (imagePreview ? 'Change Image' : 'Upload Image')}
                      </Button>
                      
                      {/* Upload Progress */}
                      {isUploading && uploadProgress > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Uploading image...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: 16:9 ratio, at least 1200x675px
                      </p>
                    </div>
                  </div>
                </div>

                {/* YouTube Video ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Video ID
                  </label>
                  <Input
                    placeholder="YouTube link atau ID (opsional)"
                    value={formData.youtube_id || ''}
                    onChange={(e) => handleInputChange('youtube_id', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tempel link YouTube, otomatis diubah menjadi ID
                  </p>
                  {(formData as any).youtube_embeded && (
                    <div className="mt-3">
                      <div className="w-full aspect-video bg-black rounded-md overflow-hidden">
                        <iframe
                          src={(formData as any).youtube_embeded}
                          title="YouTube preview"
                          className="w-full h-full"
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Preview video otomatis jika ID valid</p>
                    </div>
                  )}
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
                  <TiptapEditor
                    content={formData.content || ''}
                    onChange={(content) => handleInputChange('content', content)}
                    placeholder="Write your article content here..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {(formData.content || '').length} characters
                    </p>
                    <p className="text-xs text-gray-500">
                      Reading time: {calculateReadingTime(formData.content || '')} min
                    </p>
                  </div>
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
