import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  Save,
  Image as ImageIcon,
  UploadCloud,
  Youtube,
  Link as LinkIcon,
  FileText,
  LayoutGrid,
} from 'lucide-react';
import { Button, Input, Textarea, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { env } from '@/lib/config/env';
import { parseYouTubeId } from '@/lib/utils/validators';
import { type BlogPost, type BlogFormData as ApiBlogFormData } from '@/types/api';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TiptapEditor } from './TiptapEditor';
import { validateFile, createImagePreview, formatFileSize } from '@/lib/utils/file-upload';

export interface BlogFormData extends ApiBlogFormData {
  // For UI state management
  mainImageFile?: File;
  previewImage?: string;
  albumsFiles?: File[];
}

export interface BlogFormProps {
  article?: Partial<BlogPost>;
  onSubmit: (data: BlogFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const BlogForm: React.FC<BlogFormProps> = ({
  article,
  onSubmit,
  loading = false,
  onCancel,
  mode = 'create',
}) => {
  const normalizeUrl = (u?: string) => {
    if (!u) return '';
    if (u.startsWith('http')) return u;
    if (u.startsWith('/')) return `${env.apiUrl}${u}`;
    return u;
  };

  const [formData, setFormData] = useState<BlogFormData>({
    title: article?.title || '',
    summary: article?.summary || '',
    content: article?.content || '',
    slug: article?.slug || '',
    main_image: article?.main_image ? (typeof article.main_image === 'string' ? article.main_image : String(article.main_image)) : undefined,
    youtube_id: article?.youtube_id || '',
    youtube_embeded: article?.youtube_embeded || '',
    albums_id: article?.albums_id || [],
    mainImageFile: undefined,
    previewImage: normalizeUrl(article?.main_image_url),
  });

  const maxSizeText = formatFileSize(env.maxFileSize);

  const [showPreview, setShowPreview] = useState(false);
  const [albumsPreviews, setAlbumsPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = Array.isArray((article as any)?.albums_url) ? ((article as any).albums_url as string[]) : [];
    if (urls.length > 0 && albumsPreviews.length === 0) {
      setAlbumsPreviews(urls.map((u) => normalizeUrl(u)));
    }
  }, [article]);

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [field]: value
      };

      // Auto-generate youtube_embeded when youtube_id changes
      if (field === 'youtube_id') {
        const parsed = parseYouTubeId(String(value || ''));
        updatedData.youtube_id = parsed || '';
        updatedData.youtube_embeded = parsed ? `https://www.youtube-nocookie.com/embed/${parsed}` : '';
      }

