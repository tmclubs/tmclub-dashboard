import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlogForm,
  BlogList,
  type BlogArticle,
  type BlogAuthor,
} from '@/components/features/blog';
import {Modal, ConfirmDialog, LoadingSpinner } from '@/components/ui';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '@/lib/hooks/useBlog';
import { blogApi } from '@/lib/api/blog';
import { type BlogPost, type BlogFormData as ApiBlogFormData } from '@/types/api';
import { type BlogFormData } from '@/components/features/blog';

export const BlogPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  
  // Navigation hook
  const navigate = useNavigate();

  // API hooks
  // Controlled filters (sinkron dengan API): search, status, ordering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'publishedAt' | 'views'>('createdAt');

  const mapOrdering = (sort: 'createdAt' | 'publishedAt' | 'views') => {
    switch (sort) {
      case 'publishedAt':
        return '-published_at';
      case 'views':
        return '-view_count';
      case 'createdAt':
      default:
        return '-created_at';
    }
  };

  const { data: blogPosts = [], isLoading, error } = useBlogPosts({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    ordering: mapOrdering(sortBy),
  });
  const createBlogMutation = useCreateBlogPost();
  const updateBlogMutation = useUpdateBlogPost();
  const deleteBlogMutation = useDeleteBlogPost();

  // Kategori dari API berupa string; gunakan fallback sederhana tanpa filter kategori

  
  // Map BlogPost (API) to BlogArticle (UI)
  const mapPostToArticle = (post: BlogPost): BlogArticle => {
    // Hilangkan debug logging di browser

    // owned_by kadang berupa object (id, username, first_name, last_name) dan kadang berupa number (ID saja)
    const ownedBy = post.owned_by as any;
    const computedName = (post.owned_by_username && post.owned_by_username.trim())
      || (post.author_name && post.author_name.trim())
      || 'TMC Admin';

    const author: BlogAuthor = {
      id: String((ownedBy && typeof ownedBy === 'object') ? (ownedBy.id ?? '1') : (ownedBy ?? '1')),
      name: computedName,
      avatar: undefined,
      role: 'Author',
    };

    return {
      id: String(post.pk || post.slug || Math.random()),
      pk: post.pk,
      title: post.title,
      excerpt: post.summary,
      content: post.content,
      slug: post.slug,
      featuredImage: typeof post.main_image === 'string' ? post.main_image : (typeof post.main_image === 'object' && post.main_image?.image ? post.main_image.image : undefined),
      author,
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

  
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const toApiPayload = (data: BlogFormData): ApiBlogFormData => {
    return {
      title: data.title,
      summary: data.summary,
      slug: data.slug || slugify(data.title),
      main_image: data.main_image || '',
      content: data.content,
      youtube_id: data.youtube_id || '',
      youtube_embeded: data.youtube_embeded || '',
      albums_id: data.albums_id || [],
    };
  };

  const handleArticleSubmit = async (data: BlogFormData) => {
    const apiPayload = toApiPayload(data);

    // Upload main image first if a new file is provided
    if (data.mainImageFile) {
      try {
        const uploadRes = await blogApi.uploadBlogImage(data.mainImageFile);
        apiPayload.main_image = uploadRes.image;
      } catch (err) {
        console.error('Failed to upload main image', err);
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
          }
        }
      );
    } else {
      // Create new article
      createBlogMutation.mutate(apiPayload, {
        onSuccess: () => {
          setShowCreateModal(false);
          setSelectedArticle(null);
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

  {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Blog List */}
        <BlogList
          articles={articlesUI}
          loading={isLoading}
          onView={handleViewArticle}
          onEdit={handleEditArticle}
          onDelete={handleDeleteArticle}
          onCreate={handleCreateArticle}
          // Controlled filters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          sortBy={sortBy}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onSortChange={setSortBy}
        />

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
            loading={createBlogMutation.isPending}
            onCancel={() => setShowCreateModal(false)}
            mode="create"
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
            article={selectedArticle ? {
              pk: selectedArticle.pk,
              title: selectedArticle.title,
              summary: selectedArticle.excerpt,
              content: selectedArticle.content,
              slug: selectedArticle.slug,
              main_image: selectedArticle.featuredImage ? (typeof selectedArticle.featuredImage === 'string' ? undefined : { image: selectedArticle.featuredImage }) : undefined,
              youtube_id: '',
              albums_id: [],
            } : undefined}
            onSubmit={handleArticleSubmit}
            loading={updateBlogMutation.isPending}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedArticle(null);
            }}
            mode="edit"
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
};