import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlogArticleCard,
  BlogForm,
  BlogList,
  type BlogArticle,
  type BlogAuthor,
  type BlogCategory,
  type BlogFormData,
} from '@/components/features/blog';
import { Button, Modal, ConfirmDialog, EmptyState, LoadingSpinner } from '@/components/ui';
import { Plus } from 'lucide-react';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '@/lib/hooks/useBlog';
import { blogApi } from '@/lib/api/blog';
import { type BlogPost, type BlogFormData as ApiBlogFormData } from '@/types/api';

export const BlogPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [previewData, setPreviewData] = useState<BlogFormData | null>(null);

  // Navigation hook
  const navigate = useNavigate();

  // API hooks
  const { data: blogPosts = [], isLoading, error } = useBlogPosts();
  const createBlogMutation = useCreateBlogPost();
  const updateBlogMutation = useUpdateBlogPost();
  const deleteBlogMutation = useDeleteBlogPost();

  // Mock categories - in real app, this would come from API
  const categories: BlogCategory[] = [
    { id: '1', name: 'Automotive News', color: '#ea580c' },
    { id: '2', name: 'Technology', color: '#3b82f6' },
    { id: '3', name: 'Industry Insights', color: '#10b981' },
    { id: '4', name: 'Company Updates', color: '#8b5cf6' },
    { id: '5', name: 'Events', color: '#f59e0b' },
    { id: '6', name: 'Tutorials', color: '#ef4444' },
  ];

  // Mock authors - in real app, this would come from API
  const authors: BlogAuthor[] = [
    {
      id: '1',
      name: 'Admin TMC',
      avatar: '/api/placeholder/100/100',
      role: 'Administrator',
    },
    {
      id: '2',
      name: 'John Doe',
      avatar: '/api/placeholder/100/100',
      role: 'Content Manager',
    },
    {
      id: '3',
      name: 'Jane Smith',
      role: 'Editor',
      avatar: '/api/placeholder/100/100',
    },
  ];

  // Map BlogPost (API) to BlogArticle (UI)
  const mapPostToArticle = (post: BlogPost): BlogArticle => {
    const author: BlogAuthor = {
      id: String(post.owned_by?.id || '1'),
      name: post.owned_by ? `${post.owned_by.first_name || ''} ${post.owned_by.last_name || ''}`.trim() || post.owned_by.username : 'Admin TMC',
      avatar: '/api/placeholder/100/100',
      role: 'Author',
    };

    const category: BlogCategory = categories.find(c => c.name === (post.category || '')) || categories[0];

    return {
      id: String(post.pk || post.slug || Math.random()),
      pk: post.pk,
      title: post.title,
      excerpt: post.summary,
      content: post.content,
      slug: post.slug,
      featuredImage: typeof post.main_image === 'string' ? post.main_image : (typeof post.main_image === 'object' && post.main_image?.image ? post.main_image.image : undefined),
      author,
      category,
      tags: post.tags || [],
      status: post.status || 'draft',
      publishedAt: post.published_at,
      createdAt: post.created_at || new Date().toISOString(),
      updatedAt: post.updated_at || new Date().toISOString(),
      readTime: post.read_time || 0,
      views: post.view_count || 0,
      likes: 0,
      comments: 0,
      featured: false,
    };
  };

  const articlesUI: BlogArticle[] = (blogPosts as BlogPost[]).map(mapPostToArticle);

  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setShowCreateModal(true);
  };

  const handleEditArticle = (article: BlogArticle) => {
    setSelectedArticle(article);
    setShowEditModal(true);
  };

  const handleDeleteArticle = (article: BlogArticle) => {
    setSelectedArticle(article);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedArticle?.pk !== undefined) {
      deleteBlogMutation.mutate(selectedArticle.pk, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedArticle(null);
        }
      });
    }
  };

  const handlePreview = (data: BlogFormData) => {
    setPreviewData(data);
    setView('preview');
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const toApiPayload = (data: BlogFormData): ApiBlogFormData => {
    return {
      title: data.title,
      summary: data.excerpt,
      slug: slugify(data.title),
      main_image: data.featuredImage || '',
      content: data.content,
      status: data.status,
      tags: data.tags,
      category: categories.find(c => c.id === data.categoryId)?.name || '',
    };
  };

  const handleArticleSubmit = async (data: BlogFormData) => {
    let apiPayload = toApiPayload(data);

    // Upload featured image first if a new file is provided
    if (data.featuredImageFile) {
      try {
        const uploadRes = await blogApi.uploadBlogImage(data.featuredImageFile);
        apiPayload.main_image = uploadRes.image;
      } catch (err) {
        console.error('Failed to upload featured image', err);
      }
    }

    if (selectedArticle?.pk !== undefined) {
      // Update existing article
      updateBlogMutation.mutate(
        { postId: selectedArticle.pk, data: apiPayload },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setSelectedArticle(null);
            setView('list');
          }
        }
      );
    } else {
      // Create new article
      createBlogMutation.mutate(apiPayload, {
        onSuccess: () => {
          setShowCreateModal(false);
          setSelectedArticle(null);
          setView('list');
        }
      });
    }
  };

  const handleViewArticle = (article: BlogArticle) => {
    setSelectedArticle(article);
    // Navigate to article detail page
    navigate(`/blog/${article.slug}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load blog posts. Please try again.</p>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Blog</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage and publish blog articles</p>
          </div>
          <Button onClick={handleCreateArticle} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Article</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>

        {/* Blog List */}
        {articlesUI.length === 0 ? (
          <EmptyState
            type="articles"
            title="No articles yet"
            description="Start creating content for your community blog."
            action={{
              text: 'Create Article',
              onClick: handleCreateArticle,
              icon: <Plus className="h-4 w-4" />,
            }}
          />
        ) : (
          <BlogList
            articles={articlesUI}
            categories={categories}
            loading={isLoading}
            onView={handleViewArticle}
            onEdit={handleEditArticle}
            onDelete={handleDeleteArticle}
            onCreate={handleCreateArticle}
          />
        )}

        {/* Create Article Modal */}
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Article"
          size="xl"
          preventClose={createBlogMutation.isPending}
        >
          <BlogForm
            onSubmit={handleArticleSubmit}
            onPreview={handlePreview}
            loading={createBlogMutation.isPending}
            onCancel={() => setShowCreateModal(false)}
            categories={categories}
          />
        </Modal>

        {/* Edit Article Modal */}
        <Modal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Article"
          size="xl"
          preventClose={updateBlogMutation.isPending}
        >
          <BlogForm
            article={selectedArticle || undefined}
            onSubmit={handleArticleSubmit}
            onPreview={handlePreview}
            loading={updateBlogMutation.isPending}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedArticle(null);
            }}
            categories={categories}
          />
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Delete Article"
          description={`Are you sure you want to delete "${selectedArticle?.title}"? This action cannot be undone.`}
          confirmText="Delete Article"
          variant="destructive"
          loading={deleteBlogMutation.isPending}
        />
      </div>
    );
  }

  if (view === 'preview' && previewData) {
    // Build UI article for preview
    const previewCategory = categories.find(c => c.id === previewData.categoryId) || categories[0];
    const previewAuthor: BlogAuthor = authors[0];
    const wordCount = (previewData.content || '').trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const previewArticle: BlogArticle = {
      id: 'preview',
      pk: 0,
      title: previewData.title,
      excerpt: previewData.excerpt,
      content: previewData.content,
      slug: 'preview',
      featuredImage: previewData.featuredImage,
      author: previewAuthor,
      category: previewCategory,
      tags: previewData.tags,
      status: previewData.status,
      publishedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readTime,
      views: 0,
      likes: 0,
      comments: 0,
      featured: previewData.featured,
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview</h1>
            <p className="text-gray-600">Review your article before publishing</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setView('list')}>
              Back to List
            </Button>
            <Button onClick={() => handleArticleSubmit(previewData)}>
              Publish Article
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <BlogArticleCard
            article={previewArticle}
            variant="featured"
            showActions={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-64">
      <p className="text-gray-500">Invalid view state</p>
    </div>
  );
};