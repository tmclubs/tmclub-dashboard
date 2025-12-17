import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Badge, Button, LoadingSkeleton, LazyImage } from '@/components/ui';
import { useBlogPosts } from '@/lib/hooks';
import type { BlogPost } from '@/types/api';
import { getBackendImageUrl } from '@/lib/utils/image';

const BlogPreview: React.FC = () => {
  const { data, isLoading, isError } = useBlogPosts({ status: 'published', ordering: '-published_at' });

  const getMainImageUrl = (post: BlogPost): string | undefined => {
    let url: string | undefined;
    if ((post as any).main_image_url) {
      url = (post as any).main_image_url as string;
    } else {
      const mi = post.main_image as { image?: string } | number | null | undefined;
      if (mi && typeof mi === 'object' && 'image' in mi) {
        url = mi.image as string;
      }
    }
    return getBackendImageUrl(url);
  };

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Artikel Terbaru</h2>
            <p className="mt-2 text-gray-600">Update blog perusahaan dan komunitas.</p>
          </div>
          <Link to="/blog">
            <Button variant="outline">Lihat Semua</Button>
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <LoadingSkeleton variant="rectangular" height="8rem" className="w-full" />
                  <LoadingSkeleton height="1rem" width="75%" className="mt-3" />
                  <LoadingSkeleton height="1rem" width="50%" className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-sm text-red-600">Gagal memuat artikel.</div>
        )}

        {!isLoading && Array.isArray(data) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.slice(0, 6).map((post: BlogPost) => (
              <Card key={post.pk} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {(() => {
                    const imageUrl = getMainImageUrl(post);
                    return imageUrl ? (
                      <LazyImage
                        src={imageUrl}
                        alt={post.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ) : null;
                  })()}
                  <h3 className="mt-3 font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags?.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link to={`/blog/${post.slug}`}
                      className="text-sm text-orange-700 hover:text-orange-800">
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPreview;