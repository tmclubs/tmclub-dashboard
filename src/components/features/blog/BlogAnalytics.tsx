import { useState } from 'react';
import {
  TrendingUp,
  Eye,
  Users,
  Clock,
  Share2,
  Heart,
  BarChart3,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { format, subDays, subYears } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface BlogAnalyticsData {
  pk: number;
  blog_post: number;
  view_count: number;
  unique_visitors: number;
  average_read_time: number;
  bounce_rate: number;
  shares_count: number;
  comments_count: number;
  likes_count: number;
  date: string;
}

interface BlogAnalyticsProps {
  postId: number;
  postTitle: string;
  data: BlogAnalyticsData[];
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function BlogAnalytics({
  postTitle,
  data,
  loading = false,
  onRefresh,
  onExport
}: Omit<BlogAnalyticsProps, 'postId'>) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'views' | 'engagement' | 'traffic'>('views');

  // Filter data based on date range
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '1y':
        startDate = subYears(now, 1);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return data.filter(item => new Date(item.date) >= startDate);
  };

  const filteredData = getFilteredData();

  // Calculate metrics
  const totalViews = filteredData.reduce((sum, item) => sum + item.view_count, 0);
  const totalUniqueVisitors = filteredData.reduce((sum, item) => sum + item.unique_visitors, 0);
  const averageReadTime = filteredData.length > 0
    ? filteredData.reduce((sum, item) => sum + item.average_read_time, 0) / filteredData.length
    : 0;
  const totalShares = filteredData.reduce((sum, item) => sum + item.shares_count, 0);
  const totalComments = filteredData.reduce((sum, item) => sum + item.comments_count, 0);
  const totalLikes = filteredData.reduce((sum, item) => sum + item.likes_count, 0);
  const averageBounceRate = filteredData.length > 0
    ? filteredData.reduce((sum, item) => sum + item.bounce_rate, 0) / filteredData.length
    : 0;

  // Prepare chart data
  const chartData = filteredData.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    views: item.view_count,
    uniqueVisitors: item.unique_visitors,
    readTime: item.average_read_time,
    bounceRate: item.bounce_rate,
    shares: item.shares_count,
    comments: item.comments_count,
    likes: item.likes_count,
  }));

  // Engagement data for pie chart
  const engagementData = [
    { name: 'Shares', value: totalShares, color: '#3B82F6' },
    { name: 'Comments', value: totalComments, color: '#10B981' },
    { name: 'Likes', value: totalLikes, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  const getViewsChartData = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="views"
          stroke="#3B82F6"
          fill="#93BBFC"
          name="Total Views"
        />
        <Area
          type="monotone"
          dataKey="uniqueVisitors"
          stroke="#10B981"
          fill="#86EFAC"
          name="Unique Visitors"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const getEngagementChartData = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="shares"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Shares"
        />
        <Line
          type="monotone"
          dataKey="comments"
          stroke="#10B981"
          strokeWidth={2}
          name="Comments"
        />
        <Line
          type="monotone"
          dataKey="likes"
          stroke="#F59E0B"
          strokeWidth={2}
          name="Likes"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const getTrafficChartData = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="readTime" fill="#8B5CF6" name="Avg Read Time (min)" />
        <Bar dataKey="bounceRate" fill="#EF4444" name="Bounce Rate (%)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const getChart = () => {
    switch (chartType) {
      case 'views':
        return getViewsChartData();
      case 'engagement':
        return getEngagementChartData();
      case 'traffic':
        return getTrafficChartData();
      default:
        return getViewsChartData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Analytics</h2>
          <p className="text-gray-600">{postTitle}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => onExport?.('csv')}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'views' | 'engagement' | 'traffic')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="views">Views & Visitors</option>
                <option value="engagement">Engagement</option>
                <option value="traffic">Traffic Metrics</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +12.5% from last period
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-2xl font-bold text-gray-900">{totalUniqueVisitors.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +8.3% from last period
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Read Time</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averageReadTime)}m</p>
                <p className="text-xs text-yellow-600 mt-1">
                  -2.1% from last period
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Engagement</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(totalShares + totalComments + totalLikes).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +15.7% from last period
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {chartType === 'views' && 'Views & Visitors Trend'}
            {chartType === 'engagement' && 'Engagement Metrics'}
            {chartType === 'traffic' && 'Traffic Analytics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            getChart()
          )}
        </CardContent>
      </Card>

      {/* Engagement Breakdown */}
      {engagementData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Engagement Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Views</span>
                  </div>
                  <span className="font-bold text-blue-600">{totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Unique Visitors</span>
                  </div>
                  <span className="font-bold text-green-600">{totalUniqueVisitors.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">Avg Read Time</span>
                  </div>
                  <span className="font-bold text-yellow-600">{Math.round(averageReadTime)} minutes</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">Bounce Rate</span>
                  </div>
                  <span className="font-bold text-red-600">{Math.round(averageBounceRate)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}