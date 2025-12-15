import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlogList,
  type BlogArticle,
  type BlogAuthor,
} from '@/components/features/blog';
import { ConfirmDialog, LoadingSpinner } from '@/components/ui';
import { env } from '@/lib/config/env';
import { useBlogPosts, useDeleteBlogPost } from '@/lib/hooks/useBlog';
import { type BlogPost } from '@/types/api';

export const BlogPage: React.FC = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  // Navigation hook
  const navigate = useNavigate();

  // API hooks
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
  const deleteBlogMutation = useDeleteBlogPost();

  const mapPostToArticle = (post: BlogPost): BlogArticle => {
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
    navigate('create');
  };

  const handleEditArticle = (article: BlogArticle) => {
    if (article.pk) {
      navigate(`edit/${article.pk}`);
    }
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

  const handleViewArticle = (article: BlogArticle) => {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <BlogList
        articles={articlesUI}
        loading={isLoading}
        onView={handleViewArticle}
        onEdit={handleEditArticle}
        onDelete={handleDeleteArticle}
        onCreate={handleCreateArticle}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortBy={sortBy}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
      />

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
};
