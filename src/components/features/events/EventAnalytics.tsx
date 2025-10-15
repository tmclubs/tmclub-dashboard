import { useState } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  UserCheck,
  Clock,
  CreditCard
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface EventAnalyticsData {
  date: string;
  registrations: number;
  attendance: number;
  revenue: number;
  completion_rate: number;
  satisfaction_score: number;
}

export interface EventMetrics {
  total_registrations: number;
  total_attendance: number;
  total_revenue: number;
  average_completion_rate: number;
  average_satisfaction: number;
  conversion_rate: number;
  no_show_rate: number;
}

export interface EventAnalyticsProps {
  eventId: number;
  eventTitle: string;
  data: EventAnalyticsData[];
  metrics: EventMetrics;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf') => void;
}

export function EventAnalytics({
  eventTitle,
  data,
  metrics,
  loading = false,
  onRefresh,
  onExport
}: Omit<EventAnalyticsProps, 'eventId'>) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'registration' | 'revenue' | 'engagement'>('registration');

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
      default:
        startDate = subDays(now, 30);
    }

    return data.filter(item => new Date(item.date) >= startDate);
  };

  const filteredData = getFilteredData();

  // Prepare chart data
  const chartData = filteredData.map(item => ({
    date: format(new Date(item.date), 'MMM dd'),
    registrations: item.registrations,
    attendance: item.attendance,
    revenue: item.revenue,
    completionRate: item.completion_rate,
    satisfactionScore: item.satisfaction_score,
  }));

  // Registration status data for pie chart
  const registrationStatusData = [
    {
      name: 'Attended',
      value: metrics.total_attendance,
      color: '#10B981'
    },
    {
      name: 'No Show',
      value: metrics.total_registrations - metrics.total_attendance,
      color: '#EF4444'
    }
  ];

  const getRegistrationChartData = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="registrations"
          stroke="#3B82F6"
          fill="#93BBFC"
          name="Registrations"
        />
        <Area
          type="monotone"
          dataKey="attendance"
          stroke="#10B981"
          fill="#86EFAC"
          name="Attendance"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const getRevenueChartData = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
        <Legend />
        <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" />
      </BarChart>
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
          dataKey="completionRate"
          stroke="#F59E0B"
          strokeWidth={2}
          name="Completion Rate (%)"
        />
        <Line
          type="monotone"
          dataKey="satisfactionScore"
          stroke="#EC4899"
          strokeWidth={2}
          name="Satisfaction Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const getChart = () => {
    switch (chartType) {
      case 'registration':
        return getRegistrationChartData();
      case 'revenue':
        return getRevenueChartData();
      case 'engagement':
        return getEngagementChartData();
      default:
        return getRegistrationChartData();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Analytics</h2>
          <p className="text-gray-600">{eventTitle}</p>
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
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'registration' | 'revenue' | 'engagement')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="registration">Registration & Attendance</option>
                <option value="revenue">Revenue</option>
                <option value="engagement">Engagement Metrics</option>
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
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_registrations.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +18.2% from last event
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_attendance.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  {Math.round(metrics.conversion_rate)}% conversion rate
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.total_revenue)}</p>
                <p className="text-xs text-green-600 mt-1">
                  +25.3% from last event
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.average_satisfaction.toFixed(1)}/5.0</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Based on {metrics.total_attendance} responses
                </p>
              </div>
              <Target className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {chartType === 'registration' && 'Registration & Attendance Trend'}
            {chartType === 'revenue' && 'Revenue Analytics'}
            {chartType === 'engagement' && 'Engagement Metrics'}
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

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Registration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={registrationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {registrationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
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
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Conversion Rate</span>
                </div>
                <span className="font-bold text-blue-600">{Math.round(metrics.conversion_rate)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">No-Show Rate</span>
                </div>
                <span className="font-bold text-red-600">{Math.round(metrics.no_show_rate)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Completion Rate</span>
                </div>
                <span className="font-bold text-green-600">{Math.round(metrics.average_completion_rate)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Avg. Revenue per Attendee</span>
                </div>
                <span className="font-bold text-purple-600">
                  {metrics.total_attendance > 0
                    ? formatCurrency(metrics.total_revenue / metrics.total_attendance)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Strengths</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• High registration numbers indicating strong interest</li>
                <li>• Good satisfaction scores from attendees</li>
                <li>• Solid revenue generation performance</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Areas for Improvement</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Reduce no-show rate with better reminders</li>
                <li>• Optimize pricing strategy for higher conversion</li>
                <li>• Enhance promotion to reach wider audience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}