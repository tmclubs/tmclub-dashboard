import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  BookOpen,
  Star,
  Eye,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { formatRelativeTime } from '@/lib/utils/date';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  featuredImage?: string;
  albums?: string[];
  author: BlogAuthor;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readTime: number;
  views: number;
  likes: number;
  comments: number;
  featured?: boolean;
  pk?: number; // optional backend identifier for mutations
  youtubeId?: string;
  youtubeEmbedUrl?: string;
}

export interface BlogArticleCardProps {
  article: BlogArticle;
  variant?: 'default' | 'featured' | 'compact' | 'grid';
  showActions?: boolean;
  showAuthor?: boolean;
  showStats?: boolean;
  onView?: (article: BlogArticle) => void;
  onEdit?: (article: BlogArticle) => void;
  onDelete?: (article: BlogArticle) => void;
  onLike?: (article: BlogArticle) => void;
  onShare?: (article: BlogArticle) => void;
  className?: string;
}

export const BlogArticleCard: React.FC<BlogArticleCardProps> = ({
  article,
  variant = 'default',
  showActions = false,
  showAuthor = true,
  onView,
  onEdit,
  onDelete,
  className,
}) => {
  const [imageError, setImageError] = useState(false);
  const isCompact = variant === 'compact';

  // Helper for formatting date
  const displayDate = article.publishedAt 
    ? formatRelativeTime(article.publishedAt)
    : formatRelativeTime(article.createdAt);

  if (isCompact) {
    return (
      <Card className={cn("group hover:shadow-md transition-all duration-300 border-gray-200 bg-white overflow-hidden", className)}>
        <div className="flex p-3 sm:p-4 gap-4 h-full">
          {/* Image Section */}
          <div className="relative w-24 sm:w-32 aspect-square flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
             {article.featuredImage && !imageError ? (
              <img
                src={getBackendImageUrl(article.featuredImage)}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-orange-300">
                <BookOpen className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
              <h3 className="font-bold text-gray-900 line-clamp-2 text-base mb-1 group-hover:text-orange-600 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                 <span>{displayDate}</span>
                 <span>•</span>
                 <span className="font-medium text-gray-700">{article.author.name}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button variant="ghost" size="sm" onClick={() => onEdit(article)} className="h-8 px-2 text-gray-500 hover:text-gray-900">
                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="sm" onClick={() => onDelete(article)} className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Modern Card Design (Default & Grid)
  return (
    <Card 
      className={cn(
        "group flex flex-col h-full bg-white border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden",
        onView ? "cursor-pointer" : "",
        className
      )}
      onClick={() => onView?.(article)}
    >
      {/* Image Header */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {article.featuredImage && !imageError ? (
          <img
            src={getBackendImageUrl(article.featuredImage)}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/50" />
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {article.featured && (
            <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-none shadow-sm backdrop-blur-sm">
              <Star className="w-3 h-3 mr-1 fill-current" /> Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Content Body */}
      <CardContent className="flex-1 flex flex-col p-5">
        
        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors leading-snug">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
          {article.excerpt || "No summary available for this article."}
        </p>

        {/* Footer Info */}
        <div className="pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            {showAuthor && (
              <div className="flex items-center gap-2.5">
                <Avatar 
                  src={article.author.avatar} 
                  name={article.author.name} 
                  className="w-8 h-8 ring-2 ring-white"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {article.author.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {displayDate}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-300 transition-colors group/btn"
              onClick={(e) => { e.stopPropagation(); onView?.(article); }}
              title="Read Article"
            >
              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </Button>
            
            {showActions ? (
               <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onEdit(article); }}
                    className="flex-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onDelete(article); }}
                    className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
               </div>
            ) : (
               <div className="flex justify-end items-center text-gray-400 gap-3 text-sm">
                  {/* Stats placeholders could go here */}
               </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
