# Dokumentasi Rancangan Frontend TMC Web App

## Overview Project

Frontend TMC Web App adalah aplikasi web modern yang dibangun menggunakan **React 18 + Vite** untuk mengkonsumsi TMC API. Aplikasi ini menampilkan interface yang clean, modern, dan minimalist dengan tema warna **orange** sebagai primary color, ditujukan untuk mengelola komunitas Toyota Manufacturers Club.

## Tech Stack

### Core Framework
- **React 18** - Library UI utama
- **Vite** - Build tool yang cepat dan modern
- **TypeScript** - Type safety dan developer experience

### State Management & Data Fetching
- **TanStack Query v5** - Server state management dan caching
- **React Router v6** - Type-safe routing
- **Zustand** - Client state management (untuk UI state)

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **Headless UI** - Accessible UI components
- **Framer Motion** - Animations dan transitions
- **Lucide React** - Icon library

### Form & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **TanStack Form** - Advanced form handling

### Additional Libraries
- **date-fns** - Date manipulation
- **react-hot-toast** - Toast notifications
- **recharts** - Data visualization
- **react-google-auth** - Google OAuth authentication
- **qr-scanner** - QR code scanning

## Design System

### Color Palette

```css
:root {
  /* Primary Orange Theme */
  --orange-50: #fff7ed;
  --orange-100: #ffedd5;
  --orange-200: #fed7aa;
  --orange-300: #fdba74;
  --orange-400: #fb923c;
  --orange-500: #f97316; /* Primary */
  --orange-600: #ea580c;
  --orange-700: #c2410c;
  --orange-800: #9a3412;
  --orange-900: #7c2d12;
  --orange-950: #431407;

  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  --gray-950: #030712;

  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Typography Scale

```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Spacing & Layout

```css
/* Spacing Scale */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */

/* Border Radius */
--radius-sm: 0.125rem; /* 2px */
--radius: 0.25rem;     /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem;   /* 8px */
--radius-xl: 0.75rem;  /* 12px */
--radius-2xl: 1rem;    /* 16px */
--radius-full: 9999px;
```

## Project Structure

```
tmc-frontend/
├── src/                          # Source code directory
│   ├── components/              # Reusable components
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── index.ts
│   │   ├── forms/              # Form components
│   │   │   ├── EventForm.tsx
│   │   │   ├── CompanyForm.tsx
│   │   │   ├── SurveyBuilder.tsx
│   │   │   └── index.ts
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── features/           # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── companies/
│   │   │   ├── surveys/
│   │   │   ├── blog/
│   │   │   └── notifications/
│   │   └── charts/             # Chart components
│   │       ├── EventChart.tsx
│   │       ├── AttendanceChart.tsx
│   │       └── AnalyticsChart.tsx
│   ├── pages/                 # Page components
│   │   ├── auth/              # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── Companies.tsx
│   │   │   ├── Surveys.tsx
│   │   │   ├── Blog.tsx
│   │   │   ├── Notifications.tsx
│   │   │   └── Profile.tsx
│   │   └── NotFound.tsx
│   ├── lib/                   # Utilities and configurations
│   │   ├── api/               # API layer
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── events.ts
│   │   │   ├── companies.ts
│   │   │   ├── surveys.ts
│   │   │   └── types.ts
│   │   ├── hooks/             # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useEvents.ts
│   │   │   ├── useCompanies.ts
│   │   │   └── useSurveys.ts
│   │   ├── stores/            # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── index.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   └── validators.ts
│   │   ├── constants/
│   │   │   ├── api.ts
│   │   │   ├── routes.ts
│   │   │   └── config.ts
│   │   └── providers/
│   │       ├── QueryProvider.tsx
│   │       ├── AuthProvider.tsx
│   │       └── ThemeProvider.tsx
│   ├── types/                 # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── companies.ts
│   │   └── global.ts
│   ├── styles/                # Global styles
│   │   └── globals.css
│   ├── main.tsx              # Application entry point
│   └── App.tsx               # Root component
├── docs/                        # Documentation
├── .env.local
├── .env.example
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Core Features & Pages

### 1. Authentication (`/login`, `/register`)

**Deskripsi**: Halaman autentikasi dengan Google OAuth2 integration

**Komponen**:
```tsx
// src/components/features/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

