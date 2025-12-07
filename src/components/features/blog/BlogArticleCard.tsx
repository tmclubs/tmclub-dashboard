import React, { useState } from 'react';
import {
  Calendar,
  Heart,
  Share2,
  Edit,
  Trash2,
  BookOpen,
  Star,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
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
  onLike,
  onShare,
  className,
}) => {
  const [imageErrorCompact, setImageErrorCompact] = useState(false);
  

  const isGrid = variant === 'grid';
  const isCompact = variant === 'compact';
  
  if (isGrid) {
    return (
      <Card
        className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden h-full flex flex-col", onView ? "cursor-pointer" : "", className)}
        onClick={() => onView?.(article)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && onView) {
            e.preventDefault();
            onView(article);
          }
        }}
        role={onView ? "button" : undefined}
        tabIndex={onView ? 0 : undefined}
        aria-label={onView ? `Open ${article.title}` : undefined}
      >
        {/* Image Section - Proportional aspect ratio */}
        {article.featuredImage ? (
          <div className="relative aspect-[16/9] sm:aspect-[4/3] overflow-hidden">
            <img
              src={getBackendImageUrl(article.featuredImage)}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
              {article.featured && (
                <Badge className="bg-yellow-500 text-white border-yellow-600 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Featured</span>
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
              {/* Category removed */}
            </div>
          </div>
        ) : (
          <div className="relative aspect-[16/9] sm:aspect-[4/3] bg-gradient-to-br from-purple-400 to-pink-400">
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
              {article.featured && (
                <Badge className="bg-yellow-500 text-white border-yellow-600 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Featured</span>
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
              {/* Category removed */}
            </div>
          </div>
        )}

        <CardContent className="blog-card-padding flex-1 flex flex-col">
          <div className="blog-section-spacing flex-1">
            {/* Title - Using blog-title utility */}
            <h3 className="blog-title line-clamp-2 group-hover:text-purple-600 transition-colors">
              {article.title}
            </h3>

            {/* Excerpt - Using blog-excerpt utility */}
            <p className="blog-excerpt line-clamp-2 sm:line-clamp-3 flex-1">
              {article.excerpt}
            </p>

            {/* Tags - Using blog-tag utility */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 2).map((tag, index) => (
                  <span key={index} className="blog-tag">
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 2 && (
                  <span className="blog-tag">
                    +{article.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats removed from card */}

          {/* Author - Using blog-meta utility */}
          {showAuthor && (
            <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-gray-100">
              <Avatar
                src={article.author.avatar}
                name={article.author.name}
                size="sm"
                className="w-6 h-6 sm:w-8 sm:h-8"
              />
              <div className="flex-1 min-w-0">
                <p className="blog-meta font-medium line-clamp-1">
                  {article.author.name}
                </p>
                <p className="blog-meta">
                  {formatRelativeTime(article.publishedAt || article.createdAt)}
                </p>
              </div>
            </div>
          )}

          {/* Actions - Using blog-button-group utility */}
          {showActions && (
            <div className="blog-button-group pt-2 sm:pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="default"
                onClick={(e) => { e.stopPropagation(); onView?.(article); }}
                fullWidth
                className="blog-button flex-1"
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                Read
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onEdit(article); }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); onDelete(article); }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow border-gray-200", className)}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex gap-3 sm:gap-4">
            {/* Image - Responsive size */}
            {article.featuredImage && !imageErrorCompact ? (
              <img
                src={getBackendImageUrl(article.featuredImage)}
                alt={article.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                onError={() => setImageErrorCompact(true)}
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Title - Responsive font size */}
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-1 sm:mb-2 leading-tight">
                    {article.title}
                  </h3>
                  
                  {/* Badges - Responsive layout */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                    
                  </div>
                  
                  {/* Stats - Responsive grid */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{formatDate(article.publishedAt || article.createdAt)}</span>
                  </div>
                </div>

                {/* Actions - Responsive buttons */}
                {showActions && (
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(article)}
                        className="h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(article)}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Featured/Default variant - Enhanced mobile-optimized
  return (
    <Card
      className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200 h-full flex flex-col", onView ? "cursor-pointer" : "", className)}
      onClick={() => onView?.(article)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onView) {
          e.preventDefault();
          onView(article);
        }
      }}
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
      aria-label={onView ? `Open ${article.title}` : undefined}
    >
      {/* Featured Image - Proportional aspect ratio */}
      {article.featuredImage && (
        <div className="relative overflow-hidden rounded-t-lg aspect-[16/9] sm:aspect-[4/3]">
          <img
            src={getBackendImageUrl(article.featuredImage)}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        {article.featured && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white border-yellow-600 text-xs">
            <Star className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Featured</span>
          </Badge>
        )}
      </div>
    )}

      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Header with badges for no-image cards */}
          {!article.featuredImage && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {article.featured && (
                <Badge className="bg-yellow-500 text-white border-yellow-600 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Featured</span>
                </Badge>
              )}
            </div>
          )}

          {/* Title and Actions - Responsive layout */}
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <h3 className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors leading-tight flex-1">
              {article.title}
            </h3>
            {showActions && (
              <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(article)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(article)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Excerpt - Responsive text size */}
          <p className="text-sm sm:text-base text-gray-600 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Tags - Responsive layout */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.slice(0, window.innerWidth < 640 ? 2 : 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                  #{tag}
                </Badge>
              ))}
              {article.tags.length > (window.innerWidth < 640 ? 2 : 3) && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  +{article.tags.length - (window.innerWidth < 640 ? 2 : 3)}
                </Badge>
              )}
            </div>
          )}

          {/* Stats removed from card */}

          {/* Author & Date - Enhanced responsive layout */}
          {showAuthor && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar
                  src={article.author.avatar}
                  name={article.author.name}
                  size="sm"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{article.author.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(article.publishedAt || article.createdAt)}
                  </p>
                </div>
              </div>
              {/* Trending indicator removed */}
            </div>
          )}

          {/* Actions - Enhanced responsive layout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-gray-100">
            {onView && (
              <Button
                variant="outline"
                size="default"
                onClick={(e) => { e.stopPropagation(); onView(article); }}
                className="flex-1 sm:flex-none"
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Read Article</span>
                <span className="sm:hidden">Read</span>
              </Button>
            )}
            <div className="flex gap-2">
              {onLike && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => onLike(article)}
                  className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                  leftIcon={<Heart className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Like</span>
                </Button>
              )}
              {onShare && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => onShare(article)}
                  className="flex-1 sm:flex-none"
                  leftIcon={<Share2 className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline">Share</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
