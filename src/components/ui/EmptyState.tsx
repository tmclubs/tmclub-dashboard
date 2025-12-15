import React from 'react';
import { Search, Plus, FileText, Users, Calendar, Building, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  type?: 'search' | 'data' | 'error' | 'create' | 'events' | 'companies' | 'users' | 'surveys' | 'articles';
  title?: string;
  description?: string;
  action?: {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'data',
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="h-12 w-12" />,
          title: title || 'No results found',
          description: description || 'Try adjusting your search terms or filters',
        };

      case 'create':
        return {
          icon: <Plus className="h-12 w-12" />,
          title: title || 'Get started',
          description: description || 'Create your first item to get started',
        };

      case 'events':
        return {
          icon: <Calendar className="h-12 w-12" />,
          title: title || 'No events yet',
          description: description || 'Create your first event to start organizing activities',
        };

      case 'companies':
        return {
          icon: <Building className="h-12 w-12" />,
          title: title || 'No members yet',
          description: description || 'Invite members to join your community',
        };

      case 'users':
        return {
          icon: <Users className="h-12 w-12" />,
          title: title || 'No users yet',
          description: description || 'Users will appear here once they join',
        };

      case 'surveys':
        return {
          icon: <FileText className="h-12 w-12" />,
          title: title || 'No surveys yet',
          description: description || 'Create surveys to gather feedback from your community',
        };

      case 'articles':
        return {
          icon: <FileText className="h-12 w-12" />,
          title: title || 'No articles yet',
          description: description || 'Start writing articles to share news and updates',
        };

      case 'error':
        return {
          icon: <AlertCircle className="h-12 w-12" />,
          title: title || 'Something went wrong',
          description: description || 'An error occurred while loading data',
        };

      default:
        return {
          icon: <Search className="h-12 w-12" />,
          title: title || 'No data available',
          description: description || 'There\'s nothing to show here yet',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {/* Icon */}
      <div className="text-gray-400 mb-4">
        {content.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {content.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6 max-w-md">
        {content.description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button onClick={action.onClick} className="flex items-center gap-2">
            {action.icon}
            {action.text}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.text}
          </Button>
        )}
      </div>
    </div>
  );
};

// Specific Empty State Components for common use cases

export const NoDataFound: React.FC<{
  title?: string;
  description?: string;
  onRefresh?: () => void;
  loading?: boolean;
}> = ({ title, description, onRefresh, loading }) => (
  <EmptyState
    type="data"
    title={title}
    description={description}
    action={onRefresh ? {
      text: 'Refresh',
      onClick: onRefresh,
      icon: <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />,
    } : undefined}
  />
);

export const NoSearchResults: React.FC<{
  query?: string;
  onClear?: () => void;
}> = ({ query, onClear }) => (
  <EmptyState
    type="search"
    title={`No results for "${query || '...'}"`}
    description="Try different keywords or clear filters"
    action={onClear ? {
      text: 'Clear filters',
      onClick: onClear,
    } : undefined}
  />
);

export const NoEvents: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    type="events"
    action={onCreate ? {
      text: 'Create Event',
      onClick: onCreate,
      icon: <Plus className="h-4 w-4" />,
    } : undefined}
  />
);

export const NoCompanies: React.FC<{ onInvite?: () => void }> = ({ onInvite }) => (
  <EmptyState
    type="companies"
    action={onInvite ? {
      text: 'Invite Company',
      onClick: onInvite,
      icon: <Plus className="h-4 w-4" />,
    } : undefined}
  />
);

export const NoUsers: React.FC<{ onInvite?: () => void }> = ({ onInvite }) => (
  <EmptyState
    type="users"
    action={onInvite ? {
      text: 'Invite User',
      onClick: onInvite,
      icon: <Plus className="h-4 w-4" />,
    } : undefined}
  />
);

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  loading?: boolean;
}> = ({ title, description, onRetry, loading }) => (
  <EmptyState
    type="error"
    title={title}
    description={description}
    action={onRetry ? {
      text: 'Try Again',
      onClick: onRetry,
      icon: <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />,
    } : undefined}
  />
);