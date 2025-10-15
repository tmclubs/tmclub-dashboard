import { apiClient } from './client';

// Analytics types
export interface DashboardMetrics {
  total_users: number;
  total_companies: number;
  total_events: number;
  total_registrations: number;
  active_events: number;
  upcoming_events: number;
  completed_events: number;
  total_blog_posts: number;
  total_surveys: number;
  recent_activity: Array<{
    id: number;
    type: string;
    description: string;
    created_at: string;
    user: string;
  }>;
}

export interface EventAnalytics {
  total_events: number;
  active_events: number;
  completed_events: number;
  upcoming_events: number;
  total_registrations: number;
  total_attendees: number;
  average_attendance_rate: number;
  popular_events: Array<{
    id: number;
    title: string;
    registration_count: number;
    attendance_count: number;
    date: string;
  }>;
  monthly_events: Array<{
    month: string;
    events_count: number;
    registrations_count: number;
  }>;
  event_types: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export interface CompanyAnalytics {
  total_companies: number;
  active_companies: number;
  total_members: number;
  companies_by_city: Array<{
    city: string;
    count: number;
    percentage: number;
  }>;
  top_companies_by_events: Array<{
    id: number;
    display_name: string;
    events_count: number;
    members_count: number;
  }>;
  company_growth: Array<{
    month: string;
    new_companies: number;
    total_companies: number;
  }>;
  member_distribution: Array<{
    company_size: string;
    count: number;
    percentage: number;
  }>;
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  user_growth: Array<{
    month: string;
    new_users: number;
    total_users: number;
  }>;
  users_by_role: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  user_activity: Array<{
    date: string;
    active_users: number;
    registrations: number;
  }>;
  user_retention: {
    day_1: number;
    day_7: number;
    day_30: number;
  };
}

export interface SurveyAnalytics {
  total_surveys: number;
  active_surveys: number;
  completed_surveys: number;
  total_responses: number;
  average_completion_rate: number;
  survey_types: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  response_trends: Array<{
    month: string;
    surveys_created: number;
    responses_completed: number;
  }>;
  popular_surveys: Array<{
    id: number;
    title: string;
    response_count: number;
    completion_rate: number;
    created_at: string;
  }>;
}

export interface BlogAnalytics {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  popular_posts: Array<{
    id: number;
    title: string;
    views: number;
    likes: number;
    comments: number;
    published_at: string;
  }>;
  monthly_posts: Array<{
    month: string;
    posts_count: number;
    views: number;
  }>;
  categories: Array<{
    category: string;
    count: number;
    views: number;
  }>;
}

export interface RegistrationAnalytics {
  total_registrations: number;
  pending_registrations: number;
  confirmed_registrations: number;
  cancelled_registrations: number;
  registration_trends: Array<{
    month: string;
    registrations: number;
    events: number;
  }>;
  registration_sources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  conversion_rates: {
    registration_to_attendance: number;
    registration_to_payment: number;
  };
}

export interface FinancialAnalytics {
  total_revenue: number;
  revenue_this_month: number;
  revenue_trends: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  revenue_by_event_type: Array<{
    type: string;
    revenue: number;
    percentage: number;
  }>;
  payment_methods: Array<{
    method: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  top_revenue_events: Array<{
    id: number;
    title: string;
    revenue: number;
    registrations: number;
    date: string;
  }>;
}

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  company_id?: number;
  event_type?: string;
  user_role?: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filters?: AnalyticsFilters;
  metrics?: string[];
}

// Analytics API endpoints
export const analyticsApi = {
  // Dashboard metrics
  async getDashboardMetrics(filters?: AnalyticsFilters): Promise<DashboardMetrics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/dashboard/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Event analytics
  async getEventAnalytics(filters?: AnalyticsFilters): Promise<EventAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/events/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Company analytics
  async getCompanyAnalytics(filters?: AnalyticsFilters): Promise<CompanyAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/companies/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // User analytics
  async getUserAnalytics(filters?: AnalyticsFilters): Promise<UserAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/users/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Survey analytics
  async getSurveyAnalytics(filters?: AnalyticsFilters): Promise<SurveyAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/surveys/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Blog analytics
  async getBlogAnalytics(filters?: AnalyticsFilters): Promise<BlogAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/blog/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Registration analytics
  async getRegistrationAnalytics(filters?: AnalyticsFilters): Promise<RegistrationAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/registrations/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Financial analytics
  async getFinancialAnalytics(filters?: AnalyticsFilters): Promise<FinancialAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    const endpoint = `/analytics/financial/${params.toString() ? `?${params.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Export analytics data
  async exportAnalytics(options: ExportOptions): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics/export/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Failed to export analytics data');
    }

    return response.blob();
  },

  // Get specific event analytics
  async getEventDetails(eventId: number): Promise<any> {
    return apiClient.get(`/analytics/events/${eventId}/`);
  },

  // Get specific company analytics
  async getCompanyDetails(companyId: number): Promise<any> {
    return apiClient.get(`/analytics/companies/${companyId}/`);
  },

  // Get real-time metrics (for dashboard live updates)
  async getRealTimeMetrics(): Promise<{
    active_users: number;
    current_events: number;
    today_registrations: number;
    recent_activities: any[];
  }> {
    return apiClient.get('/analytics/realtime/');
  },

  // Get system health metrics
  async getSystemHealth(): Promise<{
    server_status: string;
    response_time: number;
    database_status: string;
    active_connections: number;
    error_rate: number;
  }> {
    return apiClient.get('/analytics/health/');
  },
};