// Fitur:
- Google OAuth2 login button
- Clean minimal design
- Loading states
- Error handling
- Redirect after login
```

**Design**:
- **Layout**: Centered card dengan gradient background
- **Colors**: Orange gradient dengan white card
- **Animation**: Smooth transitions, hover effects

### 2. Dashboard (`/dashboard`)

**Deskripsi**: Overview dashboard dengan statistik dan quick actions

**Komponen**:
```tsx
// src/pages/dashboard/Dashboard.tsx
interface DashboardProps {
  stats: DashboardStats;
  recentEvents: Event[];
  notifications: Notification[];
}

// Fitur:
- Event statistics cards
- Recent activities
- Quick action buttons
- Notification center
- Responsive grid layout
```

**Widgets**:
- **Event Stats**: Total events, active registrations, attendance rate
- **Recent Activity**: Latest events, registrations, activities
- **Quick Actions**: Create event, invite company, view reports
- **Analytics Charts**: Attendance trends, registration growth

### 3. Event Management (`/events`)

**Deskripsi**: Comprehensive event management system

**Pages**:
- `/events` - Event list dengan filtering dan search
- `/events/create` - Create new event form
- `/events/:id` - Event detail dan management
- `/events/:id/registrants` - Manage event registrants
- `/events/:id/attendance` - QR code scanning dan attendance
- `/events/:id/analytics` - Event analytics dan reports

**Key Components**:

```tsx
// src/components/features/events/EventCard.tsx
interface EventCardProps {
  event: Event;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

// src/components/features/events/EventForm.tsx
interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => void;
  isLoading?: boolean;
}

// src/components/features/events/QRScanner.tsx
interface QRScannerProps {
  eventId: string;
  onScan: (attendeeId: string) => void;
  onError: (error: string) => void;
}
```

**Fitur**:
- **Event CRUD**: Create, read, update, delete events
- **Registration Management**: View dan manage pendaftar
- **QR Code Attendance**: Scan QR untuk mark attendance
- **Certificate Generation**: Auto-generate certificates
- **Media Gallery**: Upload dan manage event photos
- **Survey Integration**: Attach surveys to events
- **Export Data**: Export registrant data to Excel
- **Real-time Updates**: Live updates untuk attendance

### 4. Company Management (`/companies`)

**Deskripsi**: Corporate management system

**Pages**:
- `/companies` - Company list dan directory
- `/companies/create` - Create new company
- `/companies/:id` - Company profile dan details
- `/companies/:id/members` - Manage company members
- `/companies/:id/events` - Company-specific events

**Key Components**:

```tsx
// src/components/features/companies/CompanyCard.tsx
interface CompanyCardProps {
  company: Company;
  showMembers?: boolean;
  showActions?: boolean;
}

// src/components/features/companies/MemberInvite.tsx
interface MemberInviteProps {
  companyId: string;
  onInvite: (email: string, role: 'member' | 'pic') => void;
}
```

**Fitur**:
- **Company Directory**: Searchable company listing
- **Member Management**: Invite, remove, dan manage roles
- **PIC Assignment**: Assign Person In Charge
- **Company Events**: Events specific to company
- **Virtual Account**: Payment integration setup

### 5. Survey Builder (`/surveys`)

**Deskripsi**: Dynamic form builder system

**Pages**:
- `/surveys` - Survey list dan templates
- `/surveys/create` - Survey builder interface
- `/surveys/:id` - Survey detail dan responses
- `/surveys/:id/analytics` - Response analytics

**Key Components**:

```tsx
// src/components/features/surveys/SurveyBuilder.tsx
interface SurveyBuilderProps {
  survey?: Survey;
  onSave: (survey: SurveyData) => void;
}

