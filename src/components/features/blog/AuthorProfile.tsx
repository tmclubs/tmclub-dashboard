import { useState } from 'react';
import {
  Mail,
  Building,
  Calendar,
  Edit,
  Camera,
  Twitter,
  Linkedin,
  Globe,
  CheckCircle,
  Award,
  FileText,
  Eye
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { LazyImage } from '@/components/ui/LazyImage';
import { format } from 'date-fns';
import { getBackendImageUrl } from '@/lib/utils/image';

export interface AuthorProfileData {
  id: number;
  username: string;
  first_name: string;
  last_name?: string;
  email: string;
  bio?: string;
  avatar?: string;
  company?: {
    id: number;
    name: string;
    role: string;
  };
  social_links?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  stats?: {
    articles_count: number;
    total_views: number;
    total_reads: number;
    published_date: string;
  };
  is_verified?: boolean;
  joined_at: string;
}

interface AuthorProfileProps {
  author: AuthorProfileData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<AuthorProfileData>) => void;
  onVerify?: (authorId: number) => void;
  showStats?: boolean;
  compact?: boolean;
}

export function AuthorProfile({
  author,
  isEditing = false,
  onUpdate,
  onVerify,
  showStats = true,
  compact = false
}: AuthorProfileProps) {
  const [editMode, setEditMode] = useState(isEditing);
  const [editData, setEditData] = useState<Partial<AuthorProfileData>>({
    bio: author.bio || '',
    social_links: author.social_links || {},
  });

  const handleSave = () => {
    onUpdate?.(editData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditData({
      bio: author.bio || '',
      social_links: author.social_links || {},
    });
    setEditMode(false);
  };

  const getFullName = () => {
    return `${author.first_name} ${author.last_name || ''}`.trim();
  };

  const getInitials = () => {
    const name = getFullName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="relative">
          {author.avatar ? (
            <LazyImage
              src={getBackendImageUrl(author.avatar)}
              alt={getFullName()}
              className="w-10 h-10 rounded-full object-cover"
              showSkeleton={false}
            />
          ) : (
            <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
              {getInitials()}
            </div>
          )}
          {author.is_verified && (
            <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 bg-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{getFullName()}</h4>
            {author.is_verified && (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {author.company?.name || 'TMC Member'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Author Profile</CardTitle>
          {!editMode && (
            <div className="flex gap-2">
              {onVerify && !author.is_verified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVerify(author.id)}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Verify
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Author Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            {author.avatar ? (
              <LazyImage
                src={getBackendImageUrl(author.avatar)}
                alt={getFullName()}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                {getInitials()}
              </div>
            )}
            {editMode && (
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700">
                <Camera className="w-3 h-3" />
              </button>
            )}
            {author.is_verified && (
              <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 bg-white rounded-full" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-gray-900">{getFullName()}</h3>
              {author.is_verified && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <p className="text-gray-600 mb-2">@{author.username}</p>

            {author.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Building className="w-4 h-4" />
                <span>{author.company.name}</span>
                <span className="text-gray-400">•</span>
                <span>{author.company.role}</span>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {format(new Date(author.joined_at), 'MMM yyyy')}</span>
              </div>
              {author.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{author.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">About</h4>
          {editMode ? (
            <textarea
              value={editData.bio || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-600">
              {author.bio || 'No bio provided yet.'}
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Social Links</h4>
          <div className="flex flex-wrap gap-3">
            {editMode ? (
              <>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={editData.social_links?.website || ''}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, website: e.target.value }
                    }))}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Website"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Twitter className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editData.social_links?.twitter || ''}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, twitter: e.target.value }
                    }))}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Twitter username"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Linkedin className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editData.social_links?.linkedin || ''}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, linkedin: e.target.value }
                    }))}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="LinkedIn URL"
                  />
                </div>
              </>
            ) : (
              <>
                {author.social_links?.website && (
                  <a
                    href={author.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {author.social_links?.twitter && (
                  <a
                    href={`https://twitter.com/${author.social_links.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-600 text-sm"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {author.social_links?.linkedin && (
                  <a
                    href={author.social_links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-700 hover:text-blue-900 text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </>
            )}
          </div>
        </div>

        {/* Author Stats */}
        {showStats && author.stats && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Author Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {author.stats.articles_count}
                </div>
                <div className="text-xs text-gray-500">Articles</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {author.stats.total_views.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Total Views</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(author.stats.total_reads / author.stats.articles_count)}m
                </div>
                <div className="text-xs text-gray-500">Avg Read Time</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-bold text-gray-900">
                  {format(new Date(author.stats.published_date), 'MMM dd, yyyy')}
                </div>
                <div className="text-xs text-gray-500">First Published</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Actions */}
        {editMode && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}