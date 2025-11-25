import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Building2,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  Clipboard,
  BarChart3,
  Bell,
  Clock,
  MapPin,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { Button, Card, CardContent, Badge, LoadingSpinner, EmptyState } from '@/components/ui';
import { useEvents, useCompanies, useBlogPosts, useUnreadNotificationCount } from '@/lib/hooks';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // API hooks for real-time data
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: companies = [], isLoading: companiesLoading } = useCompanies();
  const { data: blogPosts = [], isLoading: blogLoading } = useBlogPosts();
  const { data: unreadNotifications = 0, isLoading: notificationsLoading } = useUnreadNotificationCount();

  // Calculate stats from real data
  const upcomingEvents = events.filter(event => event.date && new Date(event.date) >= new Date());
  const totalParticipants = events.reduce((sum, event) => sum + (event.registrant_count || 0), 0);

  const stats = [
    {
      name: 'Total Events',
      value: events.length.toString(),
      change: `${upcomingEvents.length} upcoming`,
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'bg-gradient-to-br from-orange-400 to-pink-400',
      loading: eventsLoading,
    },
    {
      name: 'Active Members',
      value: totalParticipants.toString(),
      change: 'registered users',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-gradient-to-br from-blue-400 to-indigo-400',
      loading: eventsLoading,
    },
    {
      name: 'Companies',
      value: companies.length.toString(),
      change: 'partner companies',
      changeType: 'positive' as const,
      icon: Building2,
      color: 'bg-gradient-to-br from-green-400 to-emerald-400',
      loading: companiesLoading,
    },
    {
      name: 'Notifications',
      value: unreadNotifications.toString(),
      change: unreadNotifications > 0 ? 'new alerts' : 'all read',
      changeType: unreadNotifications > 0 ? 'warning' as const : 'positive' as const,
      icon: Bell,
      color: unreadNotifications > 0 ? 'bg-gradient-to-br from-red-400 to-pink-400' : 'bg-gradient-to-br from-gray-400 to-gray-500',
      loading: notificationsLoading,
    },
  ];

  const recentEvents = upcomingEvents.slice(0, 3);
  const recentBlogPosts = blogPosts.slice(0, 3);

  const isLoading = eventsLoading || companiesLoading || blogLoading || notificationsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening in your community.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto touch-manipulation"
            aria-label="Export dashboard report"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button 
            size="sm" 
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium touch-manipulation"
            aria-label="Quick add new item"
          >
            <Plus className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Quick Add</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="group hover:shadow-lg transition-all duration-300 border-gray-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`p-2 lg:p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {stat.loading ? '...' : stat.value}
                      </p>
                    </div>
                  </div>
                </div>
                {stat.loading && (
                  <div className="w-4 h-4 lg:w-5 lg:h-5">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-1">
                <p className={`text-xs lg:text-sm ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'warning'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Events - 2 columns on desktop, 1 on mobile */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-gray-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Upcoming Events</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage and monitor your community events</p>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {recentEvents.length === 0 ? (
                <EmptyState
                  type="events"
                  title="No upcoming events"
                  description="Schedule your next community event to get started."
                />
              ) : (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.pk} className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.date ? formatDate(event.date) : 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="line-clamp-1">{event.venue}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto mt-3 sm:mt-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-semibold text-sm",
                            event.is_free ? "text-green-600" : "text-orange-600"
                          )}>
                            {event.is_free ? 'Free' : `Rp ${event.price}`}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {event.registrant_count} registered
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="ml-2">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Blog Posts */}
          <Card className="border-gray-200">
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Recent Articles</h2>
                  <p className="text-sm text-gray-600 mt-1">Latest blog posts and updates</p>
                </div>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>

              {recentBlogPosts.length === 0 ? (
                <EmptyState
                  type="articles"
                  title="No articles yet"
                  description="Share news and updates with your community."
                />
              ) : (
                <div className="space-y-4">
                  {recentBlogPosts.map((post) => (
                    <div
                      key={post.pk}
                      className="group border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 cursor-pointer"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/blog/${post.slug}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Read article ${post.title}`}
                    >
                      <div className="flex gap-3 sm:gap-4 items-start">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                            {post.title.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {post.summary}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>{post.created_at ? formatRelativeTime(post.created_at) : 'Unknown date'}</span>
                            <span>•</span>
                            <span>3 min read</span>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center">
                          <Button variant="outline" size="sm" aria-label="Read article">
                            <Eye className="h-4 w-4 mr-2" />
                            Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
            <CardContent className="p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-orange-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-2 sm:p-3 flex-col hover:bg-white hover:shadow-md transition-all touch-manipulation"
                  aria-label="Create new event"
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 text-orange-600" />
                  <span className="text-xs font-medium text-center">Create Event</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-2 sm:p-3 flex-col hover:bg-white hover:shadow-md transition-all touch-manipulation"
                  aria-label="Add new company"
                >
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 text-blue-600" />
                  <span className="text-xs font-medium text-center">Add Company</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-2 sm:p-3 flex-col hover:bg-white hover:shadow-md transition-all touch-manipulation"
                  aria-label="Invite new member"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 text-green-600" />
                  <span className="text-xs font-medium text-center">Invite Member</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-2 sm:p-3 flex-col hover:bg-white hover:shadow-md transition-all touch-manipulation"
                  aria-label="Create new survey"
                >
                  <Clipboard className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2 text-purple-600" />
                  <span className="text-xs font-medium text-center">Create Survey</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Activity Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Events Created</span>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">{events.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Companies</span>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900">{companies.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Blog Posts</span>
                  <div className="flex items-center gap-1">
                    <Minus className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-900">{blogPosts.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-gray-900">Rp 0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Widget */}
          {unreadNotifications > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-yellow-900 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </h3>
                  <Badge className="bg-yellow-500 text-white border-yellow-600">
                    {unreadNotifications}
                  </Badge>
                </div>
                <p className="text-sm text-yellow-800 mb-3">
                  You have {unreadNotifications} unread notification{unreadNotifications > 1 ? 's' : ''}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View All Notifications
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