// src/components/features/surveys/QuestionBuilder.tsx
interface QuestionBuilderProps {
  question?: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
}

// src/components/features/surveys/ResponseViewer.tsx
interface ResponseViewerProps {
  surveyId: string;
  responses: SurveyResponse[];
}
```

**Fitur**:
- **Drag & Drop Builder**: Visual form builder
- **Question Types**: Text, multiple choice, rating, date, etc.
- **Conditional Logic**: Question branching based on answers
- **Response Analytics**: Charts dan statistics
- **Export Responses**: Export to Excel/CSV
- **Template Library**: Pre-built survey templates

### 6. Blog & Content (`/blog`)

**Deskripsi**: Content management system

**Pages**:
- `/blog` - Article listing dengan categories
- `/blog/create` - Create new article
- `/blog/:slug` - Article detail page
- `/blog/:slug/edit` - Edit article

**Key Components**:

```tsx
// src/components/features/blog/ArticleEditor.tsx
interface ArticleEditorProps {
  article?: Article;
  onSave: (article: ArticleData) => void;
}

// src/components/features/blog/ArticleCard.tsx
interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact';
}
```

**Fitur**:
- **Rich Text Editor**: WYSIWYG editor dengan media upload
- **Media Gallery**: Image dan video management
- **YouTube Integration**: Embed YouTube videos
- **SEO Optimization**: Meta tags dan slug generation
- **Category Management**: Article categorization
- **Comment System**: User comments dan moderation

### 7. Notifications (`/notifications`)

**Deskripsi**: Notification center dan push notifications

**Key Components**:

```tsx
// src/components/features/notifications/NotificationCenter.tsx
interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

// src/components/features/notifications/NotificationCard.tsx
interface NotificationCardProps {
  notification: Notification;
  onAction?: (action: string) => void;
}
```

**Fitur**:
- **Real-time Notifications**: WebSocket integration
- **Notification Types**: Event updates, invitations, reminders
- **Action Buttons**: Quick actions dari notifications
- **Mark as Read**: Individual dan bulk mark as read
- **Notification History**: Archive dan search

## API Integration dengan TanStack Query

### Configuration

```typescript
// src/lib/api/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// API Base Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1338';

export const apiClient = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Token ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();

    // Handle TMC API response format
    if (result.status !== 'OK') {
      throw new Error(result.message?.id || result.message?.en || 'API Error');
    }

    return result;
  },
};
```

### Query Hooks

```typescript
// src/lib/hooks/useEvents.ts
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => apiClient.request<{status: string, data: Event[]}>('/event/'),
    select: (response) => response.data || [],
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => apiClient.request<{status: string, data: Event}>(`/event/${eventId}/`),
    enabled: !!eventId,
    select: (response) => response.data,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: CreateEventData) =>
      apiClient.request<{status: string, data: Event}>('/event/', {
        method: 'POST',
        body: JSON.stringify(eventData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event berhasil dibuat!');
    },
    onError: (error) => {
      toast.error('Gagal membuat event');
    },
  });
};

export const useEventRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: {eventId: string, data: any}) =>
      apiClient.request<{status: string, data: any}>(`/event/${eventId}/registration/`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      toast.success('Registrasi berhasil!');
    },
  });
};

// src/lib/hooks/useCompanies.ts
export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.request<{status: string, data: Company[]}>('/company/'),
    select: (response) => response.data || [],
  });
};

export const useCompany = (companyId: string) => {
  return useQuery({
    queryKey: ['companies', companyId],
    queryFn: () => apiClient.request<{status: string, data: Company}>(`/company/${companyId}/`),
    enabled: !!companyId,
    select: (response) => response.data,
  });
};

