import React, { useState } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Eye,
  BookOpen,
  BarChart3,
  Star,
} from 'lucide-react';
import { Button, Card, CardContent, Badge, Input } from '@/components/ui';
import { type BlogArticle } from './BlogArticleCard';
import { BlogArticleCard } from './BlogArticleCard';

export interface BlogListProps {
  articles: BlogArticle[];
  loading?: boolean;
  onCreate?: () => void;
  onEdit?: (article: BlogArticle) => void;
  onDelete?: (article: BlogArticle) => void;
  onView?: (article: BlogArticle) => void;
  onExport?: () => void;
  onToggleFeatured?: (article: BlogArticle) => void;
  // Controlled filter props (sinkron dengan API)
  searchQuery?: string;
  statusFilter?: 'all' | 'draft' | 'published' | 'archived';
  sortBy?: 'createdAt' | 'publishedAt' | 'views';
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: 'all' | 'draft' | 'published' | 'archived') => void;
  onSortChange?: (value: 'createdAt' | 'publishedAt' | 'views') => void;
}

export const BlogList: React.FC<BlogListProps> = ({
  articles,
  loading = false,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onToggleFeatured,
  searchQuery = '',
  statusFilter: _statusFilter = 'all',
  sortBy = 'createdAt',
  onSearchChange,
  onStatusChange: _onStatusChange,
  onSortChange,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sorting diserahkan ke API melalui parameter `ordering`; tampilkan data apa adanya
  const sortedArticles = articles;

  
  const stats = [
    {
      label: 'Total Articles',
      value: articles.length,
      color: 'text-orange-600',
      icon: BookOpen,
    },
    {
      label: 'Total Views',
      value: articles.reduce((sum, a) => sum + a.views, 0).toLocaleString(),
      color: 'text-blue-600',
      icon: BarChart3,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Improved responsive layout */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Create and manage articles for TMC community</p>
        </div>
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
          <Button 
            leftIcon={<Plus className="w-4 h-4" />} 
            onClick={onCreate} 
            className="w-full sm:w-auto justify-center sm:justify-start"
          >
            <span className="sm:hidden">Create</span>
            <span className="hidden sm:inline">New Article</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Improved responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                    <p className={`text-base sm:text-lg lg:text-xl xl:text-2xl font-bold ${stat.color} truncate`}>{stat.value}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color.replace('text', 'text')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search - Improved responsive layout */}
      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6">
          {/* Search Bar - Full width with better spacing */}
          <div className="mb-4 sm:mb-6">
            <Input
              placeholder="Search articles by title, content, or tags..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>

          {/* Filter Controls - Better responsive layout */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 mb-4 sm:mb-6">
            
            <div className="space-y-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="createdAt">Date Created</option>
                <option value="publishedAt">Date Published</option>
                <option value="views">Most Views</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle and Results Count - Better responsive layout */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4"
              >
                <span className="sm:hidden">Grid</span>
                <span className="hidden sm:inline">Grid View</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4"
              >
                <span className="sm:hidden">List</span>
                <span className="hidden sm:inline">List View</span>
              </Button>
            </div>

            <div className="text-sm text-gray-500 text-center sm:text-right">
              <span className="font-medium">{articles.length}</span> article{articles.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid/List - Improved responsive grid */}
      {sortedArticles.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {searchQuery
                ? 'No articles found'
                : 'No articles yet'
              }
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first article.'
              }
            </p>
            {!searchQuery && onCreate && (
              <Button onClick={onCreate} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
            : 'space-y-4 sm:space-y-6'
        }>
          {sortedArticles.map((article) => (
            <div key={article.id} className="relative group">
              {article.featured && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="default" className="bg-orange-500 text-white text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}

              <BlogArticleCard
                article={article}
                variant={viewMode === 'list' ? 'compact' : 'grid'}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                showActions
              />

              {/* Quick Actions for List View - Improved responsive layout */}
              {viewMode === 'list' && (
                <div className="flex items-center justify-between mt-3 px-2 sm:px-3">
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">{article.views}</span>
                      <span className="hidden sm:inline">views</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{formatDate(article.publishedAt || article.createdAt)}</span>
                      <span className="sm:hidden">{formatDate(article.publishedAt || article.createdAt).split(' ')[0]}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {onToggleFeatured && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleFeatured(article)}
                        className="h-6 w-6 sm:h-8 sm:w-8"
                        title={article.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${article.featured ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Loading State - Improved responsive design */}
      {loading && (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-600"></div>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Loading articles...</p>
        </div>
      )}
    </div>
  );
};