import React, { useState } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Share2
} from 'lucide-react';
import { Button, Card, CardContent, Badge, Input } from '@/components/ui';
import { type Survey, type SurveyQuestion } from './SurveyBuilder';

export interface SurveyListProps {
  surveys: (Survey & { responses?: number })[];
  loading?: boolean;
  onCreate?: () => void;
  onEdit?: (survey: Survey & { responses?: number }) => void;
  onDelete?: (survey: Survey & { responses?: number }) => void;
  onPreview?: (survey: Survey & { responses?: number }) => void;
  onViewResults?: (survey: Survey & { responses?: number }) => void;
  onShare?: (survey: Survey & { responses?: number }) => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  surveys,
  loading = false,
  onCreate,
  onEdit,
  onDelete,
  onPreview,
  onViewResults,
  onShare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurveys = surveys.filter(survey =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'closed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const stats = [
    {
      label: 'Total Surveys',
      value: surveys.length,
      color: 'text-orange-600',
      icon: MessageSquare,
    },
    {
      label: 'Published',
      value: surveys.filter(s => s.status === 'published').length,
      color: 'text-green-600',
      icon: Share2,
    },
    {
      label: 'Total Responses',
      value: surveys.reduce((sum, s) => sum + s.responses, 0).toLocaleString(),
      color: 'text-blue-600',
      icon: Users,
    },
    {
      label: 'Avg. Responses',
      value: surveys.length > 0
        ? Math.round(surveys.reduce((sum, s) => sum + s.responses, 0) / surveys.length)
        : 0,
      color: 'text-purple-600',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
          <p className="text-gray-600 mt-1">Create and manage surveys for event feedback</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={onCreate}>
          Create Survey
        </Button>
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

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search surveys..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Surveys Grid */}
      {filteredSurveys.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No surveys found' : 'No surveys yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'Get started by creating your first survey.'
              }
            </p>
            {!searchQuery && onCreate && (
              <Button onClick={onCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Survey
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {survey.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {survey.description}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(survey.status)} size="sm">
                    {survey.status}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Questions
                    </span>
                    <span className="font-medium">{survey.questions?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Responses
                    </span>
                    <span className="font-medium">{survey.responses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created
                    </span>
                    <span className="font-medium">
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {survey.publishedAt && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Published
                      </span>
                      <span className="font-medium">
                        {new Date(survey.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {onPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreview(survey)}
                      leftIcon={<Eye className="w-3 h-3" />}
                    >
                      Preview
                    </Button>
                  )}
                  {survey.status === 'published' && onViewResults && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewResults(survey)}
                      leftIcon={<BarChart3 className="w-3 h-3" />}
                    >
                      Results
                    </Button>
                  )}
                  {survey.status === 'published' && onShare && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShare(survey)}
                      leftIcon={<Share2 className="w-3 h-3" />}
                    >
                      Share
                    </Button>
                  )}
                  <div className="flex-1 flex justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(survey)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(survey)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};