export const useInviteCompanyMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, email, role }: InviteMemberData) =>
      apiClient.request(`/company/${companyId}/invite/`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      }),
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId] });
      toast.success('Undangan berhasil dikirim!');
    },
  });
};
```

### Error Handling

```typescript
// src/lib/utils/errorHandler.ts
export const handleApiError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (error.message.includes('403')) {
      toast.error('Anda tidak memiliki akses untuk melakukan aksi ini');
      return;
    }

    if (error.message.includes('404')) {
      toast.error('Data tidak ditemukan');
      return;
    }

    toast.error(error.message || 'Terjadi kesalahan');
  }
};

// src/lib/api/auth.ts
export const useAuth = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.request<{
        status: string;
        data: {
          token: string;
          user: any;
        }
      }>('/authenticate/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(response.data.token);
      localStorage.setItem('auth_token', response.data.token);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = () => {
    // Redirect to Google OAuth
    window.location.href = `${API_BASE_URL}/authenticate/google/`;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return {
    token,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!token,
  };
};
```

## State Management

### Zustand Stores

```typescript
// src/lib/stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.request<{
        status: string;
        data: {
          token: string;
          user: any;
        }
      }>('/authenticate/', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false
      });

      localStorage.setItem('auth_token', response.data.token);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('auth_token');
  },

  setUser: (user) => set({ user }),
}));

// src/lib/stores/uiStore.ts
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  theme: 'light',
  notifications: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification]
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
}));
```

## UI Components

### Base Components

```tsx
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, leftIcon, rightIcon, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm',
      secondary: 'bg-orange-100 text-orange-900 hover:bg-orange-200',
      outline: 'border border-orange-300 bg-transparent hover:bg-orange-50 text-orange-700',
      ghost: 'hover:bg-orange-50 text-orange-700',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
    };
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };
    
    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

