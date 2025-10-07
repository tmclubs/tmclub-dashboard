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
  content: string;
  main_image?: any;
  youtube_id?: string;
  albums?: any[];
}

export interface BlogFormData {
  title: string;
  summary: string;
  main_image: string;
  content: string;
  youtube_id?: string;
  albums?: number[];
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