import React from 'react';
import {
  Calendar,
  Clock,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Edit,
  Trash2,
  BookOpen,
  Tag,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, Badge, Button, Avatar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  color: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  author: BlogAuthor;
  category: BlogCategory;
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
  showStats = true,
  onView,
  onEdit,
  onDelete,
  onLike,
  onShare,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isGrid = variant === 'grid';
  const isCompact = variant === 'compact';
  
  if (isGrid) {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200 overflow-hidden", className)}>
        {/* Image Section */}
        {article.featuredImage ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              {article.featured && (
                <Badge className="bg-yellow-500 text-white border-yellow-600 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge className={cn("text-xs border backdrop-blur-sm", getStatusColor(article.status))}>
                {article.status}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <Badge
                className="text-xs border backdrop-blur-sm"
                style={{ backgroundColor: article.category.color + '20', color: article.category.color, borderColor: article.category.color }}
              >
                {article.category.name}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 relative">
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute top-3 left-3 flex gap-2">
              {article.featured && (
                <Badge className="bg-yellow-500 text-white border-yellow-600 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge className={cn("text-xs border backdrop-blur-sm", getStatusColor(article.status))}>
                {article.status}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <Badge
                className="text-xs border backdrop-blur-sm"
                style={{ backgroundColor: article.category.color + '20', color: article.category.color, borderColor: article.category.color }}
              >
                {article.category.name}
              </Badge>
            </div>
          </div>
        )}

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
              {article.title}
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-gray-600 line-clamp-3">
              {article.excerpt}
            </p>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Stats */}
            {showStats && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{article.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{article.comments}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime} min</span>
                </div>
              </div>
            )}

            {/* Author */}
            {showAuthor && (
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <Avatar
                  src={article.author.avatar}
                  name={article.author.name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {article.author.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(article.publishedAt || article.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(article)}
                  className="flex-1"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Read
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(article)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(article)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className={cn("hover:shadow-md transition-shadow border-gray-200", className)}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {article.featuredImage ? (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className="text-xs"
                      style={{ backgroundColor: article.category.color + '20', color: article.category.color, borderColor: article.category.color }}
                    >
                      {article.category.name}
                    </Badge>
                    <Badge className={cn("text-xs", getStatusColor(article.status))}>
                      {article.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {showActions && (
                  <div className="flex gap-1 flex-shrink-0">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(article)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(article)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
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

  // Featured/Default variant
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 border-gray-200", className)}>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Image */}
          {article.featuredImage ? (
            <div className="flex-shrink-0">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-32 h-32 rounded-xl object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {article.featured && (
                    <Badge className="bg-yellow-500 text-white border-yellow-600 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge
                    className="text-xs"
                    style={{ backgroundColor: article.category.color + '20', color: article.category.color, borderColor: article.category.color }}
                  >
                    {article.category.name}
                  </Badge>
                  <Badge className={cn("text-xs", getStatusColor(article.status))}>
                    {article.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {article.title}
                </h3>
              </div>

              {showActions && (
                <div className="flex gap-2 flex-shrink-0">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(article)}
                      className="h-9 w-9 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(article)}
                      className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <p className="text-gray-600 line-clamp-3 mb-4 text-sm">
              {article.excerpt}
            </p>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 5).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{article.tags.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{article.views} views</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="font-medium">{article.likes} likes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-green-500" />
                <span className="font-medium">{article.comments} comments</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{article.readTime} min read</span>
              </div>
            </div>

            {/* Author & Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={article.author.avatar}
                  name={article.author.name}
                  size="sm"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{article.author.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(article.publishedAt || article.createdAt)}
                  </p>
                </div>
              </div>

              {showStats && article.views > 1000 && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Trending</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(article)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Article
                </Button>
              )}
              {onLike && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onLike(article)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
              )}
              {onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(article)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};