      return updatedData;
    });
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

  // Albums management functions
  const handleAlbumsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const rawFiles = Array.from(files);
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      for (const file of rawFiles) {
        // Validate file
        const validation = validateFile(file);
        if (!validation.isValid) {
          alert(`Invalid file: ${file.name} - ${validation.error}`);
          continue;
        }

        // Create preview
        try {
          const preview = createImagePreview(file);
          validFiles.push(file);
          newPreviews.push(preview);
        } catch (err) {
          console.error(`Failed to create preview for ${file.name}`, err);
        }
      }

      if (validFiles.length > 0) {
        setFormData(prev => ({
          ...prev,
          albumsFiles: [...(prev.albumsFiles || []), ...validFiles],
          }));
        setAlbumsPreviews(prev => [...prev, ...newPreviews]);
      }
    } catch (error) {
      console.error("Error handling album upload:", error);
    } finally {
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const removeAlbum = (index: number) => {
    setFormData(prev => ({
      ...prev,
      albumsFiles: (prev.albumsFiles || []).filter((_, i) => i !== index),
    }));
    setAlbumsPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  return (
    <>
      <form id="blog-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Article Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                Article Details
              </CardTitle>
              <CardDescription>
                Basic information about your article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a catchy title..."
                  required
                  maxLength={200}
                  className="text-lg font-medium"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Ideally between 20-70 characters</span>
                  <span>{formData.title.length}/200</span>
                </div>
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /blog/
                  </span>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-friendly-title"
                    className="rounded-l-none"
                    maxLength={50}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Leave empty to auto-generate from title. Use dashes for spaces.</span>
                  <span>{(formData.slug || '').length}/50</span>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                  Summary <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Write a brief summary or excerpt..."
                  rows={3}
                  required
                  maxLength={255}
                  className="resize-none"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Appears in blog cards and search results</span>
                  <span>{formData.summary.length}/255</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor Card */}
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
               <div className="prose-editor flex-1">
                <TiptapEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Start writing your amazing story..."
                  className="min-h-[400px]"
                  disabled={loading}
                />
               </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          
          {/* Publish Action Card (Sticky on desktop) */}
          <div className="sticky top-24 z-20">
            <Card className="border-orange-100 shadow-md">
              <CardHeader className="bg-orange-50/50 pb-4">
                <CardTitle className="text-lg text-orange-900">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : (mode === 'create' ? 'Publish Article' : 'Update Article')}
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  {onCancel && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onCancel}
                      disabled={loading}
                      className="w-full text-gray-500 hover:text-gray-900"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Featured Image Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.previewImage ? (
                <div className="relative group">
                  <img
                    src={formData.previewImage}
                    alt="Featured image preview"
                    className="w-full aspect-video object-cover rounded-lg border border-gray-200"
                    onError={() => setFormData(prev => ({ ...prev, previewImage: '' }))}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative">
                   <input
                      id="main-image"
                      name="main-image"
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to {maxSizeText}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* YouTube Integration Card */}
          <Card>
             <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                Video Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="youtube_id" className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Link
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="youtube_id"
                    value={formData.youtube_id}
                    onChange={(e) => handleInputChange('youtube_id', e.target.value)}
                    placeholder="Paste YouTube URL"
                    className="pl-9"
                  />
                </div>
              </div>
              
              {formData.youtube_embeded && (
                <div className="w-full aspect-video bg-black rounded-md overflow-hidden border border-gray-200">
                  <iframe
                    src={formData.youtube_embeded}
                    title="YouTube preview"
                    className="w-full h-full"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery / Albums Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Photo Gallery
              </CardTitle>
              <CardDescription>Add extra photos to your post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center relative">
                  <input
                    id="albums-upload"
                    name="albums-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    multiple
                    onChange={handleAlbumsUpload}
                  />
                  <div className="flex flex-col items-center">
                    <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Upload Photos</span>
                  </div>
              </div>

              {albumsPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {albumsPreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded-md border border-gray-200"
                        onError={() => removeAlbum(index)}
                      />
                      <button
                        type="button"
                        onClick={() => removeAlbum(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </form>

      {/* Full Screen Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-white/95 backdrop-blur-sm">
                <div className="min-h-screen">
                   {/* Preview Header */}
                  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center">
                     <h3 className="text-xl font-bold text-gray-900">Article Preview</h3>
                      <Button
                        variant="outline"
                        onClick={() => setShowPreview(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Close Preview
                      </Button>
                  </div>

                  {/* Preview Content */}
                  <div className="max-w-4xl mx-auto px-6 py-12">
                    <article className="prose prose-lg prose-orange max-w-none">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title || 'Untitled Article'}</h1>
                      
                      {formData.summary && (
                        <p className="text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-orange-500 pl-4 italic">
                          {formData.summary}
                        </p>
                      )}

                      {formData.previewImage && (
                        <div className="rounded-xl overflow-hidden shadow-lg mb-10">
                          <img
                            src={formData.previewImage}
                            alt="Featured"
                            className="w-full max-h-[600px] object-cover"
                          />
                        </div>
                      )}

                      {formData.youtube_embeded && (
                        <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-10">
                          <iframe
                            src={formData.youtube_embeded}
                            title="YouTube preview"
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {formData.content ? (
                         <MarkdownRenderer content={formData.content} />
                      ) : (
                        <p className="text-gray-400 italic">No content written yet...</p>
                      )}

                      {albumsPreviews.length > 0 && (
                         <div className="mt-12 pt-12 border-t">
                            <h3 className="text-2xl font-bold mb-6">Gallery</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {albumsPreviews.map((src, i) => (
                                 <div key={i} className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover aspect-square" />
                                 </div>
                              ))}
                            </div>
                         </div>
                      )}
                    </article>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Sticky Footer Action Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex gap-3 items-center safe-area-bottom">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                type="submit"
                form="blog-form"
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </>
        );
};
