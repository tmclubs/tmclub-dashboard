import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ArrowLeft, Calendar, Clock, Eye, User, Tag } from 'lucide-react';
import { type BlogArticle } from './BlogArticleCard';
import { MarkdownRenderer } from './MarkdownRenderer';

interface BlogDetailProps {
  article: BlogArticle;
  onBack?: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ article, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/blog');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container with responsive padding */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header with Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mb-4 text-sm sm:text-base"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Kembali ke Blog</span>
            <span className="sm:hidden">Kembali</span>
          </Button>
        </div>

        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Featured Image */}
          {article.featuredImage && (
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {/* Category Badge */}
            <div className="mb-3 sm:mb-4">
              <span className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-orange-100 text-orange-800">
                {article.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Article Meta - Responsive Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{article.author.name}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{formatDate(article.publishedAt || article.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{article.readTime} menit</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{article.views} views</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-sm sm:prose-base md:prose-lg lg:prose-xl max-w-none">
              <MarkdownRenderer content={article.content} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {article.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{article.author.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{article.author.role}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Navigation - Responsive */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={handleBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Kembali ke Daftar Blog</span>
            <span className="sm:hidden">Kembali ke Blog</span>
          </Button>
        </div>
      </div>
    </div>
  );
};