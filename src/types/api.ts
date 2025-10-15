// API Response Types
export interface TMCResponse<T = any> {
  status: 'success' | 'error';
  code: string;
  message: {
    en: string;
    id: string;
  };
  data: T;
  meta?: any;
}

// Auth Types
export interface LoginData {
  uid?: string;
  email: string;
  name?: string;
  password?: string;
  username?: string;
  first_name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name?: string;
    phone_number?: string;
    role: string;
  };
}

export interface GoogleAuthResponse {
  uid: string;
  token: string;
  email: string;
  name: string;
  role: string;
}

// Google OAuth2 Types
export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  verified_email: boolean;
}

export interface GoogleTokenInfo {
  iss: string;
  sub: string;
  azp: string;
  aud: string;
  exp: number;
  iat: number;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
}

export interface GoogleOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  accessType: string;
  prompt: string;
}

// User Profile Types
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  role: string;
  company?: {
    id: number;
    name: string;
    is_pic: boolean;
  };
}

// Event Types
export interface Event {
  pk: number;
  title: string;
  date: string;
  venue: string;
  main_image_url?: string;
  description: string;
  is_free: boolean;
  price?: number;
  is_registration_close: boolean;
  is_list_attendees: boolean;
  billing_deadline?: string;
  main_image?: any;
  registrant_count?: number;
}

export interface EventRegistration {
  email: string;
  company_id?: number;
}

export interface EventFormData {
  title: string;
  date: string;
  venue: string;
  main_image: string;
  description: string;
  is_free: boolean;
  is_registration_close: boolean;
  is_list_attendees: boolean;
  price?: number;
  billing_deadline?: string;
}

// Company Types
export interface Company {
  pk: number;
  display_name: string;
  address: string;
  main_image?: any;
  description: string;
  contact: string;
  email: string;
  city: string;
}

export interface CompanyFormData {
  display_name: string;
  address: string;
  main_image: string;
  description: string;
  contact: string;
  email: string;
  city: string;
}

export interface CompanyInviteData {
  email: string;
  role?: 'member' | 'pic';
}

// Survey Types
export interface Question {
  id: number;
  question_text: string;
  question_type: string;
  is_required: boolean;
  options?: Array<{
    display_name: string;
  }>;
}

export interface Survey {
  pk: number;
  title: string;
  description: string;
  questions: Question[];
}

export interface SurveyFormData {
  title: string;
  description: string;
  questions: Array<{
    question_text: string;
    question_type: string;
    is_required: boolean;
    options?: Array<{
      display_name: string;
    }>;
  }>;
}

export interface SurveyResponse {
  question_id: number;
  answer: string;
}

export interface SurveySubmissionData {
  responses: SurveyResponse[];
}

// Blog Types
export interface BlogPost {
  pk: number;
  title: string;
  summary: string;
  slug: string;
  content: string;
  main_image?: any;
  youtube_id?: string;
  youtube_embeded?: string;
  albums?: any[];
  owned_by?: {
    id: number;
    username: string;
    first_name: string;
    last_name?: string;
    email: string;
  };
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'draft' | 'published' | 'archived';
  view_count?: number;
  read_time?: number;
  tags?: string[];
  category?: string;
}

export interface BlogFormData {
  title: string;
  summary: string;
  slug: string;
  main_image: string;
  content: string;
  youtube_id?: string;
  albums?: number[];
  published_at?: string;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  category?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  og_title?: string;
  og_description?: string;
  canonical_url?: string;
}

// SEO Types
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonical_url?: string;
  robots?: 'index,follow' | 'noindex,nofollow';
}

export interface BlogAnalytics {
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

// Notification Types
export interface Notification {
  pk: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

// Transaction Types
export interface Invoice {
  pk: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
}

export interface PaymentMethodData {
  payment_method: string;
  bank_code?: string;
}

// File Upload Types
export interface FileUploadResponse {
  pk: number;
  image: string;
  display_name: string;
  caption?: string;
}

// File Management Types
export interface FileData {
  file_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  created_at: string;
}

// Reference Data Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name?: string;
}

export interface QuestionType {
  value: string;
  label: string;
}

export interface PaymentMethod {
  value: string;
  label: string;
}

export interface InvoiceStatus {
  value: string;
  label: string;
}

// Error Types
export interface APIError {
  status: string;
  code: string;
  message: {
    en: string;
    id: string;
  };
}