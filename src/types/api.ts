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
  nonce?: string; // UUID field dari backend
  title: string;
  date: string; // DateTimeField
  venue: string;
  main_image?: string; // File ID
  main_image_url?: string; // URL dari serializer
  description: string;
  level?: string; // CharField di backend
  is_free: boolean;
  price?: number;
  is_registration_close: boolean;
  is_list_attendees: boolean;
  billing_deadline?: number; // IntegerField (deprecated, tidak digunakan)
  published_at?: string; // DateTimeField
  registrant_count?: number;
  owned_by?: string; // User ID
  owned_by_email?: string; // Dari DetailEventSerializer
  is_registered?: boolean; // Dari DetailEventSerializer
  references?: ReferenceEvent[]; // ManyToMany ke ReferenceEventModel
  medias?: string[]; // ManyToMany ke FileModel (array of file IDs)
  is_done?: boolean; // BooleanField(default=False)
  created_at?: string; // DateTimeField(auto_now_add=True)
  updated_at?: string; // DateTimeField(auto_now=True)
  // Field tambahan dari serializer
  reference_ids?: string[]; // Array of reference IDs
  medias_id?: string[]; // Array of file IDs
  medias_url?: string[]; // Array of URLs dari serializer
  surveys_id?: string[]; // Array of survey IDs
}

export interface EventRegistration {
  // Backend uses token authentication, so most data is auto-populated
  // Empty object is usually sufficient, but we can include optional fields
  company_id?: number; // Optional - if user wants to override default company
}

export interface EventFormData {
  // Required fields from EventSerializer
  title: string;
  date: string; // DateTimeField di backend (timezone-aware)
  venue: string;
  description: string;
  is_free: boolean;
  is_registration_close: boolean;
  is_list_attendees: boolean;

  // Optional fields from EventSerializer
  main_image?: string | null; // FileModel ID atau null (allow_blank=True, allow_null=True)
  price?: number | null; // Required hanya jika is_free=False, otherwise null
  billing_deadline?: number | null; // Deprecated tapi masih ada di serializer (allow_null=True)

  // Fields not in EventSerializer (for future use or separate endpoints)
  level?: string; // CharField(max_length=200, null=True) - not in EventSerializer
  published_at?: string; // DateField(null=True) - not in EventSerializer
  references?: ReferenceEvent[]; // ManyToMany to ReferenceEventModel - not in EventSerializer
  medias?: string[]; // ManyToMany to FileModel - not in EventSerializer
}

export interface ReferenceEvent {
  display_name: string; // CharField(max_length=250)
  url: string; // TextField
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
  main_image?: number | { image: string }; // File ID or object with image URL
  main_image_url?: string; // URL dari serializer
  youtube_id?: string;
  youtube_embeded?: string;
  albums_id?: number[]; // Array of file IDs
  albums_url?: string[]; // Array of URLs dari serializer
  created_at?: string;
  updated_at?: string;
  // Additional properties used in frontend
  owned_by?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  };
  owned_by_username?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
  read_time?: number;
  view_count?: number;
  // Author convenience fields from backend serializer
  author_name?: string;
  author_email?: string;
}

export interface BlogFormData {
  title: string;
  summary: string;
  slug?: string; // Auto-generated di backend
  main_image?: string; // File ID untuk backend
  content: string;
  youtube_id?: string;
  youtube_embeded?: string; // Field yang ada di backend
  albums_id?: number[]; // Sesuai dengan backend serializer
  status?: 'draft' | 'published' | 'archived'; // Status for blog post
  tags?: string[]; // Tags for blog post
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

// About Types
export interface AboutInfo {
  pk: number;
  md: string;
  description?: string;
  organizations?: number[];
  annual_directories?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface UpdateAboutPayload {
  md?: string;
  description?: string;
  organizations?: number[];
  annual_directories?: number[];
}