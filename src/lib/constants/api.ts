// API Constants

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'https://api.tmclub.id',
  TIMEOUT: 10000, // 10 seconds
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/authenticate/',
    LOGIN_BASIC: '/authentication/basic-login/',
    LOGIN_GOOGLE: '/authenticate/google/',
    LOGIN_GOOGLE_TOKEN: '/google-token',
    LOGOUT: '/authenticate/logout/',
    REGISTER: '/authentication/basic-register/',
    REFRESH: '/authenticate/refresh/',
    VERIFY: '/authenticate/verify/',
    PROFILE: '/account/me/',
  },

  // Users
  USERS: {
    LIST: '/users/',
    DETAIL: (id: string) => `/users/${id}/`,
    PROFILE: '/users/profile/',
    UPDATE: '/users/profile/update/',
  },

  // Events
  EVENTS: {
    LIST: '/event/',
    DETAIL: (id: string) => `/event/${id}/`,
    CREATE: '/event/',
    UPDATE: (id: string) => `/event/${id}/`,
    DELETE: (id: string) => `/event/${id}/`,
    REGISTRATION: (id: string) => `/event/${id}/registration/`,
    REGISTRANTS: (id: string) => `/event/${id}/registrants/`,
    ATTENDANCE: (id: string) => `/event/${id}/attendance/`,
    CERTIFICATES: (id: string) => `/event/${id}/certificates/`,
    IMAGES: (id: string) => `/event/${id}/images/`,
  },

  // Companies
  COMPANIES: {
    LIST: '/company/',
    DETAIL: (id: string) => `/company/${id}/`,
    CREATE: '/company/',
    UPDATE: (id: string) => `/company/${id}/`,
    DELETE: (id: string) => `/company/${id}/`,
    MEMBERS: (id: string) => `/company/${id}/members/`,
    INVITE: (id: string) => `/company/${id}/invite/`,
    EVENTS: (id: string) => `/company/${id}/events/`,
  },

  // Surveys
  SURVEYS: {
    LIST: '/survey/',
    DETAIL: (id: string) => `/survey/${id}/`,
    CREATE: '/survey/',
    UPDATE: (id: string) => `/survey/${id}/`,
    DELETE: (id: string) => `/survey/${id}/`,
    RESPONSES: (id: string) => `/survey/${id}/responses/`,
    ANALYTICS: (id: string) => `/survey/${id}/analytics/`,
  },

  // Blog/Content
  BLOG: {
    LIST: '/blog/',
    DETAIL: (slug: string) => `/blog/${slug}/`,
    CREATE: '/blog/',
    UPDATE: (slug: string) => `/blog/${slug}/`,
    DELETE: (slug: string) => `/blog/${slug}/`,
    CATEGORIES: '/blog/categories/',
    TAGS: '/blog/tags/',
    SEARCH: '/blog/search/',
  },

  // About
  ABOUT: {
    INFO: '/about/about/',
    DETAIL: (id: string | number) => `/about/about/${id}/`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications/',
    MARK_READ: (id: string) => `/notifications/${id}/read/`,
    MARK_ALL_READ: '/notifications/read-all/',
    SETTINGS: '/notifications/settings/',
  },

  // Files
  FILES: {
    UPLOAD: '/files/upload/',
    DELETE: (id: string) => `/files/${id}/`,
  },

  // Transactions
  TRANSACTIONS: {
    LIST: '/transactions/',
    DETAIL: (id: string) => `/transactions/${id}/`,
    INVOICE: (id: string) => `/transactions/${id}/invoice/`,
    PAYMENT: (id: string) => `/transactions/${id}/payment/`,
  },

  // Reference Data
  REFERENCE: {
    QUESTION_TYPES: '/reference/question-types/',
    EVENT_TYPES: '/reference/event-types/',
    PAYMENT_METHODS: '/reference/payment-methods/',
    INDUSTRIES: '/reference/industries/',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  // Auth
  AUTH: ['auth'],
  USER: ['user'],

  // Events
  EVENTS: ['events'],
  EVENT: (id: string) => ['events', id],
  EVENT_REGISTRANTS: (id: string) => ['events', id, 'registrants'],

  // Companies
  COMPANIES: ['companies'],
  COMPANY: (id: string) => ['companies', id],
  COMPANY_MEMBERS: (id: string) => ['companies', id, 'members'],

  // Surveys
  SURVEYS: ['surveys'],
  SURVEY: (id: string) => ['surveys', id],
  SURVEY_RESPONSES: (id: string) => ['surveys', id, 'responses'],

  // Blog
  ARTICLES: ['articles'],
  ARTICLE: (slug: string) => ['articles', slug],

  // Notifications
  NOTIFICATIONS: ['notifications'],

  // About
  ABOUT: ['about'],

  // Transactions
  TRANSACTIONS: ['transactions'],
  TRANSACTION: (id: string) => ['transactions', id],
} as const;

// Cache Times (in milliseconds)
export const CACHE_TIMES = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;