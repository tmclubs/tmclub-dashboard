import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogDetail } from '@/components/features/blog';
import { LoadingSpinner } from '@/components/ui';
import { blogApi } from '@/lib/api/blog';
import { type BlogPost } from '@/types/api';
import { type BlogArticle, type BlogAuthor, type BlogCategory } from '@/components/features/blog';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock categories - same as in Blog.tsx
  const categories: BlogCategory[] = [
    { id: '1', name: 'Technology', color: '#3B82F6' },
    { id: '2', name: 'Business', color: '#10B981' },
    { id: '3', name: 'Design', color: '#8B5CF6' },
    { id: '4', name: 'Marketing', color: '#F59E0B' },
    { id: '5', name: 'Development', color: '#EF4444' },
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
        
        // Fetch article by slug
        const response = await blogApi.getBlogPostBySlug(slug);
        const articleData = mapPostToArticle(response);
        setArticle(articleData);

        // Increment view count if article has pk
        if (response.pk) {
          try {
            await blogApi.incrementViewCount(response.pk);
          } catch (viewErr) {
            // Don't fail the whole page if view count increment fails
            console.warn('Failed to increment view count:', viewErr);
          }
        }
      } catch (err: any) {
        console.error('Error fetching article:', err);
        
        // More specific error messages
        if (err?.response?.status === 404) {
          setError('Artikel tidak ditemukan. Mungkin artikel telah dihapus atau URL tidak valid.');
        } else if (err?.response?.status === 403) {
          setError('Anda tidak memiliki akses untuk melihat artikel ini.');
        } else if (err?.response?.status >= 500) {
          setError('Terjadi kesalahan server. Silakan coba lagi nanti.');
        } else {
          setError('Gagal memuat artikel. Silakan coba lagi.');
        }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  return <BlogDetail article={article} onBack={handleBack} />;
};