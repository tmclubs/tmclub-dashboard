import { useState } from 'react';
import {
  Link,
  Calendar,
  FileText,
  Image as ImageIcon,
  Plus,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Search,
  BarChart3,
  TrendingUp,
  Unlink
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { LazyImage } from '../../ui/LazyImage';
import { format } from 'date-fns';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface LinkedContent {
  id: number;
  type: 'blog' | 'event';
  title: string;
  description?: string;
  image?: string;
  url: string;
  publishedAt: string;
  status: 'published' | 'draft';
  metrics?: {
    views?: number;
    registrations?: number;
    engagement?: number;
  };
}

export interface ContentLink {
  id: number;
  sourceType: 'blog' | 'event';
  sourceId: number;
  targetType: 'blog' | 'event';
  targetId: number;
  linkType: 'promotes' | 'recap' | 'related' | 'featured';
  createdAt: string;
}

export interface SharedMedia {
  id: number;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  usedIn: {
    blogs: number[];
    events: number[];
  };
}

export interface ContentEventIntegrationProps {
  blogPosts: LinkedContent[];
  events: LinkedContent[];
  contentLinks: ContentLink[];
  sharedMedia: SharedMedia[];
  onLinkContent?: (sourceId: number, sourceType: 'blog' | 'event', targetId: number, targetType: 'blog' | 'event', linkType: string) => void;
  onUnlinkContent?: (linkId: number) => void;
  onUploadMedia?: (file: File) => void;
  onDeleteMedia?: (mediaId: number) => void;
  onLinkMedia?: (mediaId: number, contentType: 'blog' | 'event', contentId: number) => void;
}

export function ContentEventIntegration({
  blogPosts,
  events,
  contentLinks,
  sharedMedia,
  onLinkContent,
  onUnlinkContent,
  onUploadMedia: _onUploadMedia,
  onDeleteMedia: _onDeleteMedia,
  onLinkMedia: _onLinkMedia
}: ContentEventIntegrationProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'media' | 'analytics'>('links');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<{ type: 'blog' | 'event'; id: number } | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<{ type: 'blog' | 'event'; id: number } | null>(null);
  const [linkType, setLinkType] = useState<string>('related');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBlogs = blogPosts.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLinkTypeColor = (type: string) => {
    switch (type) {
      case 'promotes':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'recap':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'related':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'featured':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentTypeIcon = (type: string) => {
    return type === 'blog' ? <FileText className="w-4 h-4" /> : <Calendar className="w-4 h-4" />;
  };

  const getLinkedContent = (contentId: number, contentType: 'blog' | 'event') => {
    const links = contentLinks.filter(link =>
      link.sourceId === contentId && link.sourceType === contentType ||
      link.targetId === contentId && link.targetType === contentType
    );

    return links.map(link => {
      const isSource = link.sourceId === contentId;
      const linkedId = isSource ? link.targetId : link.sourceId;
      const linkedType = isSource ? link.targetType : link.sourceType;
      const linkedContent = linkedType === 'blog'
        ? blogPosts.find(b => b.id === linkedId)
        : events.find(e => e.id === linkedId);

      if (!linkedContent) return null;

      return {
        ...linkedContent,
        linkId: link.id,
        linkType: link.linkType,
        relationship: isSource ? 'outgoing' : 'incoming'
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const handleCreateLink = () => {
    if (selectedSource && selectedTarget) {
      onLinkContent?.(
        selectedSource.id,
        selectedSource.type,
        selectedTarget.id,
        selectedTarget.type,
        linkType
      );
      setLinkModalOpen(false);
      setSelectedSource(null);
      setSelectedTarget(null);
      setLinkType('related');
    }
  };

  const calculateCrossMetrics = () => {
    const totalBlogViews = blogPosts.reduce((sum, blog) => sum + (blog.metrics?.views || 0), 0);
    const totalEventRegistrations = events.reduce((sum, event) => sum + (event.metrics?.registrations || 0), 0);
    const totalLinks = contentLinks.length;
    const sharedMediaCount = sharedMedia.length;

    return {
      totalBlogViews,
      totalEventRegistrations,
      totalLinks,
      sharedMediaCount,
      crossEngagementRate: totalLinks > 0 ? Math.round((totalBlogViews + totalEventRegistrations) / totalLinks) : 0
    };
  };

  const metrics = calculateCrossMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content-Event Integration</h2>
          <p className="text-gray-600">Manage cross-promotion between blog content and events</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setLinkModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Link
          </Button>
        </div>
      </div>

      {/* Cross-Platform Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Cross-Platform Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{metrics.totalLinks}</div>
              <div className="text-sm text-gray-600">Content Links</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{metrics.totalBlogViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Blog Views</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{metrics.totalEventRegistrations.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Event Registrations</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{metrics.sharedMediaCount}</div>
              <div className="text-sm text-gray-600">Shared Media</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'links'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Content Links ({contentLinks.length})
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'media'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Shared Media ({sharedMedia.length})
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </div>
          </button>
        </nav>
      </div>

      {/* Content Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Types</option>
              <option value="blog">Blog Posts</option>
              <option value="event">Events</option>
            </select>
          </div>

          {/* Content Links List */}
          <div className="space-y-4">
            {/* Blog Posts with Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Blog Posts</h3>
              <div className="space-y-3">
                {filteredBlogs.map((blog) => {
                  const linkedContent = getLinkedContent(blog.id, 'blog');
                  return (
                    <Card key={blog.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getContentTypeIcon('blog')}
                              <h4 className="font-medium text-gray-900">{blog.title}</h4>
                              <Badge variant="secondary">{blog.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{blog.description}</p>
                            <div className="text-xs text-gray-500 mb-3">
                              Published {format(new Date(blog.publishedAt), 'MMM dd, yyyy')}
                            </div>

                            {linkedContent.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">Linked Content:</div>
                                {linkedContent.map((content, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                      {getContentTypeIcon(content.type)}
                                      <span className="text-sm">{content.title}</span>
                                      <Badge className={`text-xs ${getLinkTypeColor(content.linkType)}`}>
                                        {content.linkType}
                                      </Badge>
                                      {content.relationship === 'incoming' && (
                                        <span className="text-xs text-gray-500">(links to this)</span>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onUnlinkContent?.(content.linkId)}
                                      >
                                        <Unlink className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Events with Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Events</h3>
              <div className="space-y-3">
                {filteredEvents.map((event) => {
                  const linkedContent = getLinkedContent(event.id, 'event');
                  return (
                    <Card key={event.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getContentTypeIcon('event')}
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              <Badge variant="secondary">{event.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            <div className="text-xs text-gray-500 mb-3">
                              {format(new Date(event.publishedAt), 'MMM dd, yyyy')}
                            </div>

                            {linkedContent.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700">Linked Content:</div>
                                {linkedContent.map((content, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex items-center gap-2">
                                      {getContentTypeIcon(content.type)}
                                      <span className="text-sm">{content.title}</span>
                                      <Badge className={`text-xs ${getLinkTypeColor(content.linkType)}`}>
                                        {content.linkType}
                                      </Badge>
                                      {content.relationship === 'incoming' && (
                                        <span className="text-xs text-gray-500">(links to this)</span>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onUnlinkContent?.(content.linkId)}
                                      >
                                        <Unlink className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Media Tab */}
      {activeTab === 'media' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shared Media Library</CardTitle>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Upload Media
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sharedMedia.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No shared media yet</p>
                <p className="text-sm text-gray-500 mt-1">Upload media to use across both blog posts and events</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedMedia.map((media) => (
                  <div key={media.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                      {media.type === 'image' ? (
                        <LazyImage src={getBackendImageUrl(media.url)} alt={media.filename} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className="text-xs text-gray-500 mt-1">{media.type}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{media.filename}</h4>
                      <div className="text-xs text-gray-500">
                        {(media.size / 1024 / 1024).toFixed(2)} MB • {media.type}
                      </div>
                      <div className="text-xs text-gray-500">
                        Used in {media.usedIn.blogs.length} blogs, {media.usedIn.events.length} events
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Cross-platform analytics coming soon</p>
              <p className="text-sm text-gray-500 mt-1">Track how blog content drives event registrations and vice versa</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Creation Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Content Link</h3>

            <div className="space-y-4">
              {/* Source Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Content</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Blog Posts</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {blogPosts.map((blog) => (
                        <label key={blog.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="source"
                            checked={selectedSource?.id === blog.id && selectedSource?.type === 'blog'}
                            onChange={() => setSelectedSource({ type: 'blog', id: blog.id })}
                          />
                          <span className="text-sm">{blog.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Events</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {events.map((event) => (
                        <label key={event.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="source"
                            checked={selectedSource?.id === event.id && selectedSource?.type === 'event'}
                            onChange={() => setSelectedSource({ type: 'event', id: event.id })}
                          />
                          <span className="text-sm">{event.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Content</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Blog Posts</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {blogPosts.map((blog) => (
                        <label key={blog.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="target"
                            checked={selectedTarget?.id === blog.id && selectedTarget?.type === 'blog'}
                            onChange={() => setSelectedTarget({ type: 'blog', id: blog.id })}
                            disabled={selectedSource?.id === blog.id}
                          />
                          <span className="text-sm">{blog.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Events</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {events.map((event) => (
                        <label key={event.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="target"
                            checked={selectedTarget?.id === event.id && selectedTarget?.type === 'event'}
                            onChange={() => setSelectedTarget({ type: 'event', id: event.id })}
                            disabled={selectedSource?.id === event.id}
                          />
                          <span className="text-sm">{event.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="related">Related Content</option>
                  <option value="promotes">Promotes</option>
                  <option value="recap">Event Recap</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLinkModalOpen(false);
                    setSelectedSource(null);
                    setSelectedTarget(null);
                    setLinkType('related');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLink}
                  disabled={!selectedSource || !selectedTarget}
                >
                  Create Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}