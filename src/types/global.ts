// Global type definitions for TMC Web App

// API Response Types
export interface ApiResponse<T = any> {
  status: 'OK' | 'ERROR';
  code: number;
  message: {
    id: string;
    en: string;
  };
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'member' | 'pic';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event Types
export interface Event {
  id: string;
  nonce?: string; // UUID field dari backend
  title: string;
  description: string;
  date: string; // DateTimeField
  venue: string;
  main_image?: string; // File ID
  main_image_url?: string; // URL dari serializer
  level?: string; // CharField di backend
  is_free: boolean;
  is_registration_close: boolean;
  is_list_attendees: boolean;
  price?: number;
  billing_deadline?: number; // IntegerField
  published_at?: string; // DateTimeField
  created_at: string;
  updated_at: string;
  owned_by?: string; // User ID
  owned_by_email?: string; // Dari DetailEventSerializer
  is_registered?: boolean; // Dari DetailEventSerializer
  references?: string[]; // Array of reference IDs
  medias_id?: string[]; // Array of file IDs
  medias_url?: string[]; // Array of URLs dari serializer
  surveys_id?: string[]; // Array of survey IDs
  registrant_count?: number;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  industry?: string;
  isActive: boolean;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Survey Types
export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  responseCount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'choice' | 'multiple_choice' | 'rating' | 'boolean';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  order: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  answers: Array<{
    questionId: string;
    value: any;
  }>;
  createdAt: string;
}

// Blog Types
export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: User;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
}

// Form Types
export interface EventFormData {
  title: string;
  description: string;
  date: string; // DateTimeField di backend
  venue: string;
  main_image?: string; // File ID untuk backend
  level?: string; // CharField di backend
  is_free: boolean;
  is_registration_close: boolean;
  is_list_attendees: boolean;
  price?: number;
  billing_deadline?: number; // IntegerField di backend
}

export interface CompanyFormData {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  industry?: string;
}

export interface SurveyFormData {
  title: string;
  description?: string;
  questions: Omit<Question, 'id' | 'order'>[];
}

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
}

// UI State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;