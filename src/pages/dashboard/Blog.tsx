import React, { useState } from 'react';
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
import { Plus, BookOpen } from 'lucide-react';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '@/lib/hooks/useBlog';

export const BlogPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [previewData, setPreviewData] = useState<BlogFormData | null>(null);

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
    if (selectedArticle) {
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

  const handleArticleSubmit = (data: BlogFormData) => {
    if (selectedArticle) {
      // Update existing article
      updateBlogMutation.mutate(
        { postId: selectedArticle.pk, data },
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
      createBlogMutation.mutate(data, {
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
    // TODO: Navigate to article detail page or show detail modal
    console.log('View article:', article);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
            <p className="text-gray-600">Manage and publish blog articles</p>
          </div>
          <Button onClick={handleCreateArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        </div>

        {/* Blog List */}
        {blogPosts.length === 0 ? (
          <EmptyState
            type="blog"
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
            articles={blogPosts}
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
            authors={authors}
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
            authors={authors}
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
            article={{
              pk: 0,
              title: previewData.title,
              summary: previewData.summary,
              content: previewData.content,
              main_image: null,
              youtube_id: previewData.youtube_id,
              albums: [],
              created_at: new Date().toISOString(),
            }}
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