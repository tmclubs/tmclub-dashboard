import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from '@/components/ui';
import { LazyImage } from '@/components/common/LazyImage';
import { ArrowLeft, Calendar, Clock, Eye, User, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { type BlogArticle } from './BlogArticleCard';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getBackendImageUrl } from '@/lib/utils/image';

interface BlogDetailProps {
  article: BlogArticle;
  onBack?: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ article, onBack }) => {
  const navigate = useNavigate();
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);
  const [activeImageIndex, setActiveImageIndex] = React.useState<number | null>(null);
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);
  const [pinchStartDistance, setPinchStartDistance] = React.useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = React.useState<number>(1);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/blog');
    }
  };

  const openImageModal = (index: number) => {
    setActiveImageIndex(index);
    setIsImageModalOpen(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setActiveImageIndex(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (!article.albums || activeImageIndex === null) return;
    const next = (activeImageIndex + 1) % article.albums.length;
    setActiveImageIndex(next);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const prevImage = () => {
    if (!article.albums || activeImageIndex === null) return;
    const prev = (activeImageIndex - 1 + article.albums.length) % article.albums.length;
    setActiveImageIndex(prev);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  React.useEffect(() => {
    if (!isImageModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isImageModalOpen, nextImage, prevImage]);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => clamp(s + delta, 1, 5));
  };
  const onMouseDown: React.MouseEventHandler<HTMLImageElement> = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseMove: React.MouseEventHandler<HTMLImageElement> = (e) => {
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp: React.MouseEventHandler<HTMLImageElement> = () => {
    setDragging(false);
    setDragStart(null);
  };
  const onDoubleClick: React.MouseEventHandler<HTMLImageElement> = () => {
    setScale((s) => (s > 1 ? 1 : 2));
    setOffset({ x: 0, y: 0 });
  };
  const getDistance = (t1: React.Touch | Touch, t2: React.Touch | Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const touches = e.nativeEvent.touches;
    if (touches.length === 2) {
      const d = getDistance(touches[0], touches[1]);
      setPinchStartDistance(d);
      setPinchStartScale(scale);
    } else if (touches.length === 1) {
      const t = touches[0];
      setDragging(true);
      setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y });
    }
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const touches = e.nativeEvent.touches;
    if (touches.length === 2 && pinchStartDistance) {
      const d = getDistance(touches[0], touches[1]);
      const ratio = d / pinchStartDistance;
      setScale(clamp(pinchStartScale * ratio, 1, 5));
    } else if (touches.length === 1 && dragging && dragStart) {
      const t = touches[0];
      setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
    }
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    setDragging(false);
    setDragStart(null);
    setPinchStartDistance(null);
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
            <div className={`w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg ${article.youtubeEmbedUrl ? 'mb-4 sm:mb-6 md:mb-8' : ''}`}>
              <LazyImage
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          {article.youtubeEmbedUrl && (
            <div className={`w-full aspect-video bg-black rounded-lg overflow-hidden ${article.featuredImage ? 'mt-4 sm:mt-6 md:mt-8' : ''}`}>
              <iframe
                src={article.youtubeEmbedUrl}
                title={article.title}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}

          {/* Article Header */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            {/* Category removed */}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-4 sm:mb-6 leading-relaxed text-justify">
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

            {/* Albums Gallery */}
            {article.albums && article.albums.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Galeri</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {article.albums.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onClick={() => openImageModal(idx)}
                      aria-label={`Buka gambar album ${idx + 1}`}
                    >
                      <LazyImage
                        src={url}
                        alt={`Album ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                {article.author.avatar ? (
                  <LazyImage
                    src={getBackendImageUrl(article.author.avatar)}
                    alt={article.author.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
                    fallback={
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium flex-shrink-0"
                      >
                        {article.author.name
                          .split(' ')
                          .map((w) => w.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join('')}
                      </div>
                    }
                  />
                ) : (
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium flex-shrink-0"
                  >
                    {article.author.name
                      .split(' ')
                      .map((w) => w.charAt(0).toUpperCase())
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{article.author.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{article.author.role}</p>
                </div>
              </div>
            </div>

            <Modal
              open={isImageModalOpen}
              onClose={closeImageModal}
              size="xl"
              title="Preview Gambar"
            >
              {activeImageIndex !== null && article.albums && (
                <div
                  className="relative"
                  onWheel={onWheel}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  <div className="flex items-center justify-center overflow-hidden max-h-[70vh]">
                    <LazyImage
                      src={getBackendImageUrl(article.albums[activeImageIndex])}
                      alt={`Preview ${activeImageIndex + 1}`}
                      className={`w-auto rounded-lg select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: 'center center' }}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                      onMouseLeave={onMouseUp}
                      onDoubleClick={onDoubleClick}
                      draggable={false}
                    />
                  </div>
                  {article.albums.length > 1 && (
                    <div className="absolute inset-y-1/2 left-0 right-0 flex items-center justify-between px-2">
                      <Button variant="ghost" size="icon" onClick={prevImage} aria-label="Sebelumnya">
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={nextImage} aria-label="Berikutnya">
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Modal>
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
