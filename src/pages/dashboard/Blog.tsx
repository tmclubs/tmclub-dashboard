import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlogForm,
  BlogList,
  type BlogArticle,
  type BlogAuthor,
} from '@/components/features/blog';
import {Modal, ConfirmDialog, LoadingSpinner } from '@/components/ui';
import { env } from '@/lib/config/env';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '@/lib/hooks/useBlog';
import { blogApi } from '@/lib/api/blog';
import { type BlogPost, type BlogFormData as ApiBlogFormData } from '@/types/api';
import { type BlogFormData } from '@/components/features/blog';

export const BlogPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<BlogPost | null>(null);
  
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

    const rawImage = (post as any).main_image_url
      || (typeof post.main_image === 'object' && (post.main_image as any)?.image)
      || (typeof post.main_image === 'string' ? (post.main_image as string) : undefined);
    const featuredImage = rawImage ? (rawImage.startsWith('http') ? rawImage : `${env.apiUrl}${rawImage}`) : undefined;

    return {
      id: String(post.pk || post.slug || Math.random()),
      pk: post.pk,
      title: post.title,
      excerpt: post.summary,
      content: post.content,
      slug: post.slug,
      featuredImage,
      author,
      tags: post.tags || [],
      status: 'published',
      publishedAt: post.published_at,
      createdAt: post.created_at || new Date().toISOString(),
      updatedAt: post.updated_at || new Date().toISOString(),
      readTime: post.read_time || 0,
      views: post.view_count || 0,
      likes: 0,
      comments: 0,
      featured: false,
      youtubeId: (post as any).youtube_id || undefined,
      youtubeEmbedUrl: (post as any).youtube_embeded || ((post as any).youtube_id ? `https://www.youtube-nocookie.com/embed/${(post as any).youtube_id}` : undefined),
    };
  };

  const articlesUI: BlogArticle[] = (blogPosts as BlogPost[]).map(mapPostToArticle);

  const handleCreateArticle = () => {
    setSelectedArticle(null);
    setShowCreateModal(true);
  };

  const handleEditArticle = async (article: BlogArticle) => {
    setSelectedArticle(article);
    setSelectedPostDetail(null);
    try {
      if (article.pk) {
        const detail = await blogApi.getBlogPost(article.pk);
        setSelectedPostDetail(detail);
      }
    } catch {}
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

  const toApiPayload = (data: BlogFormData, currentSlug?: string, mode: 'create' | 'edit' = 'create'): ApiBlogFormData => {
    const payload: ApiBlogFormData = {
      title: data.title,
      summary: data.summary,
      content: data.content,
      youtube_id: data.youtube_id || '',
      youtube_embeded: data.youtube_embeded || '',
    };

    if (mode === 'create') {
      payload.main_image = data.main_image ?? '';
    } else {
      if (data.main_image !== undefined) {
        payload.main_image = data.main_image;
      }
    }

    if (data.albums_id && data.albums_id.length > 0) {
      payload.albums_id = data.albums_id;
    }

    if (mode === 'create') {
      payload.slug = data.slug || slugify(data.title);
    } else {
      if (data.slug && (!currentSlug || data.slug !== currentSlug)) {
        payload.slug = data.slug;
      }
    }

    return payload;
  };

  const handleArticleSubmit = async (data: BlogFormData) => {
    const apiPayload = toApiPayload(data, selectedArticle?.slug, selectedArticle ? 'edit' : 'create');

    // Upload main image first if a new file is provided
    if (data.mainImageFile) {
      try {
        const uploadRes = await blogApi.uploadBlogImage(data.mainImageFile);
        apiPayload.main_image = String(uploadRes.pk);
      } catch (err) {
        console.error('Failed to upload main image', err);
      }
    }

    if (data.albumsFiles && data.albumsFiles.length > 0) {
      try {
        const uploaded = await Promise.all(
          data.albumsFiles.map(async (f) => {
            const res = await blogApi.uploadBlogImage(f);
            return res.pk;
          })
        );
        apiPayload.albums_id = uploaded;
      } catch (err) {
        console.error('Failed to upload albums', err);
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
          size="xl"
          preventClose={updateBlogMutation.isPending}
        >
          <BlogForm
            article={selectedPostDetail ? selectedPostDetail : (selectedArticle ? {
              pk: selectedArticle.pk,
              title: selectedArticle.title,
              summary: selectedArticle.excerpt,
              content: selectedArticle.content,
              slug: selectedArticle.slug,
              main_image: selectedArticle.featuredImage ? (typeof selectedArticle.featuredImage === 'string' ? undefined : { image: selectedArticle.featuredImage }) : undefined,
              main_image_url: selectedArticle.featuredImage,
              youtube_id: selectedArticle.youtubeId || '',
              youtube_embeded: selectedArticle.youtubeEmbedUrl || '',
              albums_id: [],
              albums_url: selectedArticle.albums || [],
            } : undefined)}
            onSubmit={handleArticleSubmit}
            loading={updateBlogMutation.isPending}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedArticle(null);
              setSelectedPostDetail(null);
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