// components/ui/Card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white border border-gray-200 shadow-sm',
      elevated: 'bg-white shadow-lg border-0',
      outlined: 'bg-white border-2 border-orange-200',
    };
    
    return (
      <div
        ref={ref}
        className={cn('rounded-lg', variants[variant], className)}
        {...props}
      />
    );
  }
);

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
```

### Feature Components

```tsx
// components/features/events/EventCard.tsx
interface EventCardProps {
  event: Event;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onRegister?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  showActions = false,
  variant = 'default',
  onRegister,
  onEdit,
  onDelete,
}) => {
  const isUpcoming = new Date(event.date) > new Date();
  const isFree = event.is_free;
  
  return (
    <Card className={cn(
      'overflow-hidden transition-all duration-200 hover:shadow-md',
      variant === 'featured' && 'border-orange-200 shadow-lg'
    )}>
      {event.main_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.main_image.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-200 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Badge 
            className={cn(
              'absolute top-3 right-3',
              isFree ? 'bg-green-500' : 'bg-orange-500'
            )}
          >
            {isFree ? 'GRATIS' : formatCurrency(event.price)}
          </Badge>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {event.description}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant={isUpcoming ? 'default' : 'secondary'}>
              {isUpcoming ? 'Mendatang' : 'Selesai'}
            </Badge>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {event.registrant_count || 0} peserta
            </div>
          </div>
          
          {showActions && (
            <div className="flex gap-2 pt-2">
              {isUpcoming && !event.is_registration_close && (
                <Button size="sm" onClick={onRegister} className="flex-1">
                  Daftar
                </Button>
              )}
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="destructive" onClick={onDelete}>
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

## Responsive Design

### Breakpoint Strategy

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
};

// Mobile-first approach
const responsiveClasses = {
  container: 'px-4 sm:px-6 lg:px-8',
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
  card: 'p-4 sm:p-6',
  text: 'text-sm sm:text-base',
};
```

### Mobile Navigation

```tsx
// components/layout/MobileNav.tsx
export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-gray-600"
      >
        <Menu className="h-6 w-6" />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Logo />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                <nav className="flex-1 p-4">
                  <NavigationItems onItemClick={() => setIsOpen(false)} />
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for heavy components
const EventForm = dynamic(() => import('@/components/features/events/EventForm'), {
  loading: () => <EventFormSkeleton />,
  ssr: false,
});

const SurveyBuilder = dynamic(() => import('@/components/features/surveys/SurveyBuilder'), {
  loading: () => <div>Loading survey builder...</div>,
  ssr: false,
});

const QRScanner = dynamic(() => import('@/components/features/events/QRScanner'), {
  loading: () => <div>Loading QR scanner...</div>,
  ssr: false,
});
```

### Image Optimization

```tsx
// components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn('transition-opacity duration-200', className)}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      onLoad={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
      style={{ opacity: 0 }}
    />
  );
};
```

### Caching Strategy

```typescript
// lib/api/cache.ts
export const cacheConfig = {
  // Static data - cache for 1 hour
  static: {
    staleTime: 60 * 60 * 1000,
    cacheTime: 60 * 60 * 1000 * 24, // 24 hours
  },
  
  // Dynamic data - cache for 5 minutes
  dynamic: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Real-time data - minimal cache
  realtime: {
    staleTime: 0,
    cacheTime: 60 * 1000, // 1 minute
  },
};
```

## Testing Strategy

### Unit Testing

```typescript
// __tests__/components/EventCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/features/events/EventCard';

const mockEvent: Event = {
  id: '1',
  title: 'Test Event',
  date: '2024-01-15T10:00:00Z',
  venue: 'Test Venue',
  is_free: true,
  description: 'Test description',
};

describe('EventCard', () => {
  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
    expect(screen.getByText('GRATIS')).toBeInTheDocument();
  });
  
  it('calls onRegister when register button is clicked', () => {
    const onRegister = jest.fn();
    render(
      <EventCard 
        event={mockEvent} 
        showActions={true} 
        onRegister={onRegister} 
      />
    );
    
    fireEvent.click(screen.getByText('Daftar'));
    expect(onRegister).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing

```typescript
// __tests__/api/events.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvents } from '@/lib/hooks/useEvents';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useEvents hook', () => {
  it('fetches events successfully', async () => {
    const { result } = renderHook(() => useEvents(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
        }),
      ])
    );
  });
});
```

## Deployment

### Environment Configuration

```bash
# .env.local
VITE_API_URL=http://localhost:1338
VITE_APP_URL=http://localhost:5173
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Build Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:1338',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@headlessui/react', 'framer-motion', 'lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@headlessui/react', 'framer-motion', 'lucide-react'],
  },
});
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 node
COPY --from=base /app/node_modules ./node_modules
COPY --from=build --chown=node:nodejs /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

USER node
EXPOSE 5173
ENV PORT 5173
CMD ["npm", "preview"]
```

### Package.json Dependencies

```json
{
  "name": "tmc-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,css,md}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-form": "^0.19.0",
    "zustand": "^4.4.0",
    "axios": "^1.5.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.0",
    "recharts": "^2.8.0",
    "@headlessui/react": "^1.7.0",
    "framer-motion": "^10.16.0",
    "lucide-react": "^0.279.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "clsx": "^2.0.0",
    "qr-scanner": "^1.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.0"
  }
}
```

## Kesimpulan

Rancangan frontend TMC Web App ini menggabungkan teknologi modern dengan design yang clean dan minimalist. Dengan menggunakan **React 18 + Vite**, TanStack Query, dan Tailwind CSS, aplikasi ini akan memberikan user experience yang optimal dengan performance yang baik.

### Key Features:
- **Modern Tech Stack**: React 18, Vite, TypeScript, TanStack Query
- **Orange Minimalist Design**: Clean interface dengan tema orange yang konsisten
- **Responsive Design**: Mobile-first approach untuk semua device
- **Type Safety**: Full TypeScript implementation
- **Performance Optimized**: Code splitting, caching strategy, Vite HMR
- **Developer Experience**: ESLint, Prettier, testing setup
- **Production Ready**: Docker configuration, environment setup
- **API Integration**: Siap terhubung dengan TMC Backend API yang sudah ada

Aplikasi ini siap untuk development dan akan memberikan foundation yang solid untuk membangun web application yang scalable dan maintainable dengan backend API yang sudah tersedia.
