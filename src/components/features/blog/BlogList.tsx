import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
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
  categories: Array<{ id: string; name: string; color: string }>;
  loading?: boolean;
  onCreate?: () => void;
  onEdit?: (article: BlogArticle) => void;
  onDelete?: (article: BlogArticle) => void;
  onView?: (article: BlogArticle) => void;
  onExport?: () => void;
  onToggleFeatured?: (article: BlogArticle) => void;
}

export const BlogList: React.FC<BlogListProps> = ({
  articles,
  categories,
  loading = false,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
  onToggleFeatured,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'publishedAt' | 'views' | 'likes'>('createdAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category.id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'views':
        return b.views - a.views;
      case 'likes':
        return b.likes - a.likes;
      case 'publishedAt':
        if (!a.publishedAt) return 1;
        if (!b.publishedAt) return -1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'createdAt':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  
  const stats = [
    {
      label: 'Total Articles',
      value: articles.length,
      color: 'text-orange-600',
      icon: BookOpen,
    },
    {
      label: 'Published',
      value: articles.filter(a => a.status === 'published').length,
      color: 'text-green-600',
      icon: Eye,
    },
    {
      label: 'Draft',
      value: articles.filter(a => a.status === 'draft').length,
      color: 'text-yellow-600',
      icon: Filter,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Create and manage articles for TMC community</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExport} leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={onCreate}>
            New Article
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${stat.color.replace('text', 'text')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search articles..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="createdAt">Date Created</option>
              <option value="publishedAt">Date Published</option>
              <option value="views">Most Views</option>
              <option value="likes">Most Likes</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles Grid/List */}
      {sortedArticles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No articles found'
                : 'No articles yet'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first article.'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && onCreate && (
              <Button onClick={onCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {sortedArticles.map((article) => (
            <div key={article.id} className="relative">
              {article.featured && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="default" className="bg-orange-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}

              <BlogArticleCard
                article={article}
                variant={viewMode === 'list' ? 'compact' : 'default'}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                showActions
              />

              {/* Quick Actions */}
              {viewMode === 'list' && (
                <div className="flex items-center justify-between mt-2 px-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {onToggleFeatured && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleFeatured(article)}
                        className="h-6 w-6"
                        title={article.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <Star className={`w-3 h-3 ${article.featured ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-gray-600 mt-2">Loading articles...</p>
        </div>
      )}
    </div>
  );
};