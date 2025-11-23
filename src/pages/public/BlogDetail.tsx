import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogDetail } from '@/components/features/blog';
import { LoadingSpinner} from '@/components/ui';
import { blogApi } from '@/lib/api/blog';
import { env } from '@/lib/config/env';
import { type BlogPost } from '@/types/api';
import { type BlogArticle, type BlogAuthor } from '@/components/features/blog';
import PublicNavbar from '@/components/landing/PublicNavbar';

export const PublicBlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapPostToArticle = (post: BlogPost): BlogArticle => {
    const computedName = (post.owned_by_username && post.owned_by_username.trim())
      || (post.author_name && post.author_name.trim())
      || 'TMC Admin';

    const author: BlogAuthor = {
      id: String(post.owned_by || '1'),
      name: computedName,
      avatar: undefined,
      role: 'Author',
    };

    const rawImage = (post as any).main_image_url
      || (typeof post.main_image === 'object' && (post.main_image as any)?.image)
      || (typeof post.main_image === 'string' ? (post.main_image as string) : undefined);
    const featuredImage = rawImage ? (rawImage.startsWith('http') ? rawImage : `${env.apiUrl}${rawImage}`) : undefined;
    const albumsRaw = (post as any).albums_url as string[] | undefined;
    const albums = Array.isArray(albumsRaw)
      ? albumsRaw.map((u) => (u.startsWith('http') ? u : `${env.apiUrl}${u}`))
      : [];

    return {
      id: String(post.pk || post.slug || Math.random()),
      pk: post.pk,
      title: post.title,
      excerpt: post.summary,
      content: post.content,
      slug: post.slug,
      featuredImage,
      author,
      albums,
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

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Slug artikel tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await blogApi.getBlogPostBySlug(slug);
        const articleData = mapPostToArticle(response);
        setArticle(articleData);
        if (response.pk) {
          try {
            await blogApi.incrementViewCount(response.pk);
          } catch (viewErr) {
            console.warn('Failed to increment view count:', viewErr);
          }
        }
      } catch (err: any) {
        console.error('Error fetching article:', err);
        setError('Gagal memuat artikel. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const handleBack = () => {
    navigate('/blog');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Kembali ke Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Artikel Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Artikel yang Anda cari tidak dapat ditemukan.</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Kembali ke Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PublicNavbar />
      <BlogDetail article={article} onBack={handleBack} />
    </>
  );
};

export default PublicBlogDetailPage;
