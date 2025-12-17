import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface PublicPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
}

interface MemberContentProps {
  posts: PublicPost[];
}

export const MemberContent: React.FC<MemberContentProps> = ({ posts }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Konten Publik</h3>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Belum ada konten.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <LazyImage
                  src={getBackendImageUrl(post.image)} 
                  alt={post.title} 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-orange-600 transition">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {post.excerpt}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
