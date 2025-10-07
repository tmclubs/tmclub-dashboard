import React from 'react';
import { ChartContainer } from './ChartContainer';

export interface ActivityItem {
  id: string;
  type: 'event' | 'company' | 'member' | 'survey' | 'blog';
  title: string;
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface ActivityFeedProps {
  title?: string;
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  className?: string;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'event':
      return '📅';
    case 'company':
      return '🏢';
    case 'member':
      return '👤';
    case 'survey':
      return '📊';
    case 'blog':
      return '📝';
    default:
      return '📌';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  title = 'Recent Activity',
  activities,
  loading = false,
  maxItems = 10,
  className = '',
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <ChartContainer
      title={title}
      loading={loading}
      className={className}
    >
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      <span className="text-xs text-gray-500">{activity.user.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayActivities.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <span className="text-gray-400">📭</span>
          </div>
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      )}
    </ChartContainer>
  );
};