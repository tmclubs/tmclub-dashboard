import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogArticleCard, type BlogArticle, type BlogAuthor } from '@/components/features/blog';
import { LoadingSpinner, EmptyState } from '@/components/ui';
import { useBlogPosts } from '@/lib/hooks/useBlog';
import type { BlogPost } from '@/types/api';
import PublicNavbar from '@/components/landing/PublicNavbar';
import PublicFooter from '@/components/landing/PublicFooter';
import { env } from '@/lib/config/env';

export const PublicBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { data = [], isLoading, error } = useBlogPosts({ status: 'published', ordering: '-published_at' });

  const mapPostToArticle = (post: BlogPost): BlogArticle => {
    const computedName = (post.owned_by_username && post.owned_by_username.trim())
      || (post.author_name && post.author_name.trim())
      || 'TMC Admin';

    const author: BlogAuthor = {
      id: String((post.owned_by as any) || '1'),
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
    };
  };

  const articles: BlogArticle[] = (Array.isArray(data) ? data : []).map(mapPostToArticle);

  const handleView = (article: BlogArticle) => {
    navigate(`/blog/${article.slug}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Gagal memuat artikel"
          description="Terjadi kesalahan saat mengambil data artikel. Coba lagi nanti."
        />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Belum ada artikel"
          description="Saat ini belum ada artikel yang tersedia."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Blog Publik</h1>
          <p className="mt-2 text-gray-600">Baca artikel terbaru dari komunitas dan perusahaan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {articles.map((article) => (
            <BlogArticleCard
              key={article.id}
              article={article}
              variant="grid"
              onView={handleView}
              showActions={false}
            />
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PublicBlogPage;