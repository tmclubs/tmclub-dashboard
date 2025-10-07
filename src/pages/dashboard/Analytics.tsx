import React, { useState } from 'react';
import {
  AnalyticsCard,
  MetricsChart,
  ActivityFeed,
  type ActivityItem,
  type ChartDataPoint,
} from '@/components/features/analytics';
import { Button, Select } from '@/components/ui';
import { Download, Filter, Calendar } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  // Mock data for analytics cards
  const analyticsCards = [
    {
      title: 'Total Members',
      value: '2,847',
      change: { value: 12, type: 'increase' as const, period: 'last month' },
      description: 'Active members across all companies',
    },
    {
      title: 'Active Companies',
      value: '48',
      change: { value: 8, type: 'increase' as const, period: 'last month' },
      description: 'Verified partner companies',
    },
    {
      title: 'Events This Month',
      value: '12',
      change: { value: 25, type: 'increase' as const, period: 'last month' },
      description: 'Upcoming and completed events',
    },
    {
      title: 'Survey Responses',
      value: '1,234',
      change: { value: 5, type: 'decrease' as const, period: 'last week' },
      description: 'Total survey responses collected',
    },
    {
      title: 'Blog Views',
      value: '8,921',
      change: { value: 18, type: 'increase' as const, period: 'last month' },
      description: 'Total blog article views',
    },
    {
      title: 'Engagement Rate',
      value: '67%',
      change: { value: 3, type: 'increase' as const, period: 'last month' },
      description: 'Average user engagement score',
    },
  ];

  // Mock data for membership growth chart
  const membershipGrowthData: ChartDataPoint[] = [
    { label: 'Jan', value: 2100 },
    { label: 'Feb', value: 2250 },
    { label: 'Mar', value: 2380 },
    { label: 'Apr', value: 2520 },
    { label: 'May', value: 2650 },
    { label: 'Jun', value: 2780 },
    { label: 'Jul', value: 2847 },
  ];

  // Mock data for industry distribution
  const industryData: ChartDataPoint[] = [
    { label: 'Automotive', value: 28, color: 'bg-orange-500' },
    { label: 'Technology', value: 15, color: 'bg-blue-500' },
    { label: 'Manufacturing', value: 12, color: 'bg-green-500' },
    { label: 'Finance', value: 8, color: 'bg-purple-500' },
    { label: 'Others', value: 7, color: 'bg-gray-500' },
  ];

  // Mock data for event participation
  const eventParticipationData: ChartDataPoint[] = [
    { label: 'Workshop', value: 156 },
    { label: 'Seminar', value: 234 },
    { label: 'Networking', value: 189 },
    { label: 'Training', value: 145 },
    { label: 'Conference', value: 298 },
  ];

  // Mock activity data
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'member',
      title: 'New member registered',
      description: 'John Doe joined PT Toyota Motor Manufacturing Indonesia',
      user: { name: 'System' },
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'event',
      title: 'Event created',
      description: 'Automotive Innovation Workshop 2024 scheduled',
      user: { name: 'Admin' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'company',
      title: 'Company verified',
      description: 'PT Honda Prospect Motor verification completed',
      user: { name: 'Admin' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'survey',
      title: 'Survey completed',
      description: 'Member Satisfaction Survey received 45 responses',
      user: { name: 'System' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'blog',
      title: 'Blog published',
      description: 'Future of Automotive Technology article published',
      user: { name: 'Editor' },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Analytics data exported');
    }, 2000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Analytics data refreshed');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-32"
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' },
            ]}
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            loading={loading}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsCards.map((card, index) => (
          <AnalyticsCard
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            description={card.description}
            loading={loading}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricsChart
          title="Membership Growth"
          description="Monthly membership growth trend"
          data={membershipGrowthData}
          type="line"
          loading={loading}
        />
        <MetricsChart
          title="Industry Distribution"
          description="Companies by industry sector"
          data={industryData}
          type="pie"
          loading={loading}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricsChart
          title="Event Participation"
          description="Number of participants by event type"
          data={eventParticipationData}
          type="bar"
          loading={loading}
        />
        <ActivityFeed
          title="Recent Activity"
          activities={recentActivities}
          loading={loading}
          maxItems={5}
        />
      </div>
    </div>
  );
};