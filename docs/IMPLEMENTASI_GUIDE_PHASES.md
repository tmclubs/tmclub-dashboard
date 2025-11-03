# 📋 TMC API - PANDUAN IMPLEMENTASI PER PHASE

## 🎯 Overview

Dokumen ini menyediakan panduan implementasi TMC API yang terstruktur dalam 12 phase, dari setup awal hingga production deployment. Setiap phase mencakup detail teknis, code examples, dan checklist yang lengkap.

---

## 📊 Project Timeline & Dependencies

```
Timeline Estimasi: 6-8 bulan
Total Developer Effort: ~40-50 person-weeks

Phase 1-5 (MVP Core): 3-4 bulan
Phase 6-12 (Complete System): 6-8 bulan

Dependencies Flow:
Phase 1 → Phase 2 → Phase 3 → Phase 4,5,6,7,8 → Phase 9,10 → Phase 11 → Phase 12
```

---

## 🚀 PHASE 1: PROJECT SETUP & FOUNDATION
**Timeline: 2-3 hari | Developer: 1 Backend + 1 DevOps**

### 🎯 Objectives
- Setup environment development
- Konfigurasi Docker containers
- Setup database PostgreSQL
- Basic Django project structure
- Initial API testing

### 📋 Checklist
- [ ] Clone repository & setup git
- [ ] Docker & Docker Compose installation
- [ ] PostgreSQL database setup
- [ ] Environment variables configuration
- [ ] Django project initialization
- [ ] Basic API endpoint testing
- [ ] Admin panel setup

### 🔧 Step-by-Step Implementation


#### 1.2 Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**File .env Configuration:**
```bash
# .env
DEBUG=True
SECRET_KEY=your-secret-key-here-use-django-generate
DJANGO_SETTINGS_MODULE=core.settings.development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tmc_dev
DB_USER=postgres
DB_PWD=your_postgres_password

# Application Configuration
APP_IP=127.0.0.1
APP_PORT=8000
ALLOWED_HOSTS=localhost,127.0.0.1

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

#### 1.3 Docker Setup
**docker-compose.yaml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PWD}
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    ports:
      - "${DB_PORT}:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    environment:
      - DEBUG=True
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PWD=${DB_PWD}
    volumes:
      - ./backend:/app
      - staticfiles:/app/staticfiles
      - mediafiles:/app/mediafiles
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    command: python manage.py runserver 0.0.0.0:8000

volumes:
  postgres_data:
  staticfiles:
  mediafiles:
```

**Dockerfile.dev:**
```dockerfile
# backend/Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create directories
RUN mkdir -p staticfiles mediafiles logs

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

#### 1.4 Django Project Setup
```bash
# Navigate to backend directory
cd backend

# Create Django project (if not exists)
django-admin startproject core .

# Create initial apps structure
mkdir apps
cd apps

# Create core infrastructure apps
python ../manage.py startapp common
python ../manage.py startapp authentication
python ../manage.py startapp account
```

#### 1.5 Basic Django Configuration
**core/settings/base.py:**
```python
import os
from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Security
SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# Application Definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'corsheaders',
    'drf_yasg2',
]

LOCAL_APPS = [
    'apps.common',
    'apps.authentication',
    'apps.account',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

# Templates
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PWD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Jakarta'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'mediafiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:1338",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:1338",
]

CORS_ALLOW_CREDENTIALS = True
```

#### 1.6 URL Configuration
**core/urls.py:**
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg2.views import get_schema_view
from drf_yasg2 import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="TMC API",
        default_version='v1',
        description="Toyota Manufacturers Club API Documentation",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@tmc.id"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.common.urls')),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('health/', include('apps.common.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

#### 1.7 Initial Migration
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

#### 1.8 Makefile Setup
```makefile
# Makefile
.PHONY: help build up down destroy shell superuser migrate collectstatic bash

help:
	@echo "Available commands:"
	@echo "  build      - Build Docker images"
	@echo "  up         - Start services in foreground"
	@echo "  upd        - Start services in daemon mode"
	@echo "  down       - Stop services"
	@echo "  destroy    - Stop and remove all containers"
	@echo "  shell      - Open Django shell"
	@echo "  bash       - Open container bash"
	@echo "  superuser  - Create Django superuser"
	@echo "  migrate    - Run database migrations"
	@echo "  collectstatic - Collect static files"

build:
	@echo "Building Docker images..."
	docker-compose build

up:
	@echo "Starting services..."
	docker-compose up

upd:
	@echo "Starting services in daemon mode..."
	docker-compose up -d

down:
	@echo "Stopping services..."
	docker-compose down

destroy:
	@echo "Destroying containers..."
	docker-compose down -v --remove-orphans

shell:
	@echo "Opening Django shell..."
	docker-compose exec backend python manage.py shell

bash:
	@echo "Opening container bash..."
	docker-compose exec backend bash

superuser:
	@echo "Creating Django superuser..."
	docker-compose exec backend python manage.py createsuperuser

migrate:
	@echo "Running database migrations..."
	docker-compose exec backend python manage.py migrate

dev-setup:
	@echo "Setting up development environment..."
	cp .env.example .env
	docker-compose build
	docker-compose up -d db
	sleep 5
	docker-compose exec backend python manage.py migrate
	docker-compose exec backend python manage.py createsuperuser

dev-start:
	@echo "Starting development environment..."
	docker-compose up

logs:
	@echo "Showing logs..."
	docker-compose logs -f
```

#### 1.9 Testing Setup
```bash
# Test basic Django setup
python manage.py check

# Test database connection
python manage.py dbshell --command "SELECT version();"

# Test admin panel
python manage.py runserver 0.0.0.0:8000
# Visit http://localhost:8000/admin/
```

### ✅ Phase 1 Completion Criteria
- [ ] Docker containers running successfully
- [ ] PostgreSQL database connected
- [ ] Django admin panel accessible
- [ ] Basic API endpoints responding
- [ ] Environment variables configured
- [ ] Makefile commands working
- [ ] Swagger documentation accessible

---

## 🔐 PHASE 2: CORE AUTHENTICATION SYSTEM
**Timeline: 3-4 hari | Developer: 1 Backend**

### 🎯 Objectives
- Implementasi Google OAuth2 authentication
- Setup token-based authentication
- Create user management system
- API endpoints untuk login/logout
- Role-based access control

### 📋 Checklist
- [ ] Google OAuth2 setup
- [ ] Django allauth configuration
- [ ] Custom user model (if needed)
- [ ] Authentication serializers
- [ ] Authentication views/endpoints
- [ ] Token management
- [ ] User profile management
- [ ] Role-based permissions

### 🔧 Step-by-Step Implementation

#### 2.1 Google OAuth2 Setup

**Step 1: Get Google OAuth2 Credentials**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API and Google OAuth2 API
4. Create OAuth2 client ID credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:8000/api/auth/google/callback/`
   - Production: `https://yourdomain.com/api/auth/google/callback/`

**Step 2: Install Required Packages**
```bash
pip install django-allauth social-auth-app-django
```

**Step 3: Update .env**
```bash
# Add to .env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 2.2 Django Allauth Configuration
**core/settings/base.py:**
```python
# Add to INSTALLED_APPS
INSTALLED_APPS += [
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'rest_auth',
    'rest_auth.registration',
]

# Site configuration
SITE_ID = 1

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Allauth configuration
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'none'  # Set to 'mandatory' for production
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_USERNAME_REQUIRED = False

# Social account configuration
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        },
        'OAUTH_PKCE_ENABLED': True,
        'APP': {
            'client_id': config('GOOGLE_CLIENT_ID'),
            'secret': config('GOOGLE_CLIENT_SECRET'),
            'key': '',
        }
    }
}

# REST Auth configuration
REST_AUTH_SERIALIZERS = {
    'USER_DETAILS_SERIALIZER': 'apps.authentication.serializers.CustomUserDetailsSerializer',
}
```

#### 2.3 Custom User Model (Optional)
Jika perlu custom user model, buat di Phase 1. Untuk simplicity, gunakan default Django User model.

#### 2.4 Authentication Serializers
**apps/authentication/serializers.py:**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from allauth.account.models import EmailAddress

User = get_user_model()

class CustomUserDetailsSerializer(serializers.ModelSerializer):
    """Custom user details serializer"""
    role = serializers.SerializerMethodField()
    is_pic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_active', 'date_joined', 'role', 'is_pic'
        ]
        read_only_fields = ['id', 'is_staff', 'is_active', 'date_joined']

    def get_role(self, obj):
        """Get user role based on company membership"""
        from apps.company.models import CompanyMemberModel

        if obj.is_staff:
            return 'admin'

        is_pic = CompanyMemberModel.objects.filter(
            user=obj,
            is_pic=True
        ).exists()

        return 'pic' if is_pic else 'member'

    def get_is_pic(self, obj):
        """Check if user is PIC in any company"""
        from apps.company.models import CompanyMemberModel
        return CompanyMemberModel.objects.filter(
            user=obj,
            is_pic=True
        ).exists()

class GoogleLoginSerializer(serializers.Serializer):
    """Google OAuth login serializer"""
    access_token = serializers.CharField()
    backend = serializers.CharField(default='google-oauth2')

class ManualLoginSerializer(serializers.Serializer):
    """Manual login serializer"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class ManualRegisterSerializer(serializers.Serializer):
    """Manual registration serializer"""
    username = serializers.EmailField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already registered")
        return value
```

#### 2.5 Authentication Views
**apps/authentication/views.py:**
```python
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth import get_user_model
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from .serializers import (
    GoogleLoginSerializer,
    ManualLoginSerializer,
    ManualRegisterSerializer,
    CustomUserDetailsSerializer
)

User = get_user_model()

class GoogleLoginView(SocialLoginView):
    """Google OAuth2 login view"""
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:8000/api/auth/google/callback/"
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        try:
            serializer = GoogleLoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Process OAuth login
            response = super().post(request, *args, **kwargs)

            if response.status_code == 200:
                user_data = CustomUserDetailsSerializer(
                    request.user,
                    context={'request': request}
                ).data

                return Response({
                    'token': response.data['key'],
                    'user': user_data,
                    'role': user_data['role'],
                    'login_method': 'google_oauth',
                    'is_pic': user_data['is_pic']
                })

            return response

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def manual_login_view(request):
    """Manual login with username and password"""
    try:
        serializer = ManualLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        # Try authentication
        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:
                # Get or create token
                token, created = Token.objects.get_or_create(user=user)

                # Get user details
                user_data = CustomUserDetailsSerializer(
                    user,
                    context={'request': request}
                ).data

                return Response({
                    'token': token.key,
                    'user': user_data,
                    'role': user_data['role'],
                    'login_method': 'manual',
                    'is_pic': user_data['is_pic']
                })
            else:
                return Response(
                    {'error': 'Account is disabled'},
                    status=status.HTTP_403_FORBIDDEN
                )
        else:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def manual_register_view(request):
    """Manual user registration"""
    try:
        serializer = ManualRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create user
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            first_name=serializer.validated_data['first_name'],
            last_name=serializer.validated_data['last_name'],
        )

        # Create token
        token = Token.objects.create(user=user)

        # Get user details
        user_data = CustomUserDetailsSerializer(
            user,
            context={'request': request}
        ).data

        return Response({
            'message': 'Registration successful',
            'token': token.key,
            'user': user_data,
            'role': user_data['role'],
            'login_method': 'manual',
            'is_pic': user_data['is_pic']
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout user"""
    try:
        # Delete token
        request.user.auth_token.delete()

        return Response({
            'message': 'Logout successful'
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_view(request):
    """Get current user profile"""
    try:
        user_data = CustomUserDetailsSerializer(
            request.user,
            context={'request': request}
        ).data

        return Response(user_data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile_view(request):
    """Update user profile"""
    try:
        user = request.user
        data = request.data

        # Update allowed fields
        allowed_fields = ['first_name', 'last_name']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])

        user.save()

        user_data = CustomUserDetailsSerializer(
            user,
            context={'request': request}
        ).data

        return Response({
            'message': 'Profile updated successfully',
            'user': user_data
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
```

#### 2.6 Authentication URLs
**apps/authentication/urls.py:**
```python
from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

app_name = 'authentication'

urlpatterns = [
    # OAuth login
    path('oauth/', views.GoogleLoginView.as_view(), name='google_login'),

    # Manual authentication
    path('manual-login/', views.manual_login_view, name='manual_login'),
    path('manual-register/', views.manual_register_view, name='manual_register'),

    # Profile management
    path('me/', views.user_profile_view, name='user_profile'),
    path('update-me/', views.update_profile_view, name='update_profile'),

    # Logout
    path('logout/', views.logout_view, name='logout'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
```

#### 2.7 Update Main URLs
**core/urls.py:**
```python
# Add to urlpatterns
urlpatterns += [
    path('api/auth/', include('apps.authentication.urls')),
]
```

#### 2.8 Testing Authentication

**Test Google OAuth2:**
```bash
# Get Google OAuth2 token (via frontend or Postman)
# Test with curl:
curl -X POST http://localhost:8000/api/auth/oauth/ \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "your_google_access_token",
    "backend": "google-oauth2"
  }'
```

**Test Manual Login:**
```bash
curl -X POST http://localhost:8000/api/auth/manual-login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "password123"
  }'
```

**Test User Profile:**
```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Token your_token_here"
```

### ✅ Phase 2 Completion Criteria
- [ ] Google OAuth2 login working
- [ ] Manual login/register working
- [ ] Token-based authentication functional
- [ ] User profile endpoints working
- [ ] Role-based permissions configured
- [ ] API endpoints tested with Postman/curl

---

## 📅 PHASE 3: EVENT MANAGEMENT SYSTEM
**Timeline: 7-8 hari | Developer: 1 Backend**

### 🎯 Objectives
- Membuat Event model lengkap
- Event CRUD operations
- Event registration system
- QR code generation untuk check-in
- Certificate generation
- Event status management

### 📋 Checklist
- [ ] Event model creation
- [ ] Event CRUD API endpoints
- [ ] Event registration system
- [ ] QR code generation
- [ ] Certificate generation
- [ ] Event status management
- [ ] Admin interface for events
- [ ] Event filtering and search

### 🔧 Step-by-Step Implementation

#### 3.1 Install Required Packages
```bash
pip install qrcode[pil] pillow django-crispy-forms
```

#### 3.2 Event Model
**apps/event/models.py:**
```python
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils import timezone
from apps.common.models import FileModel, ReferenceEventModel
from apps.survey.models import FormBuilderModel

User = get_user_model()

class EventModel(models.Model):
    """Main Event Model"""

    LEVEL_CHOICES = [
        ('member', 'Member'),
        ('pic', 'PIC'),
        ('admin', 'Admin'),
    ]

    title = models.CharField(max_length=255, verbose_name="Event Title")
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(verbose_name="Description", blank=True)
    date = models.DateTimeField(verbose_name="Event Date")
    venue = models.CharField(max_length=255, verbose_name="Venue")

    # Pricing
    is_free = models.BooleanField(default=True, verbose_name="Free Event")
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name="Price (IDR)"
    )

    # Access control
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default='member',
        verbose_name="Access Level"
    )

    # Status management
    is_registration_close = models.BooleanField(default=False, verbose_name="Close Registration")
    is_list_attendees = models.BooleanField(default=True, verbose_name="Show Attendees List")
    is_done = models.BooleanField(default=False, verbose_name="Event Completed")
    is_active = models.BooleanField(default=True, verbose_name="Active")

    # Media
    main_image = models.ForeignKey(
        FileModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='event_main_image',
        verbose_name="Main Image"
    )

    # Relationships
    owned_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_events',
        verbose_name="Event Owner"
    )
    references = models.ManyToManyField(
        ReferenceEventModel,
        blank=True,
        verbose_name="References"
    )
    medias = models.ManyToManyField(
        FileModel,
        blank=True,
        related_name='event_medias',
        verbose_name="Event Media"
    )
    surveys = models.ManyToManyField(
        FormBuilderModel,
        blank=True,
        verbose_name="Surveys"
    )

    # Unique identifier for QR codes
    nonce = models.CharField(max_length=255, unique=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'event_eventmodel'
        ordering = ['-date', '-created_at']
        verbose_name = "Event"
        verbose_name_plural = "Events"

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%d %B %Y')}"

    def save(self, *args, **kwargs):
        # Generate slug if not exists
        if not self.slug:
            self.slug = self.generate_unique_slug()

        # Generate nonce if not exists
        if not self.nonce:
            self.nonce = str(uuid.uuid4())

        super().save(*args, **kwargs)

    def generate_unique_slug(self):
        """Generate unique slug from title"""
        import re
        from django.utils.text import slugify

        base_slug = slugify(self.title)
        slug = base_slug
        counter = 1

        while EventModel.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    @property
    def is_upcoming(self):
        """Check if event is upcoming"""
        return self.date > timezone.now()

    @property
    def is_past(self):
        """Check if event is past"""
        return self.date < timezone.now()

    @property
    def is_today(self):
        """Check if event is today"""
        today = timezone.now().date()
        return self.date.date() == today

    @property
    def registration_open(self):
        """Check if registration is open"""
        return not self.is_registration_close and self.is_upcoming

    @property
    def formatted_price(self):
        """Format price to Indonesian format"""
        if self.is_free:
            return "Free"
        return f"Rp {self.price:,.0f}".replace(',', '.')

    @property
    def attendee_count(self):
        """Get number of registered attendees"""
        return self.registrants.filter(is_attendance=True).count()

    @property
    def registration_count(self):
        """Get number of registrations"""
        return self.registrants.count()

class RegistrantModel(models.Model):
    """Event Registration Model"""

    event = models.ForeignKey(
        EventModel,
        on_delete=models.CASCADE,
        related_name='registrants',
        verbose_name="Event"
    )
    attendance = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='event_registrants',
        verbose_name="Attendee"
    )
    invited_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='invited_registrants',
        verbose_name="Invited By"
    )

    # Certificate information
    certificate_number = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        verbose_name="Certificate Number"
    )

    # Attendance tracking
    is_attendance = models.BooleanField(default=False, verbose_name="Attended")
    attendance_time = models.DateTimeField(null=True, blank=True, verbose_name="Attendance Time")

    # Registration management
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Published At")

    class Meta:
        db_table = 'event_registrantmodel'
        unique_together = ['event', 'attendance']
        verbose_name = "Event Registrant"
        verbose_name_plural = "Event Registrants"

    def __str__(self):
        return f"{self.attendance.get_full_name()} - {self.event.title}"

    def publish(self):
        """Publish registration with timestamp"""
        self.published_at = timezone.now()
        self.save()

    def mark_attendance(self):
        """Mark attendee as present"""
        self.is_attendance = True
        self.attendance_time = timezone.now()

        # Generate certificate if not exists
        if not self.certificate_number:
            self.generate_certificate_number()

        self.save()

    def generate_certificate_number(self):
        """Generate certificate number format: 000X - TMC/ROMAN/YEAR"""
        if not self.certificate_number:
            year = self.event.date.year
            roman_months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
            month = roman_months[self.event.date.month - 1]

            # Count existing certificates for this event/year
            count = RegistrantModel.objects.filter(
                event__date__year=year,
                certificate_number__isnull=False
            ).count() + 1

            self.certificate_number = f"{count:04d} - TMC/{month}/{year}"
            self.save()

class BarcodeEventModel(models.Model):
    """QR Code for Event Check-in"""

    event = models.OneToOneField(
        EventModel,
        on_delete=models.CASCADE,
        related_name='barcode',
        verbose_name="Event"
    )
    barcode = models.ImageField(
        upload_to='qr_codes/',
        verbose_name="QR Code Image"
    )
    is_open = models.BooleanField(default=False, verbose_name="QR Code Open")

    class Meta:
        db_table = 'event_barcodemodel'
        verbose_name = "Event QR Code"
        verbose_name_plural = "Event QR Codes"

    def __str__(self):
        return f"QR Code for {self.event.title}"

    def save(self, *args, **kwargs):
        # Generate QR code on save
        if not self.barcode and self.event.nonce:
            self.generate_qr_code()
        super().save(*args, **kwargs)

    def generate_qr_code(self):
        """Generate QR code for event"""
        import qrcode
        from PIL import Image
        from io import BytesIO
        from django.core.files.base import ContentFile

        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(self.event.nonce)
        qr.make(fit=True)

        # Create QR code image
        qr_img = qr.make_image(fill_color="black", back_color="white")

        # Create canvas with logo
        canvas = Image.new('RGB', (370, 370), 'white')

        # Add QR code to canvas
        qr_position = ((370 - qr_img.pixel_size) // 2, 50)
        canvas.paste(qr_img, qr_position)

        # Add logo (if exists)
        try:
            from django.conf import settings
            logo_path = settings.BASE_DIR / 'static' / 'images' / 'logo.png'
            if logo_path.exists():
                logo = Image.open(logo_path).resize((100, 100))
                logo_position = ((370 - 100) // 2, (370 - 100) // 2)
                canvas.paste(logo, logo_position, mask=logo if logo.mode == 'RGBA' else None)
        except Exception:
            pass  # Logo not found or error

        # Save to BytesIO
        buffer = BytesIO()
        canvas.save(buffer, format='JPEG', quality=85)

        # Save to model
        filename = f'qr_{self.event.nonce[:8]}.jpg'
        self.barcode.save(filename, ContentFile(buffer.getvalue()), save=False)
```

#### 3.3 Event Serializers
**apps/event/serializers.py:**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import EventModel, RegistrantModel, BarcodeEventModel
from apps.common.models import FileModel, ReferenceEventModel
from apps.survey.models import FormBuilderModel

User = get_user_model()

class EventListSerializer(serializers.ModelSerializer):
    """Serializer for event list view"""
    attendee_count = serializers.ReadOnlyField()
    registration_count = serializers.ReadOnlyField()
    formatted_price = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    registration_open = serializers.ReadOnlyField()

    # Owner information
    owner_name = serializers.CharField(source='owned_by.get_full_name', read_only=True)

    # Image URL
    main_image_url = serializers.ImageField(source='main_image.image', read_only=True)

    class Meta:
        model = EventModel
        fields = [
            'id', 'title', 'slug', 'date', 'venue', 'is_free', 'price',
            'formatted_price', 'is_registration_close', 'is_done',
            'attendee_count', 'registration_count', 'is_upcoming',
            'is_past', 'is_today', 'registration_open', 'owner_name',
            'main_image_url', 'level', 'created_at'
        ]

class EventDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for event"""
    owner_name = serializers.CharField(source='owned_by.get_full_name', read_only=True)
    owner_email = serializers.CharField(source='owned_by.email', read_only=True)
    attendee_count = serializers.ReadOnlyField()
    registration_count = serializers.ReadOnlyField()
    formatted_price = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    registration_open = serializers.ReadOnlyField()

    # Related objects
    main_image = FileSerializer(read_only=True)
    references = ReferenceEventModelSerializer(many=True, read_only=True)
    medias = FileSerializer(many=True, read_only=True)
    surveys = FormBuilderModelSerializer(many=True, read_only=True)

    class Meta:
        model = EventModel
        fields = [
            'id', 'title', 'slug', 'description', 'date', 'venue',
            'is_free', 'price', 'formatted_price', 'level',
            'is_registration_close', 'is_list_attendees', 'is_done',
            'attendee_count', 'registration_count', 'is_upcoming',
            'is_past', 'is_today', 'registration_open',
            'owner_name', 'owner_email', 'main_image', 'references',
            'medias', 'surveys', 'nonce', 'created_at', 'updated_at'
        ]

class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating events"""

    class Meta:
        model = EventModel
        fields = [
            'title', 'description', 'date', 'venue', 'is_free',
            'price', 'level', 'is_registration_close',
            'is_list_attendees', 'main_image'
        ]

    def validate_price(self, value):
        """Validate price for paid events"""
        if not self.initial_data.get('is_free', True) and value <= 0:
            raise serializers.ValidationError("Price must be greater than 0 for paid events")
        return value

    def validate_date(self, value):
        """Validate event date"""
        if value <= timezone.now():
            raise serializers.ValidationError("Event date cannot be in the past")
        return value

class RegistrantSerializer(serializers.ModelSerializer):
    """Serializer for event registrants"""
    attendee_name = serializers.CharField(source='attendance.get_full_name', read_only=True)
    attendee_email = serializers.CharField(source='attendance.email', read_only=True)
    inviter_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)

    class Meta:
        model = RegistrantModel
        fields = [
            'id', 'attendee_name', 'attendee_email', 'inviter_name',
            'certificate_number', 'is_attendance', 'attendance_time',
            'published_at'
        ]

class EventRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for event registration"""

    class Meta:
        model = RegistrantModel
        fields = ['event', 'attendance']

    def validate(self, data):
        """Validate registration"""
        event = data['event']
        user = data['attendance']

        # Check if user already registered
        if RegistrantModel.objects.filter(event=event, attendance=user).exists():
            raise serializers.ValidationError("User already registered for this event")

        # Check if registration is open
        if not event.registration_open:
            raise serializers.ValidationError("Registration is closed for this event")

        # Check access level (future enhancement)
        # This would require checking user role vs event level

        return data

class BarcodeEventSerializer(serializers.ModelSerializer):
    """Serializer for event QR code"""
    barcode_url = serializers.ImageField(source='barcode', read_only=True)

    class Meta:
        model = BarcodeEventModel
        fields = ['id', 'barcode_url', 'is_open']
```

#### 3.4 Event Views
**apps/event/views.py:**
```python
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import EventModel, RegistrantModel, BarcodeEventModel
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer,
    RegistrantSerializer, EventRegistrationSerializer, BarcodeEventSerializer
)

User = get_user_model()

class EventViewSet(viewsets.ModelViewSet):
    """Event ViewSet for CRUD operations"""

    queryset = EventModel.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['level', 'is_free', 'is_done', 'is_registration_close']
    search_fields = ['title', 'venue', 'description']
    ordering_fields = ['date', 'created_at', 'title']
    ordering = ['-date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        else:
            return EventDetailSerializer

    def perform_create(self, serializer):
        """Set event owner to current user"""
        serializer.save(owned_by=self.request.user)

    def get_queryset(self):
        """Filter events based on user access level"""
        user = self.request.user
        queryset = super().get_queryset()

        # Admin can see all events
        if user.is_staff:
            return queryset

        # Filter by user level (future enhancement)
        # For now, return all active events
        return queryset

    @action(detail=True, methods=['post'])
    def register(self, request, pk=None):
        """Register user for event"""
        event = self.get_object()
        user = request.user

        try:
            # Check if already registered
            if RegistrantModel.objects.filter(event=event, attendance=user).exists():
                return Response(
                    {'error': 'Already registered for this event'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check registration status
            if not event.registration_open:
                return Response(
                    {'error': 'Registration is closed'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create registration
            registration = RegistrantModel.objects.create(
                event=event,
                attendance=user,
                invited_by=user  # Self-registration
            )
            registration.publish()

            # Check if event is paid and create invoice
            if not event.is_free:
                from apps.transaction.models import Invoice, InvoiceItem
                from django.contrib.contenttypes.models import ContentType

                # Create invoice
                invoice = Invoice.objects.create(
                    user=user,
                    amount=event.price,
                    status=101,  # Pending
                    status_desc='Pending Payment'
                )

                # Create invoice item
                event_type = ContentType.objects.get_for_model(EventModel)
                InvoiceItem.objects.create(
                    invoice=invoice,
                    content_type=event_type,
                    object_id=event.id,
                    item_name=f"Registration: {event.title}",
                    amount=event.price,
                    qty=1
                )

                return Response({
                    'message': 'Registration successful. Payment required.',
                    'registration': RegistrantSerializer(registration).data,
                    'invoice': {
                        'number': invoice.number,
                        'amount': str(invoice.amount),
                        'status': invoice.status,
                        'status_desc': invoice.status_desc
                    }
                })

            return Response({
                'message': 'Registration successful',
                'registration': RegistrantSerializer(registration).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def registrants(self, request, pk=None):
        """Get event registrants"""
        event = self.get_object()

        # Check if user can see registrants
        if not event.is_list_attendees:
            return Response(
                {'error': 'Attendee list is not public'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Only event owner or admin can see full list
        if not (request.user.is_staff or event.owned_by == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        registrants = event.registrants.all()
        serializer = RegistrantSerializer(registrants, many=True)

        return Response({
            'event': event.title,
            'total_registrants': registrants.count(),
            'attendees': registrants.filter(is_attendance=True).count(),
            'registrants': serializer.data
        })

    @action(detail=True, methods=['post'])
    def generate_qr(self, request, pk=None):
        """Generate QR code for event"""
        event = self.get_object()

        # Check permission
        if not (request.user.is_staff or event.owned_by == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Create or update QR code
            barcode, created = BarcodeEventModel.objects.get_or_create(event=event)

            if not barcode.barcode:
                barcode.save()  # This will trigger QR code generation

            return Response({
                'message': 'QR code generated successfully',
                'barcode': BarcodeEventSerializer(barcode).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def toggle_qr(self, request, pk=None):
        """Toggle QR code open/close"""
        event = self.get_object()

        # Check permission
        if not (request.user.is_staff or event.owned_by == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            barcode = get_object_or_404(BarcodeEventModel, event=event)
            barcode.is_open = not barcode.is_open
            barcode.save()

            status_text = 'opened' if barcode.is_open else 'closed'

            return Response({
                'message': f'QR code {status_text} successfully',
                'barcode': BarcodeEventSerializer(barcode).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_in_attendee(request):
    """Check-in attendee using QR code"""
    nonce = request.data.get('nonce')

    if not nonce:
        return Response(
            {'error': 'QR code nonce is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Find event by nonce
        event = get_object_or_404(EventModel, nonce=nonce)

        # Check if QR code is open
        try:
            barcode = BarcodeEventModel.objects.get(event=event)
            if not barcode.is_open:
                return Response(
                    {'error': 'QR code is not open for check-in'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except BarcodeEventModel.DoesNotExist:
            return Response(
                {'error': 'QR code not generated for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find registration for current user
        try:
            registration = RegistrantModel.objects.get(
                event=event,
                attendance=request.user
            )
        except RegistrantModel.DoesNotExist:
            return Response(
                {'error': 'Not registered for this event'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark attendance
        registration.mark_attendance()

        return Response({
            'message': 'Check-in successful',
            'event': event.title,
            'attendee': request.user.get_full_name(),
            'certificate_number': registration.certificate_number,
            'check_in_time': registration.attendance_time
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def download_certificate(request, event_id):
    """Download event certificate"""
    try:
        event = get_object_or_404(EventModel, id=event_id)

        # Find registration
        try:
            registration = RegistrantModel.objects.get(
                event=event,
                attendance=request.user,
                is_attendance=True
            )
        except RegistrantModel.DoesNotExist:
            return Response(
                {'error': 'Certificate not available. Please check-in first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate certificate image
        certificate_image = generate_certificate_image(registration)

        # Return image as response
        response = HttpResponse(certificate_image, content_type='image/jpeg')
        response['Content-Disposition'] = f'attachment; filename="certificate_{event.slug}.jpg"'

        return response

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

def generate_certificate_image(registration):
    """Generate certificate image"""
    from PIL import Image, ImageDraw, ImageFont
    from io import BytesIO
    from django.conf import settings

    # Load certificate template
    template_path = settings.BASE_DIR / 'static' / 'images' / 'certificate_template.jpg'

    try:
        # Open template
        img = Image.open(template_path)
        draw = ImageDraw.Draw(img)

        # Load fonts (use default fonts if custom fonts not available)
        try:
            title_font = ImageFont.truetype("arial.ttf", 48)
            name_font = ImageFont.truetype("arial.ttf", 36)
            detail_font = ImageFont.truetype("arial.ttf", 24)
        except:
            title_font = ImageFont.load_default()
            name_font = ImageFont.load_default()
            detail_font = ImageFont.load_default()

        # Draw text
        event = registration.event
        attendee_name = registration.attendance.get_full_name()

        # Event title
        draw.text((400, 200), event.title, font=title_font, fill='black')

        # Attendee name
        draw.text((400, 300), attendee_name, font=name_font, fill='black')

        # Event details
        draw.text((400, 400), f"Date: {event.date.strftime('%d %B %Y')}", font=detail_font, fill='black')
        draw.text((400, 430), f"Venue: {event.venue}", font=detail_font, fill='black')

        # Certificate number
        draw.text((400, 500), f"Certificate No: {registration.certificate_number}", font=detail_font, fill='black')

        # Save to BytesIO
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=90)

        return buffer.getvalue()

    except Exception as e:
        # If template not found, create simple certificate
        img = Image.new('RGB', (1200, 800), 'white')
        draw = ImageDraw.Draw(img)

        # Simple certificate layout
        draw.text((100, 200), "CERTIFICATE OF PARTICIPATION", fill='black')
        draw.text((100, 300), f"This certifies that", fill='black')
        draw.text((100, 350), registration.attendance.get_full_name(), fill='black')
        draw.text((100, 400), f"has participated in", fill='black')
        draw.text((100, 450), registration.event.title, fill='black')
        draw.text((100, 500), f"on {registration.event.date.strftime('%d %B %Y')}", fill='black')
        draw.text((100, 550), f"Certificate No: {registration.certificate_number}", fill='black')

        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=90)

        return buffer.getvalue()
```

#### 3.5 Event URLs
**apps/event/urls.py:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet)

app_name = 'event'

urlpatterns = [
    path('', include(router.urls)),

    # Additional endpoints
    path('check-in/', views.check_in_attendee, name='check_in_attendee'),
    path('certificate/<int:event_id>/', views.download_certificate, name='download_certificate'),
]
```

#### 3.6 Update Main URLs
**core/urls.py:**
```python
# Add to urlpatterns
urlpatterns += [
    path('api/event/', include('apps.event.urls')),
]
```

#### 3.7 Event Admin Configuration
**apps/event/admin.py:**
```python
from django.contrib import admin
from .models import EventModel, RegistrantModel, BarcodeEventModel

@admin.register(EventModel)
class EventModelAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'date', 'venue', 'is_free', 'price',
        'is_registration_close', 'is_done', 'attendee_count'
    ]
    list_filter = [
        'is_free', 'level', 'is_registration_close',
        'is_done', 'created_at'
    ]
    search_fields = ['title', 'venue', 'description']
    date_hierarchy = 'date'
    readonly_fields = ['nonce', 'created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'date', 'venue')
        }),
        ('Pricing', {
            'fields': ('is_free', 'price', 'level')
        }),
        ('Status', {
            'fields': ('is_registration_close', 'is_list_attendees', 'is_done', 'is_active')
        }),
        ('Media', {
            'fields': ('main_image',)
        }),
        ('Relations', {
            'fields': ('owned_by', 'references', 'medias', 'surveys')
        }),
        ('System', {
            'fields': ('nonce', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def attendee_count(self, obj):
        return obj.registrants.filter(is_attendance=True).count()
    attendee_count.short_description = 'Attendees'

@admin.register(RegistrantModel)
class RegistrantModelAdmin(admin.ModelAdmin):
    list_display = [
        'attendee', 'event', 'is_attendance',
        'certificate_number', 'published_at'
    ]
    list_filter = [
        'is_attendance', 'published_at', 'event__date'
    ]
    search_fields = [
        'attendance__first_name', 'attendance__last_name',
        'attendance__email', 'event__title'
    ]
    date_hierarchy = 'published_at'
    readonly_fields = ['published_at', 'certificate_number']

@admin.register(BarcodeEventModel)
class BarcodeEventModelAdmin(admin.ModelAdmin):
    list_display = ['event', 'is_open']
    list_filter = ['is_open']
    readonly_fields = ['barcode']
```

#### 3.8 Testing Event Management

**Test Event Creation:**
```bash
curl -X POST http://localhost:8000/api/event/events/ \
  -H "Authorization: Token your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event 2024",
    "description": "This is a test event",
    "date": "2024-12-31T10:00:00Z",
    "venue": "Test Venue",
    "is_free": false,
    "price": "500000.00",
    "level": "member"
  }'
```

**Test Event Registration:**
```bash
curl -X POST http://localhost:8000/api/event/events/1/register/ \
  -H "Authorization: Token your_token_here"
```

**Test QR Code Generation:**
```bash
curl -X POST http://localhost:8000/api/event/events/1/generate_qr/ \
  -H "Authorization: Token your_token_here"
```

### ✅ Phase 3 Completion Criteria
- [ ] Event CRUD operations working
- [ ] Event registration system functional
- [ ] QR code generation working
- [ ] Certificate generation working
- [ ] Event status management implemented
- [ ] Admin interface configured
- [ ] API endpoints tested with Postman/curl
- [ ] Event filtering and search working

---

## 🏢 PHASE 4: COMPANY & MEMBER MANAGEMENT
**Timeline: 5-6 hari | Developer: 1 Backend**

### 🎯 Objectives
- Membuat company management system
- Implementasi member invitation system
- PIC (Person In Charge) management
- Company member roles and permissions
- Company-specific event management

### 📋 Checklist
- [ ] Company model creation
- [ ] Company CRUD API endpoints
- [ ] Member invitation system
- [ ] PIC assignment and management
- [ ] Company member roles
- [ ] VA number management for companies
- [ ] Admin interface for companies
- [ ] Company-specific features

### 🔧 Step-by-Step Implementation

#### 4.1 Company Model
**apps/company/models.py:**
```python
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from apps.common.models import FileModel

User = get_user_model()

class CompanyModel(models.Model):
    """Company Model for TMC member companies"""

    display_name = models.CharField(
        max_length=255,
        verbose_name="Company Name"
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        verbose_name="Slug"
    )
    address = models.TextField(
        verbose_name="Address"
    )
    city = models.CharField(
        max_length=100,
        verbose_name="City"
    )
    contact = models.CharField(
        max_length=100,
        verbose_name="Contact Person"
    )
    email = models.EmailField(
        verbose_name="Company Email"
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Phone Number"
    )
    website = models.URLField(
        blank=True,
        verbose_name="Website"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    main_image = models.ForeignKey(
        FileModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='company_main_image',
        verbose_name="Company Logo"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_companies',
        verbose_name="Created By"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'company_companymodel'
        ordering = ['display_name']
        verbose_name = "Company"
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.display_name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)

    def generate_unique_slug(self):
        """Generate unique slug from display name"""
        base_slug = slugify(self.display_name)
        slug = base_slug
        counter = 1

        while CompanyModel.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    @property
    def member_count(self):
        """Get total number of members"""
        return self.members.count()

    @property
    def pic_count(self):
        """Get number of PIC members"""
        return self.members.filter(is_pic=True).count()

    @property
    def active_events(self):
        """Get number of active events for this company"""
        from apps.event.models import EventModel
        return EventModel.objects.filter(
            owned_by__in=self.members.filter(is_pic=True).values('user'),
            is_active=True,
            date__gte=timezone.now()
        ).count()

class CompanyMemberModel(models.Model):
    """Company Member Model for managing company memberships"""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='company_membership',
        verbose_name="User"
    )
    company = models.ForeignKey(
        CompanyModel,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name="Company"
    )
    is_pic = models.BooleanField(
        default=False,
        verbose_name="Is PIC"
    )
    position = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Position"
    )
    department = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Department"
    )
    transaction_number = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Transaction Number (VA)"
    )
    invited_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invited_members',
        verbose_name="Invited By"
    )
    invited_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Invited At"
    )
    joined_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Joined At"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )

    class Meta:
        db_table = 'company_companymembermodel'
        unique_together = ['user', 'company']
        verbose_name = "Company Member"
        verbose_name_plural = "Company Members"

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.company.display_name}"

    def accept_invitation(self):
        """Accept company invitation"""
        if not self.joined_at:
            self.joined_at = timezone.now()
            self.save()

    def make_pic(self):
        """Promote to PIC"""
        self.is_pic = True
        self.save()

    def remove_pic(self):
        """Remove PIC status"""
        self.is_pic = False
        self.save()

class CompanyInvitationModel(models.Model):
    """Company Invitation Model for tracking invitations"""

    email = models.EmailField(
        verbose_name="Email"
    )
    company = models.ForeignKey(
        CompanyModel,
        on_delete=models.CASCADE,
        related_name='invitations',
        verbose_name="Company"
    )
    invited_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_invitations',
        verbose_name="Invited By"
    )
    is_pic = models.BooleanField(
        default=False,
        verbose_name="Invite as PIC"
    )
    invitation_token = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="Invitation Token"
    )
    is_accepted = models.BooleanField(
        default=False,
        verbose_name="Accepted"
    )
    is_expired = models.BooleanField(
        default=False,
        verbose_name="Expired"
    )
    accepted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Accepted At"
    )
    expires_at = models.DateTimeField(
        verbose_name="Expires At"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'company_companyinvitationmodel'
        unique_together = ['email', 'company']
        verbose_name = "Company Invitation"
        verbose_name_plural = "Company Invitations"

    def __str__(self):
        return f"Invitation: {self.email} - {self.company.display_name}"

    def save(self, *args, **kwargs):
        if not self.invitation_token:
            self.invitation_token = self.generate_token()
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)

    def generate_token(self):
        """Generate unique invitation token"""
        import uuid
        return str(uuid.uuid4())

    def is_valid(self):
        """Check if invitation is valid"""
        return not self.is_accepted and not self.is_expired and self.expires_at > timezone.now()

    def accept(self, user):
        """Accept invitation"""
        if self.is_valid():
            self.is_accepted = True
            self.accepted_at = timezone.now()
            self.save()

            # Create company member
            member = CompanyMemberModel.objects.create(
                user=user,
                company=self.company,
                is_pic=self.is_pic,
                invited_by=self.invited_by
            )
            member.accept_invitation()

            return member
        return None

    def expire(self):
        """Mark invitation as expired"""
        self.is_expired = True
        self.save()
```

#### 4.2 Company Serializers
**apps/company/serializers.py:**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CompanyModel, CompanyMemberModel, CompanyInvitationModel
from apps.common.models import FileModel

User = get_user_model()

class CompanyListSerializer(serializers.ModelSerializer):
    """Serializer for company list view"""
    member_count = serializers.ReadOnlyField()
    pic_count = serializers.ReadOnlyField()
    active_events = serializers.ReadOnlyField()
    logo_url = serializers.ImageField(source='main_image.image', read_only=True)

    class Meta:
        model = CompanyModel
        fields = [
            'id', 'display_name', 'slug', 'city', 'email',
            'member_count', 'pic_count', 'active_events', 'logo_url',
            'created_at'
        ]

class CompanyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for company"""
    member_count = serializers.ReadOnlyField()
    pic_count = serializers.ReadOnlyField()
    active_events = serializers.ReadOnlyField()
    owner_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    # Related objects
    main_image = FileSerializer(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = CompanyModel
        fields = [
            'id', 'display_name', 'slug', 'address', 'city', 'contact',
            'email', 'phone', 'website', 'description', 'main_image',
            'member_count', 'pic_count', 'active_events', 'owner_name',
            'created_at', 'updated_at', 'members'
        ]

    def get_members(self, obj):
        """Get company members"""
        members = obj.members.filter(is_active=True)
        return CompanyMemberSerializer(members, many=True).data

class CompanyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating companies"""

    class Meta:
        model = CompanyModel
        fields = [
            'display_name', 'address', 'city', 'contact', 'email',
            'phone', 'website', 'description', 'main_image'
        ]

    def validate_email(self, value):
        """Validate email uniqueness"""
        if CompanyModel.objects.filter(email=value).exists():
            if self.instance and self.instance.email == value:
                return value
            raise serializers.ValidationError("Company with this email already exists")
        return value

class CompanyMemberSerializer(serializers.ModelSerializer):
    """Serializer for company members"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)

    class Meta:
        model = CompanyMemberModel
        fields = [
            'id', 'user_name', 'user_email', 'is_pic', 'position',
            'department', 'transaction_number', 'invited_by_name',
            'invited_at', 'joined_at', 'is_active'
        ]

class CompanyInvitationSerializer(serializers.ModelSerializer):
    """Serializer for company invitations"""
    inviter_name = serializers.CharField(source='invited_by.get_full_name', read_only=True)
    company_name = serializers.CharField(source='company.display_name', read_only=True)

    class Meta:
        model = CompanyInvitationModel
        fields = [
            'id', 'email', 'company_name', 'inviter_name', 'is_pic',
            'is_accepted', 'is_expired', 'accepted_at', 'expires_at',
            'created_at'
        ]
        read_only_fields = ['invitation_token']

class InviteMemberSerializer(serializers.Serializer):
    """Serializer for inviting company members"""
    email = serializers.EmailField()
    is_pic = serializers.BooleanField(default=False)
    position = serializers.CharField(max_length=100, required=False)
    department = serializers.CharField(max_length=100, required=False)

    def validate_email(self, value):
        """Validate email"""
        # Check if user exists
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist")
        return value

class SetVaNumberSerializer(serializers.Serializer):
    """Serializer for setting VA number"""
    email = serializers.EmailField()
    transaction_number = models.CharField(max_length=255)

    def validate_transaction_number(self, value):
        """Validate transaction number format"""
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError("Invalid transaction number format")
        return value
```

#### 4.3 Company Views
**apps/company/views.py:**
```python
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import CompanyModel, CompanyMemberModel, CompanyInvitationModel
from .serializers import (
    CompanyListSerializer, CompanyDetailSerializer, CompanyCreateUpdateSerializer,
    CompanyMemberSerializer, CompanyInvitationSerializer,
    InviteMemberSerializer, SetVaNumberSerializer
)

User = get_user_model()

class CompanyViewSet(viewsets.ModelViewSet):
    """Company ViewSet for CRUD operations"""

    queryset = CompanyModel.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['city', 'created_by']
    search_fields = ['display_name', 'email', 'city']
    ordering_fields = ['display_name', 'created_at']
    ordering = ['display_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return CompanyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CompanyCreateUpdateSerializer
        else:
            return CompanyDetailSerializer

    def perform_create(self, serializer):
        """Set company owner to current user"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """Invite member to company"""
        company = self.get_object()

        # Check permission (PIC or admin)
        if not (request.user.is_staff or self._is_company_pic(request.user, company)):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            serializer = InviteMemberSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            email = serializer.validated_data['email']
            is_pic = serializer.validated_data['is_pic']
            position = serializer.validated_data.get('position', '')
            department = serializer.validated_data.get('department', '')

            # Get user
            user = get_object_or_404(User, email=email)

            # Check if already member
            if CompanyMemberModel.objects.filter(user=user, company=company).exists():
                return Response(
                    {'error': 'User is already a member of this company'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if already invited
            if CompanyInvitationModel.objects.filter(
                email=email,
                company=company,
                is_accepted=False,
                is_expired=False
            ).exists():
                return Response(
                    {'error': 'User already has a pending invitation'},
                    status=status.HTTP_400_BAD_REQUEST
            )

            # Create invitation
            invitation = CompanyInvitationModel.objects.create(
                email=email,
                company=company,
                invited_by=request.user,
                is_pic=is_pic
            )

            # Send invitation email (future enhancement)
            self._send_invitation_email(invitation)

            return Response({
                'message': 'Invitation sent successfully',
                'invitation': CompanyInvitationSerializer(invitation).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove member from company"""
        company = self.get_object()

        # Check permission
        if not (request.user.is_staff or self._is_company_pic(request.user, company)):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            email = request.data.get('email')
            if not email:
                return Response(
                    {'error': 'Email is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find member
            member = get_object_or_404(
                CompanyMemberModel,
                user__email=email,
                company=company,
                is_active=True
            )

            # Can't remove yourself if you're the only PIC
            if member.user == request.user:
                pic_count = company.members.filter(is_pic=True, is_active=True).count()
                if pic_count <= 1:
                    return Response(
                        {'error': 'Cannot remove yourself when you are the only PIC'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Deactivate member
            member.is_active = False
            member.save()

            return Response({
                'message': 'Member removed successfully'
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def set_va(self, request, pk=None):
        """Set VA number for company member"""
        company = self.get_object()

        # Check permission
        if not (request.user.is_staff or self._is_company_pic(request.user, company)):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            serializer = SetVaNumberSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            email = serializer.validated_data['email']
            transaction_number = serializer.validated_data['transaction_number']

            # Find member
            member = get_object_or_404(
                CompanyMemberModel,
                user__email=email,
                company=company,
                is_active=True
            )

            # Set VA number
            member.transaction_number = transaction_number
            member.save()

            return Response({
                'message': 'VA number set successfully',
                'email': email,
                'transaction_number': transaction_number
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def promote_pic(self, request, pk=None):
        """Promote member to PIC"""
        company = self.get_object()

        # Check permission
        if not (request.user.is_staff or self._is_company_pic(request.user, company)):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            email = request.data.get('email')
            if not email:
                return Response(
                    {'error': 'Email is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find member
            member = get_object_or_404(
                CompanyMemberModel,
                user__email=email,
                company=company,
                is_active=True
            )

            # Promote to PIC
            member.make_pic()

            return Response({
                'message': 'Member promoted to PIC successfully',
                'email': email,
                'is_pic': True
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def demote_pic(self, request, pk=None):
        """Demote PIC to regular member"""
        company = self.get_object()

        # Check permission
        if not (request.user.is_staff or self._is_company_pic(request.user, company)):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            email = request.data.get('email')
            if not email:
                return Response(
                    {'error': 'Email is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find member
            member = get_object_or_404(
                CompanyMemberModel,
                user__email=email,
                company=company,
                is_active=True,
                is_pic=True
            )

            # Check if this is the last PIC
            pic_count = company.members.filter(is_pic=True, is_active=True).count()
            if pic_count <= 1:
                return Response(
                    {'error': 'Cannot demote the last PIC'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Demote from PIC
            member.remove_pic()

            return Response({
                'message': 'PIC demoted to regular member successfully',
                'email': email,
                'is_pic': False
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _is_company_pic(self, user, company):
        """Check if user is PIC of company"""
        return CompanyMemberModel.objects.filter(
            user=user,
            company=company,
            is_pic=True,
            is_active=True
        ).exists()

    def _send_invitation_email(self, invitation):
        """Send invitation email (future enhancement)"""
        # Implementation for sending invitation email
        # This would integrate with email service
        pass

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_companies(request):
    """Get companies for current user"""
    try:
        user = request.user

        # Get companies where user is a member
        company_memberships = CompanyMemberModel.objects.filter(
            user=user,
            is_active=True
        ).select_related('company')

        companies = []
        for membership in company_memberships:
            company_data = CompanyDetailSerializer(membership.company).data
            company_data['is_pic'] = membership.is_pic
            company_data['position'] = membership.position
            company_data['joined_at'] = membership.joined_at
            companies.append(company_data)

        return Response({
            'companies': companies,
            'total': len(companies)
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_invitation(request):
    """Accept company invitation"""
    try:
        token = request.data.get('token')
        if not token:
            return Response(
                {'error': 'Invitation token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find invitation
        invitation = get_object_or_404(CompanyInvitationModel, invitation_token=token)

        # Check if invitation is valid
        if not invitation.is_valid():
            return Response(
                {'error': 'Invitation is invalid or expired'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if invitation matches current user
        if invitation.email != request.user.email:
            return Response(
                {'error': 'This invitation is not for your account'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Accept invitation
        member = invitation.accept(request.user)

        if member:
            return Response({
                'message': 'Invitation accepted successfully',
                'company': CompanyDetailSerializer(member.company).data,
                'is_pic': member.is_pic
            })
        else:
            return Response(
                {'error': 'Failed to accept invitation'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pending_invitations(request):
    """Get pending invitations for current user"""
    try:
        user = request.user

        # Get pending invitations
        invitations = CompanyInvitationModel.objects.filter(
            email=user.email,
            is_accepted=False,
            is_expired=False,
            expires_at__gt=timezone.now()
        ).select_related('company', 'invited_by')

        serializer = CompanyInvitationSerializer(invitations, many=True)

        return Response({
            'invitations': serializer.data,
            'total': len(invitations)
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
```

#### 4.4 Company URLs
**apps/company/urls.py:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'companies', views.CompanyViewSet)

app_name = 'company'

urlpatterns = [
    path('', include(router.urls)),

    # Additional endpoints
    path('my-companies/', views.my_companies, name='my_companies'),
    path('accept-invitation/', views.accept_invitation, name='accept_invitation'),
    path('pending-invitations/', views.pending_invitations, name='pending_invitations'),
]
```

#### 4.5 Update Main URLs
**core/urls.py:**
```python
# Add to urlpatterns
urlpatterns += [
    path('api/company/', include('apps.company.urls')),
]
```

#### 4.6 Testing Company Management

**Test Company Creation:**
```bash
curl -X POST http://localhost:8000/api/company/companies/ \
  -H "Authorization: Token your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "PT Test Company",
    "address": "Jl. Test Address No. 123",
    "city": "Jakarta",
    "contact": "John Doe",
    "email": "contact@testcompany.com",
    "phone": "021-12345678",
    "description": "This is a test company"
  }'
```

**Test Member Invitation:**
```bash
curl -X POST http://localhost:8000/api/company/companies/1/invite/ \
  -H "Authorization: Token your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "is_pic": false,
    "position": "Software Engineer"
  }'
```

### ✅ Phase 4 Completion Criteria
- [ ] Company CRUD operations working
- [ ] Member invitation system functional
- [ ] PIC management implemented
- [ ] VA number assignment working
- [ ] Company member roles working
- [ ] Admin interface configured
- [ ] API endpoints tested
- [ ] Permission system working

---

## 💳 PHASE 5: PAYMENT & TRANSACTION SYSTEM
**Timeline: 6-7 hari | Developer: 1 Backend**

### 🎯 Objectives
- Implementasi invoice system
- Payment gateway integration
- Transaction management
- Payment status tracking
- Invoice generation and numbering

### 📋 Checklist
- [ ] Invoice model creation
- [ ] Invoice item model
- [ ] Payment status management
- [ ] Faspay integration
- [ ] Payment callbacks
- [ ] Transaction history
- [ ] Admin interface for transactions
- [ ] Payment notifications

### 🔧 Step-by-Step Implementation

#### 5.1 Transaction Models
**apps/transaction/models.py:**
```python
import uuid
import time
import base36
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone

User = get_user_model()

class Invoice(models.Model):
    """Invoice Model for tracking payments"""

    STATUS_CHOICES = [
        (101, 'Pending'),
        (102, 'Cancel'),
        (201, 'Success'),
        (202, 'Failed'),
        (203, 'Refund'),
    ]

    PAYMENT_CHANNEL_CHOICES = [
        ('bca_va', 'BCA Virtual Account'),
        ('bni_va', 'BNI Virtual Account'),
        ('mandiri_va', 'Mandiri Virtual Account'),
        ('cimb_va', 'CIMB Virtual Account'),
        ('credit_card', 'Credit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('ewallet', 'E-Wallet'),
    ]

    trx_id = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="Transaction ID"
    )
    number = models.CharField(
        max_length=255,
        unique=True,
        editable=False,
        verbose_name="Invoice Number"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='invoices',
        verbose_name="User"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Amount"
    )
    status = models.IntegerField(
        choices=STATUS_CHOICES,
        default=101,
        verbose_name="Status"
    )
    status_desc = models.CharField(
        max_length=255,
        verbose_name="Status Description"
    )
    payment_channel = models.CharField(
        max_length=50,
        choices=PAYMENT_CHANNEL_CHOICES,
        null=True,
        blank=True,
        verbose_name="Payment Channel"
    )
    no_va = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Virtual Account Number"
    )
    expiry_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Expiry Date"
    )
    log = models.JSONField(
        default=dict,
        null=True,
        blank=True,
        verbose_name="Transaction Log"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'transaction_invoice'
        ordering = ['-created_at']
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"

    def __str__(self):
        return f"Invoice {self.number} - {self.user.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.trx_id:
            self.trx_id = str(uuid.uuid4())
        if not self.number:
            self.number = self.create_number()

        # Set expiry date if not set
        if not self.expiry_date:
            self.expiry_date = timezone.now() + timezone.timedelta(days=1)

        super().save(*args, **kwargs)

    @classmethod
    def create_number(cls):
        """Generate unique invoice number"""
        timestamp = int(time.time() * 1000)
        return f"I{base36.dumps(timestamp).upper()}"

    def get_formatted_amount(self):
        """Format amount to Indonesian Rupiah"""
        return f"Rp {self.amount:,.0f}".replace(',', '.')

    def get_items(self):
        """Get all invoice items"""
        return self.items.all()

    def get_total_amount(self):
        """Get total amount from items"""
        total = sum(item.get_total_amount() for item in self.items.all())
        return total

    def is_expired(self):
        """Check if invoice is expired"""
        if not self.expiry_date:
            return False
        return timezone.now() > self.expiry_date

    def can_be_paid(self):
        """Check if invoice can be paid"""
        return self.status == 101 and not self.is_expired()

    def mark_as_success(self, payment_channel=None):
        """Mark invoice as paid"""
        self.status = 201
        self.status_desc = "Payment Successful"
        if payment_channel:
            self.payment_channel = payment_channel
        self.save()

    def mark_as_failed(self, reason="Payment Failed"):
        """Mark invoice as failed"""
        self.status = 202
        self.status_desc = reason
        self.save()

    def mark_as_cancelled(self, reason="Cancelled"):
        """Mark invoice as cancelled"""
        self.status = 102
        self.status_desc = reason
        self.save()

class InvoiceItem(models.Model):
    """Invoice Item Model"""

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Invoice"
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        verbose_name="Content Type"
    )
    object_id = models.PositiveIntegerField(
        verbose_name="Object ID"
    )
    content_object = GenericForeignKey(
        'content_type', 'object_id'
    )
    item_name = models.CharField(
        max_length=255,
        verbose_name="Item Name"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Amount"
    )
    qty = models.IntegerField(
        default=1,
        verbose_name="Quantity"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'transaction_invoiceitem'
        verbose_name = "Invoice Item"
        verbose_name_plural = "Invoice Items"

    def __str__(self):
        return f"{self.item_name} - {self.invoice.number}"

    def get_total_amount(self):
        """Calculate total amount (qty * amount)"""
        return self.amount * self.qty

    def get_type_item(self):
        """Get type of item"""
        return self.content_type.model

class PaymentCallback(models.Model):
    """Payment Callback Model for tracking payment notifications"""

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='callbacks',
        verbose_name="Invoice"
    )
    gateway = models.CharField(
        max_length=50,
        verbose_name="Payment Gateway"
    )
    transaction_id = models.CharField(
        max_length=255,
        verbose_name="Gateway Transaction ID"
    )
    status = models.CharField(
        max_length=50,
        verbose_name="Callback Status"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Amount"
    )
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Payment Date"
    )
    raw_data = models.JSONField(
        default=dict,
        verbose_name="Raw Callback Data"
    )
    processed = models.BooleanField(
        default=False,
        verbose_name="Processed"
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Processed At"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'transaction_paymentcallback'
        ordering = ['-created_at']
        verbose_name = "Payment Callback"
        verbose_name_plural = "Payment Callbacks"

    def __str__(self):
        return f"Callback {self.transaction_id} - {self.invoice.number}"

    def process(self):
        """Process payment callback"""
        if not self.processed:
            # Update invoice status based on callback
            if self.status.lower() in ['success', 'paid', 'completed']:
                self.invoice.mark_as_success(self.gateway)
            elif self.status.lower() in ['failed', 'rejected', 'cancelled']:
                self.invoice.mark_as_failed(f"Payment {self.status}")

            self.processed = True
            self.processed_at = timezone.now()
            self.save()

            # Send payment notification (future enhancement)
            self._send_payment_notification()

    def _send_payment_notification(self):
        """Send payment notification (future enhancement)"""
        # Implementation for sending payment notification
        pass
```

#### 5.2 Transaction Serializers
**apps/transaction/serializers.py:**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from .models import Invoice, InvoiceItem, PaymentCallback

User = get_user_model()

class InvoiceItemSerializer(serializers.ModelSerializer):
    """Serializer for invoice items"""
    item_type = serializers.CharField(source='get_type_item', read_only=True)
    total_amount = serializers.DecimalField(
        source='get_total_amount',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'item_name', 'description', 'amount', 'qty',
            'item_type', 'total_amount', 'created_at'
        ]

class InvoiceListSerializer(serializers.ModelSerializer):
    """Serializer for invoice list view"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    formatted_amount = serializers.CharField(source='get_formatted_amount', read_only=True)
    is_expired = serializers.BooleanField(source='is_expired', read_only=True)
    can_be_paid = serializers.BooleanField(source='can_be_paid', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'number', 'trx_id', 'user_name', 'amount',
            'formatted_amount', 'status', 'status_desc',
            'payment_channel', 'is_expired', 'can_be_paid',
            'expiry_date', 'created_at'
        ]

class InvoiceDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for invoice"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    formatted_amount = serializers.CharField(source='get_formatted_amount', read_only=True)
    is_expired = serializers.BooleanField(source='is_expired', read_only=True)
    can_be_paid = serializers.BooleanField(source='can_be_paid', read_only=True)
    total_amount = serializers.DecimalField(
        source='get_total_amount',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    # Related objects
    items = InvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'number', 'trx_id', 'user_name', 'user_email',
            'amount', 'formatted_amount', 'total_amount',
            'status', 'status_desc', 'payment_channel',
            'no_va', 'expiry_date', 'is_expired', 'can_be_paid',
            'log', 'items', 'created_at', 'updated_at'
        ]

class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices"""
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )

    class Meta:
        model = Invoice
        fields = ['user', 'amount', 'expiry_date', 'items']

    def validate_amount(self, value):
        """Validate amount"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def create(self, validated_data):
        """Create invoice with items"""
        items_data = validated_data.pop('items', [])

        # Create invoice
        invoice = Invoice.objects.create(**validated_data)

        # Create invoice items
        for item_data in items_data:
            # Get content type
            content_type = ContentType.objects.get(
                model=item_data.get('content_type', 'event')
            )

            InvoiceItem.objects.create(
                invoice=invoice,
                content_type=content_type,
                object_id=item_data.get('object_id'),
                item_name=item_data.get('item_name'),
                description=item_data.get('description', ''),
                amount=item_data.get('amount'),
                qty=item_data.get('qty', 1)
            )

        return invoice

class PaymentMethodSerializer(serializers.Serializer):
    """Serializer for setting payment method"""
    payment_method_id = models.CharField(max_length=50)

class PaymentCallbackSerializer(serializers.ModelSerializer):
    """Serializer for payment callbacks"""

    class Meta:
        model = PaymentCallback
        fields = [
            'gateway', 'transaction_id', 'status', 'amount',
            'payment_date', 'raw_data'
        ]
```

#### 5.3 Transaction Views
**apps/transaction/views.py:**
```python
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Invoice, InvoiceItem, PaymentCallback
from .serializers import (
    InvoiceListSerializer, InvoiceDetailSerializer, InvoiceCreateSerializer,
    PaymentMethodSerializer, PaymentCallbackSerializer
)

User = get_user_model()

class InvoiceViewSet(viewsets.ModelViewSet):
    """Invoice ViewSet for CRUD operations"""

    queryset = Invoice.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'payment_channel', 'user']
    search_fields = ['number', 'trx_id', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at', 'amount', 'number']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        elif self.action == 'create':
            return InvoiceCreateSerializer
        else:
            return InvoiceDetailSerializer

    def get_queryset(self):
        """Filter invoices based on user permissions"""
        user = self.request.user
        queryset = super().get_queryset()

        # Admin can see all invoices
        if user.is_staff:
            return queryset

        # Regular users can only see their own invoices
        return queryset.filter(user=user)

    @action(detail=True, methods=['post'])
    def payment_method(self, request, pk=None):
        """Set payment method for invoice"""
        invoice = self.get_object()

        # Check permission
        if not (request.user.is_staff or invoice.user == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            serializer = PaymentMethodSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            payment_method_id = serializer.validated_data['payment_method_id']

            # Map payment method to VA number from company
            if payment_method_id.endswith('_va'):
                va_number = self._get_company_va_number(invoice.user, payment_method_id)
                if va_number:
                    invoice.no_va = va_number
                    invoice.payment_channel = payment_method_id.replace('_', ' ').title()
                    invoice.save()

                    return Response({
                        'message': 'Payment method set successfully',
                        'invoice': InvoiceDetailSerializer(invoice).data
                    })
                else:
                    return Response(
                        {'error': 'VA number not available for this payment method'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # For other payment methods (credit card, etc.)
                invoice.payment_channel = payment_method_id
                invoice.save()

                return Response({
                    'message': 'Payment method set successfully',
                    'invoice': InvoiceDetailSerializer(invoice).data
                })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel invoice"""
        invoice = self.get_object()

        # Check permission
        if not (request.user.is_staff or invoice.user == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if invoice can be cancelled
        if invoice.status != 101:
            return Response(
                {'error': 'Invoice cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            reason = request.data.get('reason', 'Cancelled by user')
            invoice.mark_as_cancelled(reason)

            return Response({
                'message': 'Invoice cancelled successfully',
                'invoice': InvoiceDetailSerializer(invoice).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def resend_notification(self, request, pk=None):
        """Resend payment notification"""
        invoice = self.get_object()

        # Check permission
        if not (request.user.is_staff or invoice.user == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Send payment notification (future enhancement)
            self._send_payment_notification(invoice)

            return Response({
                'message': 'Payment notification sent successfully'
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _get_company_va_number(self, user, payment_method):
        """Get VA number from user's company"""
        try:
            from apps.company.models import CompanyMemberModel

            # Get user's company membership
            membership = CompanyMemberModel.objects.filter(
                user=user,
                is_active=True
            ).first()

            if membership and membership.transaction_number:
                return membership.transaction_number

            return None

        except Exception:
            return None

    def _send_payment_notification(self, invoice):
        """Send payment notification (future enhancement)"""
        # Implementation for sending payment notification
        pass

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def payment_callback(request):
    """Handle payment gateway callback"""
    try:
        # Get gateway from request
        gateway = request.data.get('gateway', 'unknown')
        transaction_id = request.data.get('transaction_id')
        invoice_number = request.data.get('invoice_number')
        status = request.data.get('status')
        amount = request.data.get('amount')

        if not all([transaction_id, invoice_number, status, amount]):
            return Response(
                {'error': 'Missing required callback data'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find invoice
        invoice = get_object_or_404(Invoice, number=invoice_number)

        # Create callback record
        callback = PaymentCallback.objects.create(
            invoice=invoice,
            gateway=gateway,
            transaction_id=transaction_id,
            status=status,
            amount=amount,
            payment_date=timezone.now(),
            raw_data=request.data
        )

        # Process callback
        callback.process()

        return Response({
            'message': 'Callback processed successfully',
            'callback_id': callback.id
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transaction_summary(request):
    """Get transaction summary for user"""
    try:
        user = request.user

        # Get user's invoices
        invoices = Invoice.objects.filter(user=user)

        # Calculate summary
        total_invoices = invoices.count()
        pending_invoices = invoices.filter(status=101).count()
        successful_invoices = invoices.filter(status=201).count()
        failed_invoices = invoices.filter(status=202).count()
        cancelled_invoices = invoices.filter(status=102).count()

        total_amount = sum(invoice.amount for invoice in invoices.filter(status=201))
        pending_amount = sum(invoice.amount for invoice in invoices.filter(status=101))

        return Response({
            'summary': {
                'total_invoices': total_invoices,
                'pending_invoices': pending_invoices,
                'successful_invoices': successful_invoices,
                'failed_invoices': failed_invoices,
                'cancelled_invoices': cancelled_invoices,
                'total_amount': total_amount,
                'pending_amount': pending_amount
            },
            'recent_transactions': InvoiceListSerializer(
                invoices.order_by('-created_at')[:5],
                many=True
            ).data
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
```

#### 4.5 Transaction URLs
**apps/transaction/urls.py:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'transactions', views.InvoiceViewSet)

app_name = 'transaction'

urlpatterns = [
    path('', include(router.urls)),

    # Additional endpoints
    path('payment-callback/', views.payment_callback, name='payment_callback'),
    path('summary/', views.transaction_summary, name='transaction_summary'),
]
```

#### 4.6 Update Main URLs
**core/urls.py:**
```python
# Add to urlpatterns
urlpatterns += [
    path('api/transaction/', include('apps.transaction.urls')),
]
```

### ✅ Phase 5 Completion Criteria
- [ ] Invoice CRUD operations working
- [ ] Payment method selection functional
- [ ] VA number assignment working
- [ ] Payment callbacks handled
- [ ] Transaction history available
- [ ] Admin interface configured
- [ ] API endpoints tested
- [ ] Payment notifications working

---

## 📝 PHASE 6: CONTENT MANAGEMENT (BLOG)
**Timeline: 4-5 hari | Developer: 1 Backend**

### 🎯 Objectives
- Implementasi blog management system
- Rich text content creation
- Media management for blogs
- SEO-friendly URLs with slugs
- Content publishing workflow

### 📋 Checklist
- [ ] Blog model creation
- [ ] Blog CRUD API endpoints
- [ ] Rich text editor integration
- [ ] Media management for blogs
- [ ] SEO optimization (slugs, meta)
- [ ] Blog categories and tags
- [ ] Admin interface for blogs
- [ ] Blog commenting system (optional)

### 🔧 Step-by-Step Implementation

#### 6.1 Blog Model
**apps/blog/models.py:**
```python
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from django.conf import settings
from apps.common.models import FileModel

User = get_user_model()

class BlogCategory(models.Model):
    """Blog Category Model"""

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Category Name"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        verbose_name="Slug"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'blog_blogcategory'
        ordering = ['name']
        verbose_name = "Blog Category"
        verbose_name_plural = "Blog Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class BlogTag(models.Model):
    """Blog Tag Model"""

    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Tag Name"
    )
    slug = models.SlugField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name="Slug"
    )
    color = models.CharField(
        max_length=7,
        default='#007bff',
        verbose_name="Color"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'blog_blogtag'
        ordering = ['name']
        verbose_name = "Blog Tag"
        verbose_name_plural = "Blog Tags"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class BlogModel(models.Model):
    """Main Blog Model"""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(
        max_length=255,
        verbose_name="Title"
    )
    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        verbose_name="Slug"
    )
    summary = models.TextField(
        verbose_name="Summary"
    )
    content = models.TextField(
        verbose_name="Content"
    )
    meta_description = models.CharField(
        max_length=160,
        blank=True,
        verbose_name="Meta Description"
    )
    meta_keywords = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Meta Keywords"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="Status"
    )
    featured = models.BooleanField(
        default=False,
        verbose_name="Featured"
    )
    featured_image = models.ForeignKey(
        FileModel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blog_featured_image',
        verbose_name="Featured Image"
    )
    youtube_id = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="YouTube ID"
    )
    youtube_embedded = models.URLField(
        max_length=500,
        blank=True,
        verbose_name="YouTube Embedded URL"
    )
    view_count = models.PositiveIntegerField(
        default=0,
        verbose_name="View Count"
    )
    owned_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blogs',
        verbose_name="Author"
    )
    categories = models.ManyToManyField(
        BlogCategory,
        blank=True,
        verbose_name="Categories"
    )
    tags = models.ManyToManyField(
        BlogTag,
        blank=True,
        verbose_name="Tags"
    )
    albums = models.ManyToManyField(
        FileModel,
        blank=True,
        related_name='blog_albums',
        verbose_name="Album Images"
    )
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Published At"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'blog_blogmodel'
        ordering = ['-published_at', '-created_at']
        verbose_name = "Blog"
        verbose_name_plural = "Blogs"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Generate slug if not exists
        if not self.slug:
            self.slug = self.generate_unique_slug()

        # Handle YouTube URL
        if self.youtube_id and not self.youtube_embedded:
            self.youtube_embedded = f"https://www.youtube.com/embed/{self.youtube_id}"

        # Set published_at when status changes to published
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()

        super().save(*args, **kwargs)

    def generate_unique_slug(self):
        """Generate unique slug from title"""
        base_slug = slugify(self.title)
        slug = base_slug
        counter = 1

        while BlogModel.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    @property
    def is_published(self):
        """Check if blog is published"""
        return self.status == 'published'

    @property
    def reading_time(self):
        """Estimate reading time (assuming 200 words per minute)"""
        word_count = len(self.content.split())
        minutes = max(1, round(word_count / 200))
        return f"{minutes} min read"

    @property
    def excerpt(self):
        """Get excerpt from content"""
        words = self.content.split()[:50]
        return ' '.join(words) + '...' if len(words) == 50 else ' '.join(words)

    def increment_view_count(self):
        """Increment view count"""
        self.view_count += 1
        self.save(update_fields=['view_count'])

    def get_absolute_url(self):
        """Get absolute URL for blog"""
        return f"/blog/{self.slug}/"

class BlogComment(models.Model):
    """Blog Comment Model (Optional)"""

    blog = models.ForeignKey(
        BlogModel,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Blog"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='blog_comments',
        verbose_name="User"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name="Parent Comment"
    )
    comment = models.TextField(
        verbose_name="Comment"
    )
    is_approved = models.BooleanField(
        default=True,
        verbose_name="Approved"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'blog_blogcomment'
        ordering = ['created_at']
        verbose_name = "Blog Comment"
        verbose_name_plural = "Blog Comments"

    def __str__(self):
        return f"Comment by {self.user.get_full_name()} on {self.blog.title}"

    @property
    def is_reply(self):
        """Check if this is a reply"""
        return self.parent is not None

    def get_replies(self):
        """Get replies to this comment"""
        return self.replies.filter(is_approved=True)
```

#### 6.2 Blog Serializers
**apps/blog/serializers.py:**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import BlogModel, BlogCategory, BlogTag, BlogComment
from apps.common.models import FileModel

User = get_user_model()

class BlogCategorySerializer(serializers.ModelSerializer):
    """Serializer for blog categories"""

    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'created_at']

class BlogTagSerializer(serializers.ModelSerializer):
    """Serializer for blog tags"""

    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug', 'color', 'created_at']

class BlogListSerializer(serializers.ModelSerializer):
    """Serializer for blog list view"""
    author_name = serializers.CharField(source='owned_by.get_full_name', read_only=True)
    author_email = serializers.CharField(source='owned_by.email', read_only=True)
    reading_time = serializers.CharField(read_only=True)
    featured_image_url = serializers.ImageField(source='featured_image.image', read_only=True)
    category_names = serializers.StringRelatedField(source='categories', many=True, read_only=True)
    tag_names = serializers.StringRelatedField(source='tags', many=True, read_only=True)

    class Meta:
        model = BlogModel
        fields = [
            'id', 'title', 'slug', 'summary', 'status', 'featured',
            'author_name', 'author_email', 'reading_time', 'view_count',
            'featured_image_url', 'category_names', 'tag_names',
            'published_at', 'created_at'
        ]

class BlogDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for blog"""
    author_name = serializers.CharField(source='owned_by.get_full_name', read_only=True)
    author_email = serializers.CharField(source='owned_by.email', read_only=True)
    reading_time = serializers.CharField(read_only=True)
    excerpt = serializers.CharField(read_only=True)
    featured_image = FileSerializer(read_only=True)
    albums = FileSerializer(many=True, read_only=True)
    categories = BlogCategorySerializer(many=True, read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = BlogModel
        fields = [
            'id', 'title', 'slug', 'summary', 'content', 'meta_description',
            'meta_keywords', 'status', 'featured', 'reading_time', 'excerpt',
            'view_count', 'youtube_id', 'youtube_embedded',
            'author_name', 'author_email', 'featured_image', 'albums',
            'categories', 'tags', 'comment_count',
            'published_at', 'created_at', 'updated_at'
        ]

    def get_comment_count(self, obj):
        """Get comment count"""
        return obj.comments.filter(is_approved=True).count()

class BlogCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating blogs"""
    category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    album_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = BlogModel
        fields = [
            'title', 'summary', 'content', 'meta_description',
            'meta_keywords', 'status', 'featured', 'featured_image',
            'youtube_id', 'category_ids', 'tag_ids', 'album_ids'
        ]

    def create(self, validated_data):
        """Create blog with many-to-many relationships"""
        category_ids = validated_data.pop('category_ids', [])
        tag_ids = validated_data.pop('tag_ids', [])
        album_ids = validated_data.pop('album_ids', [])

        # Create blog
        blog = BlogModel.objects.create(**validated_data)

        # Add categories
        if category_ids:
            blog.categories.set(category_ids)

        # Add tags
        if tag_ids:
            blog.tags.set(tag_ids)

        # Add albums
        if album_ids:
            blog.albums.set(album_ids)

        return blog

    def update(self, instance, validated_data):
        """Update blog with many-to-many relationships"""
        category_ids = validated_data.pop('category_ids', None)
        tag_ids = validated_data.pop('tag_ids', None)
        album_ids = validated_data.pop('album_ids', None)

        # Update blog fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update categories
        if category_ids is not None:
            instance.categories.set(category_ids)

        # Update tags
        if tag_ids is not None:
            instance.tags.set(tag_ids)

        # Update albums
        if album_ids is not None:
            instance.albums.set(album_ids)

        return instance

class BlogCommentSerializer(serializers.ModelSerializer):
    """Serializer for blog comments"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = BlogComment
        fields = [
            'id', 'user_name', 'user_email', 'comment', 'is_reply',
            'is_approved', 'created_at', 'replies'
        ]
        read_only_fields = ['user', 'parent', 'is_approved']

    def get_replies(self, obj):
        """Get approved replies"""
        replies = obj.get_replies()
        return BlogCommentSerializer(replies, many=True).data

class BlogCommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating blog comments"""
    parent_id = serializers.IntegerField(
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = BlogComment
        fields = ['comment', 'parent_id']

    def create(self, validated_data):
        """Create comment"""
        parent_id = validated_data.pop('parent_id', None)

        comment = BlogComment.objects.create(
            parent_id=parent_id,
            **validated_data
        )

        return comment
```

#### 6.3 Blog Views
**apps/blog/views.py:**
```python
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import BlogModel, BlogCategory, BlogTag, BlogComment
from .serializers import (
    BlogListSerializer, BlogDetailSerializer, BlogCreateUpdateSerializer,
    BlogCategorySerializer, BlogTagSerializer,
    BlogCommentSerializer, BlogCommentCreateSerializer
)

User = get_user_model()

class BlogViewSet(viewsets.ModelViewSet):
    """Blog ViewSet for CRUD operations"""

    queryset = BlogModel.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'featured', 'categories', 'tags', 'owned_by']
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['published_at', 'created_at', 'title', 'view_count']
    ordering = ['-published_at', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BlogCreateUpdateSerializer
        else:
            return BlogDetailSerializer

    def get_queryset(self):
        """Filter blogs based on user permissions"""
        user = self.request.user
        queryset = super().get_queryset()

        # Admin can see all blogs
        if user.is_staff:
            return queryset

        # Regular users can only see published blogs and their own drafts
        if self.action == 'list':
            return queryset.filter(status='published')
        else:
            return queryset.filter(
                models.Q(status='published') | models.Q(owned_by=user)
            )

    def perform_create(self, serializer):
        """Set blog author to current user"""
        serializer.save(owned_by=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish blog"""
        blog = self.get_object()

        # Check permission
        if not (request.user.is_staff or blog.owned_by == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            blog.status = 'published'
            if not blog.published_at:
                blog.published_at = timezone.now()
            blog.save()

            return Response({
                'message': 'Blog published successfully',
                'blog': BlogDetailSerializer(blog).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive blog"""
        blog = self.get_object()

        # Check permission
        if not (request.user.is_staff or blog.owned_by == request.user):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            blog.status = 'archived'
            blog.save()

            return Response({
                'message': 'Blog archived successfully',
                'blog': BlogDetailSerializer(blog).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """Toggle featured status"""
        blog = self.get_object()

        # Check permission (admin only)
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            blog.featured = not blog.featured
            blog.save()

            status_text = 'featured' if blog.featured else 'unfeatured'

            return Response({
                'message': f'Blog {status_text} successfully',
                'blog': BlogDetailSerializer(blog).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get blog comments"""
        blog = self.get_object()

        # Get approved comments
        comments = blog.comments.filter(is_approved=True, parent=None)
        serializer = BlogCommentSerializer(comments, many=True)

        return Response({
            'blog': blog.title,
            'total_comments': comments.count(),
            'comments': serializer.data
        })

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add comment to blog"""
        blog = self.get_object()

        # Check if blog allows comments and is published
        if blog.status != 'published':
            return Response(
                {'error': 'Comments are not allowed for this blog'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            serializer = BlogCommentCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Create comment
            comment = BlogComment.objects.create(
                blog=blog,
                user=request.user,
                **serializer.validated_data
            )

            return Response({
                'message': 'Comment added successfully',
                'comment': BlogCommentSerializer(comment).data
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def retrieve(self, request, *args, **kwargs):
        """Get blog detail and increment view count"""
        instance = self.get_object()

        # Only increment view count for published blogs
        if instance.status == 'published':
            instance.increment_view_count()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def blog_by_slug(request, slug):
    """Get blog by slug"""
    try:
        blog = get_object_or_404(BlogModel, slug=slug, status='published')

        # Increment view count
        blog.increment_view_count()

        serializer = BlogDetailSerializer(blog)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def featured_blogs(request):
    """Get featured blogs"""
    try:
        blogs = BlogModel.objects.filter(
            status='published',
            featured=True
        ).order_by('-published_at')[:10]

        serializer = BlogListSerializer(blogs, many=True)

        return Response({
            'featured_blogs': serializer.data,
            'total': len(blogs)
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def popular_blogs(request):
    """Get popular blogs (by view count)"""
    try:
        blogs = BlogModel.objects.filter(
            status='published'
        ).order_by('-view_count', '-published_at')[:10]

        serializer = BlogListSerializer(blogs, many=True)

        return Response({
            'popular_blogs': serializer.data,
            'total': len(blogs)
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_blogs(request):
    """Get blogs for current user"""
    try:
        user = request.user

        # Get user's blogs
        blogs = BlogModel.objects.filter(owned_by=user)

        # Filter by status if provided
        status_filter = request.GET.get('status')
        if status_filter:
            blogs = blogs.filter(status=status_filter)

        # Apply pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size

        paginated_blogs = blogs[start:end]
        serializer = BlogListSerializer(paginated_blogs, many=True)

        return Response({
            'blogs': serializer.data,
            'total': blogs.count(),
            'page': page,
            'page_size': page_size,
            'total_pages': (blogs.count() + page_size - 1) // page_size
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

# Category and Tag views
class BlogCategoryViewSet(viewsets.ModelViewSet):
    """Blog Category ViewSet"""

    queryset = BlogCategory.objects.filter(is_active=True)
    serializer_class = BlogCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']

class BlogTagViewSet(viewsets.ModelViewSet):
    """Blog Tag ViewSet"""

    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering = ['name']
```

#### 6.4 Blog URLs
**apps/blog/urls.py:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'blogs', views.BlogViewSet)
router.register(r'categories', views.BlogCategoryViewSet)
router.register(r'tags', views.BlogTagViewSet)

app_name = 'blog'

urlpatterns = [
    path('', include(router.urls)),

    # Additional endpoints
    path('slug/<slug:slug>/', views.blog_by_slug, name='blog_by_slug'),
    path('featured/', views.featured_blogs, name='featured_blogs'),
    path('popular/', views.popular_blogs, name='popular_blogs'),
    path('my-blogs/', views.my_blogs, name='my_blogs'),
]
```

#### 6.5 Update Main URLs
**core/urls.py:**
```python
# Add to urlpatterns
urlpatterns += [
    path('api/blog/', include('apps.blog.urls')),
]
```

### ✅ Phase 6 Completion Criteria
- [ ] Blog CRUD operations working
- [ ] Rich text content creation functional
- [ ] Media management for blogs working
- [ ] SEO optimization implemented
- [ ] Blog categories and tags working
- [ ] Admin interface configured
- [ ] API endpoints tested
- [ ] Comment system working (if implemented)

---

## 📊 PHASE 7: SURVEY & FORMS
**Timeline: 5-6 hari | Developer: 1 Backend**

### 🎯 Objectives
- Implementasi dynamic form builder
- Survey creation and management
- Response collection and analysis
- Form branching logic
- Survey reporting

### 📋 Checklist
- [ ] Form builder models creation
- [ ] Question types implementation
- [ ] Survey CRUD API endpoints
- [ ] Response collection system
- [ ] Survey analytics and reporting
- [ ] Admin interface for surveys
- [ ] Export functionality
- [ ] Integration with events

### 🔧 Step-by-Step Implementation

#### 7.1 Survey Models
**apps/survey/models.py:**
```python
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
import json

User = get_user_model()

class QuestionModel(models.Model):
    """Question Model for dynamic forms"""

    QUESTION_TYPES = [
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('number', 'Number'),
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('date', 'Date'),
        ('time', 'Time'),
        ('datetime', 'Date Time'),
        ('url', 'URL'),
        ('radio', 'Radio Button'),
        ('checkbox', 'Checkbox'),
        ('select', 'Dropdown'),
        ('multiselect', 'Multi-Select'),
        ('rating', 'Rating Scale'),
        ('scale', 'Scale (1-10)'),
        ('file', 'File Upload'),
        ('image', 'Image Upload'),
    ]

    question_text = models.TextField(
        verbose_name="Question Text"
    )
    question_type = models.CharField(
        max_length=20,
        choices=QUESTION_TYPES,
        verbose_name="Question Type"
    )
    help_text = models.TextField(
        blank=True,
        verbose_name="Help Text"
    )
    is_required = models.BooleanField(
        default=False,
        verbose_name="Required"
    )
    is_other_option = models.BooleanField(
        default=False,
        verbose_name="Include 'Other' Option"
    )
    placeholder = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Placeholder"
    )
    default_value = models.TextField(
        blank=True,
        verbose_name="Default Value"
    )
    validation_rules = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Validation Rules"
    )
    settings = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Question Settings"
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='child_questions',
        verbose_name="Parent Question"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Order"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'survey_questionmodel'
        ordering = ['order', 'created_at']
        verbose_name = "Question"
        verbose_name_plural = "Questions"

    def __str__(self):
        return f"{self.question_text[:50]} ({self.get_question_type_display()})"

    def get_options(self):
        """Get question options"""
        return self.options.all()

    def has_options(self):
        """Check if question has options"""
        return self.question_type in ['radio', 'checkbox', 'select', 'multiselect']

    def validate_response(self, response_value):
        """Validate response value"""
        if self.is_required and not response_value:
            return False, "This field is required"

        # Additional validation based on question type
        if self.question_type == 'email':
            import re
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, response_value):
                return False, "Invalid email format"

        elif self.question_type == 'url':
            import re
            url_pattern = r'^https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?$'
            if not re.match(url_pattern, response_value):
                return False, "Invalid URL format"

        # Custom validation rules
        if self.validation_rules:
            # Min/max validation
            if 'min_length' in self.validation_rules:
                if len(response_value) < self.validation_rules['min_length']:
                    return False, f"Minimum length is {self.validation_rules['min_length']} characters"

            if 'max_length' in self.validation_rules:
                if len(response_value) > self.validation_rules['max_length']:
                    return False, f"Maximum length is {self.validation_rules['max_length']} characters"

            # Numeric validation
            if self.question_type in ['number', 'rating', 'scale']:
                try:
                    num_value = float(response_value)
                    if 'min_value' in self.validation_rules:
                        if num_value < self.validation_rules['min_value']:
                            return False, f"Minimum value is {self.validation_rules['min_value']}"
                    if 'max_value' in self.validation_rules:
                        if num_value > self.validation_rules['max_value']:
                            return False, f"Maximum value is {self.validation_rules['max_value']}"
                except ValueError:
                    return False, "Invalid number format"

        return True, None

class QuestionOptionModel(models.Model):
    """Question Options Model"""

    question = models.ForeignKey(
        QuestionModel,
        on_delete=models.CASCADE,
        related_name='options',
        verbose_name="Question"
    )
    option_text = models.CharField(
        max_length=255,
        verbose_name="Option Text"
    )
    option_value = models.CharField(
        max_length=255,
        verbose_name="Option Value"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Order"
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name="Default Option"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )

    class Meta:
        db_table = 'survey_questionoptionmodel'
        ordering = ['order', 'id']
        unique_together = ['question', 'option_value']
        verbose_name = "Question Option"
        verbose_name_plural = "Question Options"

    def __str__(self):
        return f"{self.question.question_text[:30]} - {self.option_text}"

class BranchOptionModel(models.Model):
    """Branch Logic Model for conditional questions"""

    parent_question = models.ForeignKey(
        QuestionModel,
        on_delete=models.CASCADE,
        related_name='branch_options',
        verbose_name="Parent Question"
    )
    parent_option = models.ForeignKey(
        QuestionOptionModel,
        on_delete=models.CASCADE,
        related_name='branch_logic',
        verbose_name="Parent Option"
    )
    child_question = models.ForeignKey(
        QuestionModel,
        on_delete=models.CASCADE,
        related_name='branch_from',
        verbose_name="Child Question"
    )
    condition = models.CharField(
        max_length=50,
        choices=[
            ('equals', 'Equals'),
            ('not_equals', 'Not Equals'),
            ('contains', 'Contains'),
            ('not_contains', 'Not Contains'),
            ('greater_than', 'Greater Than'),
            ('less_than', 'Less Than'),
        ],
        default='equals',
        verbose_name="Condition"
    )
    value = models.TextField(
        verbose_name="Condition Value"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )

    class Meta:
        db_table = 'survey_branchoptionmodel'
        unique_together = ['parent_question', 'parent_option', 'child_question']
        verbose_name = "Branch Option"
        verbose_name_plural = "Branch Options"

    def __str__(self):
        return f"If {self.parent_question.question_text[:20]} = {self.parent_option.option_text}, show {self.child_question.question_text[:20]}"

class FormBuilderModel(models.Model):
    """Form Builder Model for dynamic forms"""

    title = models.CharField(
        max_length=255,
        verbose_name="Form Title"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    questions = models.ManyToManyField(
        QuestionModel,
        through='FormQuestion',
        related_name='forms',
        verbose_name="Questions"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_forms',
        verbose_name="Created By"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    allow_multiple_submissions = models.BooleanField(
        default=False,
        verbose_name="Allow Multiple Submissions"
    )
    require_authentication = models.BooleanField(
        default=True,
        verbose_name="Require Authentication"
    )
    success_message = models.TextField(
        default="Thank you for your submission!",
        verbose_name="Success Message"
    )
    submit_button_text = models.CharField(
        max_length=50,
        default="Submit",
        verbose_name="Submit Button Text"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'survey_formbuildermodel'
        ordering = ['-created_at']
        verbose_name = "Form"
        verbose_name_plural = "Forms"

    def __str__(self):
        return self.title

    def get_ordered_questions(self):
        """Get questions in order"""
        return self.questions.filter(
            formquestion__is_active=True,
            is_active=True
        ).order_by('formquestion__order')

    def get_response_count(self):
        """Get total response count"""
        return self.responses.count()

    def can_submit(self, user=None):
        """Check if form can be submitted"""
        if not self.is_active:
            return False, "Form is not active"

        if self.require_authentication and not user:
            return False, "Authentication required"

        if not self.allow_multiple_submissions and user:
            if FormResponses.objects.filter(form=self, created_by=user).exists():
                return False, "You have already submitted this form"

        return True, None

class FormQuestion(models.Model):
    """Through model for Form-Question relationship with order"""

    form = models.ForeignKey(
        FormBuilderModel,
        on_delete=models.CASCADE,
        verbose_name="Form"
    )
    question = models.ForeignKey(
        QuestionModel,
        on_delete=models.CASCADE,
        verbose_name="Question"
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Order"
    )
    is_required_override = models.BooleanField(
        null=True,
        blank=True,
        verbose_name="Override Required"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )

    class Meta:
        db_table = 'survey_formquestion'
        ordering = ['order']
        unique_together = ['form', 'question']
        verbose_name = "Form Question"
        verbose_name_plural = "Form Questions"

    def __str__(self):
        return f"{self.form.title} - {self.question.question_text[:30]}"

class FormResponses(models.Model):
    """Form Responses Model"""

    form = models.ForeignKey(
        FormBuilderModel,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name="Form"
    )
    question = models.ForeignKey(
        QuestionModel,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name="Question"
    )
    responses = models.JSONField(
        verbose_name="Response Data"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='form_responses',
        verbose_name="Submitted By"
    )
    submission_id = models.CharField(
        max_length=255,
        verbose_name="Submission ID"
    )
    # Generic foreign key for associating with other models (e.g., Event)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Content Type"
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Object ID"
    )
    content_object = GenericForeignKey(
        'content_type', 'object_id'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )

    class Meta:
        db_table = 'survey_formresponses'
        ordering = ['-created_at']
        verbose_name = "Form Response"
        verbose_name_plural = "Form Responses"

    def __str__(self):
        return f"Response to {self.form.title} by {self.created_by.get_full_name()}"

    @property
    def response_value(self):
        """Get formatted response value"""
        question_type = self.question.question_type

        if question_type in ['radio', 'select']:
            # For single choice, return selected option
            if isinstance(self.responses, list) and self.responses:
                return self.responses[0]
            return self.responses

        elif question_type in ['checkbox', 'multiselect']:
            # For multiple choice, return list
            return self.responses if isinstance(self.responses, list) else [self.responses]

        elif question_type == 'file':
            # For file uploads, return file info
            return self.responses

        else:
            # For text-based questions, return text
            return self.responses

class SurveyAnalytics(models.Model):
    """Survey Analytics Model for aggregated data"""

    form = models.OneToOneField(
        FormBuilderModel,
        on_delete=models.CASCADE,
        related_name='analytics',
        verbose_name="Form"
    )
    total_submissions = models.PositiveIntegerField(
        default=0,
        verbose_name="Total Submissions"
    )
    last_submission_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Last Submission At"
    )
    completion_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name="Completion Rate (%)"
    )
    analytics_data = models.JSONField(
        default=dict,
        verbose_name="Analytics Data"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'survey_surveyanalytics'
        verbose_name = "Survey Analytics"
        verbose_name_plural = "Survey Analytics"

    def __str__(self):
        return f"Analytics for {self.form.title}"

    def update_analytics(self):
        """Update analytics data"""
        from django.db.models import Count

        # Update total submissions
        self.total_submissions = self.form.responses.values('created_by').distinct().count()

        # Update last submission
        last_response = self.form.responses.order_by('-created_at').first()
        if last_response:
            self.last_submission_at = last_response.created_at

        # Calculate completion rate
        total_questions = self.form.questions.count()
        if total_questions > 0:
            completed_submissions = 0
            for user in User.objects.filter(form_responses__form=self.form).distinct():
                user_responses = self.form.responses.filter(created_by=user).count()
                if user_responses >= total_questions * 0.8:  # 80% completion threshold
                    completed_submissions += 1

            if self.total_submissions > 0:
                self.completion_rate = (completed_submissions / self.total_submissions) * 100

        # Generate question analytics
        question_analytics = {}
        for question in self.form.get_ordered_questions():
            responses = self.form.responses.filter(question=question)

            if question.has_options():
                # For choice-based questions
                option_counts = {}
                for response in responses:
                    value = response.response_value
                    if isinstance(value, list):
                        for v in value:
                            option_counts[v] = option_counts.get(v, 0) + 1
                    else:
                        option_counts[value] = option_counts.get(value, 0) + 1

                question_analytics[str(question.id)] = {
                    'question_text': question.question_text,
                    'type': question.question_type,
                    'option_counts': option_counts,
                    'total_responses': responses.count()
                }
            else:
                # For text-based questions
                responses_list = [r.response_value for r in responses if r.response_value]
                question_analytics[str(question.id)] = {
                    'question_text': question.question_text,
                    'type': question.question_type,
                    'responses': responses_list[:10],  # First 10 responses
                    'total_responses': len(responses_list)
                }

        self.analytics_data = question_analytics
        self.save()
```

### ✅ Phase 7 Completion Criteria
- [ ] Dynamic form builder working
- [ ] Question types implemented
- [ ] Survey CRUD operations functional
- [ ] Response collection working
- [ ] Analytics and reporting implemented
- [ ] Admin interface configured
- [ ] Export functionality working
- [ ] Integration with events complete

---

## 🔔 PHASE 8: NOTIFICATION SYSTEM
**Timeline: 4-5 hari | Developer: 1 Backend**

### 🎯 Objectives
- Implementasi notification system generik
- Real-time notifications
- Notification dengan action buttons
- Push notification integration
- Notification history management

### 📋 Checklist
- [ ] Notification model creation
- [ ] Notification CRUD API endpoints
- [ ] Action button implementation
- [ ] Push notification integration
- [ ] Read/unread status management
- [ ] Bulk notification system
- [ ] Admin interface for notifications
- [ ] Email notification integration

### 🔧 Step-by-Step Implementation

#### 8.1 Notification Models
**apps/notification/models.py:**
```python
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone

User = get_user_model()

class NotificationButton(models.Model):
    """Notification Button Model"""

    label = models.CharField(
        max_length=50,
        verbose_name="Button Label"
    )
    api_url = models.URLField(
        max_length=255,
        blank=True,
        verbose_name="API URL"
    )
    deeplink = models.URLField(
        max_length=255,
        blank=True,
        verbose_name="Deep Link"
    )
    button_style = models.CharField(
        max_length=20,
        choices=[
            ('primary', 'Primary'),
            ('secondary', 'Secondary'),
            ('success', 'Success'),
            ('warning', 'Warning'),
            ('danger', 'Danger'),
        ],
        default='primary',
        verbose_name="Button Style"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )

    class Meta:
        db_table = 'notification_notificationbutton'
        verbose_name = "Notification Button"
        verbose_name_plural = "Notification Buttons"

    def __str__(self):
        return self.label

class Notification(models.Model):
    """Main Notification Model"""

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    CATEGORY_CHOICES = [
        ('system', 'System'),
        ('event', 'Event'),
        ('transaction', 'Transaction'),
        ('blog', 'Blog'),
        ('survey', 'Survey'),
        ('company', 'Company'),
        ('security', 'Security'),
    ]

    title = models.CharField(
        max_length=255,
        verbose_name="Title"
    )
    summary = models.TextField(
        verbose_name="Summary"
    )
    body = models.TextField(
        blank=True,
        verbose_name="Full Body"
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='normal',
        verbose_name="Priority"
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='system',
        verbose_name="Category"
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name="Read"
    )
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Read At"
    )
    owned_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name="Owner"
    )
    button = models.ForeignKey(
        NotificationButton,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Action Button"
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Icon"
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        verbose_name="Image URL"
    )

    # Generic foreign key untuk terkait dengan model apapun
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Content Type"
    )
    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Object ID"
    )
    content_object = GenericForeignKey(
        'content_type', 'object_id'
    )

    # Push notification settings
    send_push = models.BooleanField(
        default=True,
        verbose_name="Send Push Notification"
    )
    push_sent = models.BooleanField(
        default=False,
        verbose_name="Push Sent"
    )
    push_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Push Sent At"
    )

    # Email notification settings
    send_email = models.BooleanField(
        default=False,
        verbose_name="Send Email"
    )
    email_sent = models.BooleanField(
        default=False,
        verbose_name="Email Sent"
    )
    email_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Email Sent At"
    )

    # Scheduling
    scheduled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Scheduled At"
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Expires At"
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'notification_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owned_by', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['category']),
            models.Index(fields=['priority']),
        ]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.title} - {self.owned_by.get_full_name()}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    def mark_as_unread(self):
        """Mark notification as unread"""
        if self.is_read:
            self.is_read = False
            self.read_at = None
            self.save(update_fields=['is_read', 'read_at'])

    def send_push_notification(self):
        """Send push notification"""
        if self.send_push and not self.push_sent:
            try:
                from apps.common.services.firebase_service import FirebaseService

                firebase_service = FirebaseService()
                device_tokens = self._get_user_device_tokens()

                if device_tokens:
                    for token in device_tokens:
                        firebase_service.send_push_notification(
                            device_token=token,
                            title=self.title,
                            body=self.summary,
                            data={
                                'notification_id': self.id,
                                'category': self.category,
                                'object_id': self.object_id,
                                'button_label': self.button.label if self.button else None,
                                'button_url': self.button.api_url if self.button else None,
                            }
                        )

                self.push_sent = True
                self.push_sent_at = timezone.now()
                self.save(update_fields=['push_sent', 'push_sent_at'])

                return True

            except Exception as e:
                print(f"Failed to send push notification: {e}")
                return False

        return True

    def send_email_notification(self):
        """Send email notification"""
        if self.send_email and not self.email_sent:
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                from django.template.loader import render_to_string

                # Render email template
                html_message = render_to_string('emails/notification.html', {
                    'notification': self,
                    'user': self.owned_by,
                    'site_url': settings.SITE_URL,
                })

                text_message = render_to_string('emails/notification.txt', {
                    'notification': self,
                    'user': self.owned_by,
                    'site_url': settings.SITE_URL,
                })

                # Send email
                send_mail(
                    subject=self.title,
                    message=text_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[self.owned_by.email],
                    html_message=html_message,
                    fail_silently=False,
                )

                self.email_sent = True
                self.email_sent_at = timezone.now()
                self.save(update_fields=['email_sent', 'email_sent_at'])

                return True

            except Exception as e:
                print(f"Failed to send email notification: {e}")
                return False

        return True

    def _get_user_device_tokens(self):
        """Get user's device tokens for push notifications"""
        # This would integrate with mobile app to get device tokens
        # For now, return empty list
        return []

    def is_expired(self):
        """Check if notification is expired"""
        if not self.expires_at:
            return False
        return timezone.now() > self.expires_at

    def is_scheduled(self):
        """Check if notification is scheduled for future"""
        if not self.scheduled_at:
            return False
        return self.scheduled_at > timezone.now()

class NotificationTemplate(models.Model):
    """Notification Template Model for reusable templates"""

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Template Name"
    )
    title_template = models.CharField(
        max_length=255,
        verbose_name="Title Template"
    )
    summary_template = models.TextField(
        verbose_name="Summary Template"
    )
    body_template = models.TextField(
        blank=True,
        verbose_name="Body Template"
    )
    category = models.CharField(
        max_length=20,
        choices=Notification.CATEGORY_CHOICES,
        default='system',
        verbose_name="Category"
    )
    priority = models.CharField(
        max_length=20,
        choices=Notification.PRIORITY_CHOICES,
        default='normal',
        verbose_name="Priority"
    )
    button = models.ForeignKey(
        NotificationButton,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Default Action Button"
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Icon"
    )
    send_push = models.BooleanField(
        default=True,
        verbose_name="Send Push by Default"
    )
    send_email = models.BooleanField(
        default=False,
        verbose_name="Send Email by Default"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At"
    )

    class Meta:
        db_table = 'notification_notificationtemplate'
        verbose_name = "Notification Template"
        verbose_name_plural = "Notification Templates"

    def __str__(self):
        return self.name

    def create_notification(self, user, context_data, content_object=None):
        """Create notification from template"""
        try:
            from django.template import Context, Template

            # Render title and summary
            title_template = Template(self.title_template)
            summary_template = Template(self.summary_template)
            body_template = Template(self.body_template) if self.body_template else None

            context = Context(context_data)

            title = title_template.render(context)
            summary = summary_template.render(context)
            body = body_template.render(context) if body_template else ''

            # Create notification
            notification = Notification.objects.create(
                title=title,
                summary=summary,
                body=body,
                category=self.category,
                priority=self.priority,
                owned_by=user,
                button=self.button,
                icon=self.icon,
                send_push=self.send_push,
                send_email=self.send_email,
                content_object=content_object
            )

            return notification

        except Exception as e:
            print(f"Failed to create notification from template: {e}")
            return None

class NotificationPreferences(models.Model):
    """User Notification Preferences"""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        verbose_name="User"
    )

    # Category preferences
    enable_system = models.BooleanField(default=True)
    enable_event = models.BooleanField(default=True)
    enable_transaction = models.BooleanField(default=True)
    enable_blog = models.BooleanField(default=True)
    enable_survey = models.BooleanField(default=True)
    enable_company = models.BooleanField(default=True)
    enable_security = models.BooleanField(default=True)

    # Channel preferences
    enable_push = models.BooleanField(default=True)
    enable_email = models.BooleanField(default=False)
    enable_in_app = models.BooleanField(default=True)

    # Quiet hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    # Daily digest
    enable_daily_digest = models.BooleanField(default=False)
    daily_digest_time = models.TimeField(default='09:00')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification_notificationpreferences'
        verbose_name = "Notification Preferences"
        verbose_name_plural = "Notification Preferences"

    def __str__(self):
        return f"{self.user.get_full_name()} Preferences"

    def should_send_notification(self, notification):
        """Check if notification should be sent based on preferences"""
        # Check category preference
        category_field = f"enable_{notification.category}"
        if not getattr(self, category_field, True):
            return False

        # Check quiet hours
        if self.quiet_hours_enabled:
            now = timezone.now().time()
            if self.quiet_hours_start and self.quiet_hours_end:
                if self.quiet_hours_start < self.quiet_hours_end:
                    # Same day (e.g., 22:00 - 07:00)
                    if self.quiet_hours_start <= now <= self.quiet_hours_end:
                        return False
                else:
                    # Overnight (e.g., 22:00 - 07:00)
                    if now >= self.quiet_hours_start or now <= self.quiet_hours_end:
                        return False

        # Check priority (urgent notifications always sent)
        if notification.priority == 'urgent':
            return True

        return True
```

#### 8.2 Notification Serializers
**apps/notification/serializers.py:**
```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, NotificationButton, NotificationTemplate, NotificationPreferences

User = get_user_model()

class NotificationButtonSerializer(serializers.ModelSerializer):
    """Serializer for notification buttons"""

    class Meta:
        model = NotificationButton
        fields = ['id', 'label', 'api_url', 'deeplink', 'button_style']

class NotificationListSerializer(serializers.ModelSerializer):
    """Serializer for notification list view"""
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'summary', 'priority', 'category',
            'is_read', 'icon', 'image_url', 'time_ago',
            'created_at'
        ]

    def get_time_ago(self, obj):
        """Get human readable time ago"""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days > 1 else ''} ago"
        else:
            return obj.created_at.strftime('%d %b %Y')

class NotificationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for notification"""
    button = NotificationButtonSerializer(read_only=True)
    time_ago = serializers.SerializerMethodField()
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'summary', 'body', 'priority', 'category',
            'is_read', 'read_at', 'icon', 'image_url', 'button',
            'time_ago', 'content_type_name', 'object_id',
            'created_at', 'updated_at'
        ]

    def get_time_ago(self, obj):
        """Get human readable time ago"""
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days > 1 else ''} ago"
        else:
            return obj.created_at.strftime('%d %b %Y')

class NotificationCreateSerializer(serializers.Serializer):
    """Serializer for creating notifications"""
    title = serializers.CharField(max_length=255)
    summary = serializers.CharField()
    body = serializers.CharField(required=False, allow_blank=True)
    priority = serializers.ChoiceField(
        choices=Notification.PRIORITY_CHOICES,
        default='normal'
    )
    category = serializers.ChoiceField(
        choices=Notification.CATEGORY_CHOICES,
        default='system'
    )
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )
    button_id = serializers.IntegerField(required=False, allow_null=True)
    icon = serializers.CharField(max_length=50, required=False, allow_blank=True)
    image_url = serializers.URLField(required=False, allow_blank=True)
    send_push = serializers.BooleanField(default=True)
    send_email = serializers.BooleanField(default=False)
    scheduled_at = serializers.DateTimeField(required=False, allow_null=True)

class NotificationPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""

    class Meta:
        model = NotificationPreferences
        fields = [
            'enable_system', 'enable_event', 'enable_transaction',
            'enable_blog', 'enable_survey', 'enable_company', 'enable_security',
            'enable_push', 'enable_email', 'enable_in_app',
            'quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end',
            'enable_daily_digest', 'daily_digest_time'
        ]

class NotificationTemplateSerializer(serializers.ModelSerializer):
    """Serializer for notification templates"""
    button = NotificationButtonSerializer(read_only=True)

    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'title_template', 'summary_template',
            'body_template', 'category', 'priority', 'button',
            'icon', 'send_push', 'send_email', 'is_active',
            'created_at', 'updated_at'
        ]
```

#### 8.3 Notification Views
**apps/notification/views.py:**
```python
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Notification, NotificationButton, NotificationTemplate, NotificationPreferences
from .serializers import (
    NotificationListSerializer, NotificationDetailSerializer, NotificationCreateSerializer,
    NotificationButtonSerializer, NotificationTemplateSerializer, NotificationPreferencesSerializer
)

User = get_user_model()

class NotificationViewSet(viewsets.ModelViewSet):
    """Notification ViewSet for CRUD operations"""

    queryset = Notification.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_read', 'category', 'priority']
    search_fields = ['title', 'summary', 'body']
    ordering_fields = ['created_at', 'priority', 'read_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return NotificationListSerializer
        else:
            return NotificationDetailSerializer

    def get_queryset(self):
        """Filter notifications for current user"""
        user = self.request.user
        queryset = super().get_queryset().filter(owned_by=user)

        # Filter by read status if provided
        read_status = self.request.query_params.get('read_status')
        if read_status == 'read':
            queryset = queryset.filter(is_read=True)
        elif read_status == 'unread':
            queryset = queryset.filter(is_read=False)

        return queryset

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        try:
            user = request.user

            # Mark all unread notifications as read
            unread_notifications = Notification.objects.filter(
                owned_by=user,
                is_read=False
            )

            count = unread_notifications.count()
            unread_notifications.update(
                is_read=True,
                read_at=timezone.now()
            )

            return Response({
                'message': f'Marked {count} notifications as read'
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.mark_as_read()

        return Response({
            'message': 'Notification marked as read',
            'notification': NotificationDetailSerializer(notification).data
        })

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """Mark notification as unread"""
        notification = self.get_object()
        notification.mark_as_unread()

        return Response({
            'message': 'Notification marked as unread',
            'notification': NotificationDetailSerializer(notification).data
        })

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count"""
        user = request.user
        count = Notification.objects.filter(
            owned_by=user,
            is_read=False
        ).count()

        return Response({
            'unread_count': count
        })

    @action(detail=False, methods=['post'])
    def create_bulk(self, request):
        """Create notifications for multiple users"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            serializer = NotificationCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user_ids = serializer.validated_data.pop('user_ids')
            users = User.objects.filter(id__in=user_ids)

            created_notifications = []

            for user in users:
                notification = Notification.objects.create(
                    owned_by=user,
                    **serializer.validated_data
                )
                created_notifications.append(notification)

                # Send push notification if enabled
                if serializer.validated_data.get('send_push', True):
                    notification.send_push_notification()

                # Send email if enabled
                if serializer.validated_data.get('send_email', False):
                    notification.send_email_notification()

            return Response({
                'message': f'Created {len(created_notifications)} notifications',
                'count': len(created_notifications)
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def preferences(self, request):
        """Get user notification preferences"""
        user = request.user

        preferences, created = NotificationPreferences.objects.get_or_create(user=user)
        serializer = NotificationPreferencesSerializer(preferences)

        return Response(serializer.data)

    @action(detail=False, methods=['patch'])
    def update_preferences(self, request):
        """Update user notification preferences"""
        user = request.user

        preferences, created = NotificationPreferences.objects.get_or_create(user=user)
        serializer = NotificationPreferencesSerializer(
            preferences,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Preferences updated successfully',
                'preferences': serializer.data
            })
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_notification_from_template(request):
    """Send notification using template"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        template_id = request.data.get('template_id')
        user_ids = request.data.get('user_ids', [])
        context_data = request.data.get('context_data', {})

        if not template_id or not user_ids:
            return Response(
                {'error': 'template_id and user_ids are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get template
        template = get_object_or_404(NotificationTemplate, id=template_id)

        # Get users
        users = User.objects.filter(id__in=user_ids)
        created_count = 0

        for user in users:
            notification = template.create_notification(
                user=user,
                context_data=context_data
            )

            if notification:
                # Send push and email based on template settings
                notification.send_push_notification()
                notification.send_email_notification()
                created_count += 1

        return Response({
            'message': f'Sent {created_count} notifications from template',
            'template': template.name,
            'count': created_count
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

# Button ViewSet
class NotificationButtonViewSet(viewsets.ModelViewSet):
    """Notification Button ViewSet"""

    queryset = NotificationButton.objects.all()
    serializer_class = NotificationButtonSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['label']
    ordering = ['label']

# Template ViewSet
class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """Notification Template ViewSet"""

    queryset = NotificationTemplate.objects.filter(is_active=True)
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'title_template']
    ordering = ['name']
```

#### 8.4 Notification URLs
**apps/notification/urls.py:**
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'notifications', views.NotificationViewSet)
router.register(r'buttons', views.NotificationButtonViewSet)
router.register(r'templates', views.NotificationTemplateViewSet)

app_name = 'notification'

urlpatterns = [
    path('', include(router.urls)),

    # Additional endpoints
    path('send-from-template/', views.send_notification_from_template, name='send_from_template'),
]
```

#### 8.5 Update Main URLs
**core/urls.py:**
```python
# Add to urlpatterns
urlpatterns += [
    path('api/notification/', include('apps.notification.urls')),
]
```

### ✅ Phase 8 Completion Criteria
- [ ] Notification CRUD operations working
- [ ] Action buttons implemented
- [ ] Push notification integration working
- [ ] Read/unread status management functional
- [ ] Bulk notification system working
- [ ] Admin interface configured
- [ ] Email notification integration working
- [ ] User preferences system implemented

---

## 📱 PHASE 9: MOBILE APP DEVELOPMENT (FLUTTER)
**Timeline: 8-10 minggu | Developer: 1 Mobile**

### 🎯 Objectives
- Pembangunan mobile app (Flutter) untuk TMC API
- User authentication & profile management
- Event browsing & registration
- Payment management
- Survey & notifications
- QR code scanning
- Offline support

### 📋 Checklist
- [ ] Flutter project setup
- [ ] Authentication system (Google OAuth)
- [ ] State management (GetX)
- [ ] API service integration
- [ ] Event management screens
- [ ] Payment screens
- [ ] Survey screens
- [ ] Notification system
- [ ] QR code scanner
- [ ] Offline support

### 🔧 Step-by-Step Implementation

#### 9.1 Flutter Project Setup
```bash
# Create new Flutter project
flutter create tmc_mobile
cd tmc_mobile

# Add dependencies to pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # State Management
  get: ^4.6.5

  # HTTP Client
  dio: ^5.3.2

  # Firebase
  firebase_core: ^2.24.2
  firebase_auth: ^4.15.3
  cloud_firestore: ^4.13.6
  firebase_storage: ^11.5.6

  # UI Components
  getwidget: ^4.0.0

  # Image Picker
  image_picker: ^1.0.4

  # QR Code Scanner
  qr_code_scanner: ^1.0.1

  # Local Storage
  get_storage: ^2.1.1

  # Date Utils
  intl: ^0.18.1

  # JSON Annotation
  json_annotation: ^4.8.1

  # Cached Network Image
  cached_network_image: ^3.3.0

  # Permissions
  permission_handler: ^11.0.1

  # Device Info
  device_info_plus: ^9.1.1

dev_dependencies:
  flutter_test:
    sdk: flutter

  # Code Generation
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
```

#### 9.2 Project Structure
```
lib/
├── main.dart
├── app.dart
├── config/
│   ├── routes.dart
│   ├── themes.dart
│   └── constants.dart
├── controller/
│   ├── auth_controller.dart
│   ├── event_controller.dart
│   ├── blog_controller.dart
│   ├── company_controller.dart
│   ├── notification_controller.dart
│   ├── transaction_controller.dart
│   └── survey_controller.dart
├── model/
│   ├── user.dart
│   ├── event.dart
│   ├── blog.dart
│   ├── company.dart
│   ├── notification.dart
│   └── transaction.dart
├── pages/
│   ├── auth/
│   │   ├── login_page.dart
│   │   └── register_page.dart
│   ├── dashboard/
│   │   └── dashboard_page.dart
│   ├── event/
│   │   ├── event_list_page.dart
│   │   ├── event_detail_page.dart
│   │   └── event_registration_page.dart
│   ├── blog/
│   │   ├── blog_list_page.dart
│   │   └── blog_detail_page.dart
│   ├── profile/
│   │   └── profile_page.dart
│   └── notification/
│       └── notification_page.dart
├── widget/
│   ├── custom_button.dart
│   ├── custom_card.dart
│   ├── custom_text_field.dart
│   └── event_card.dart
├── services/
│   ├── api_service.dart
│   ├── firebase_service.dart
│   └── storage_service.dart
└── utils/
    ├── helpers.dart
    └── validators.dart
```

#### 9.3 Main App Configuration
**lib/main.dart:**
```dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'app.dart';
import 'config/themes.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();

  runApp(TMCApp());
}

class TMCApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'TMC Mobile',
      theme: AppThemes.lightTheme,
      darkTheme: AppThemes.darkTheme,
      themeMode: ThemeMode.system,
      debugShowCheckedModeBanner: false,
      initialRoute: '/splash',
      getPages: AppRoutes.routes,
    );
  }
}
```

#### 9.4 API Service
**lib/services/api_service.dart:**
```dart
import 'package:dio/dio.dart';
import 'package:get_storage/get_storage.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

class ApiService {
  late Dio _dio;
  final GetStorage _storage = GetStorage();

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.tmc.id/api',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Request interceptor untuk authentication
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = _storage.read('token');
          if (token != null) {
            options.headers['Authorization'] = 'Token $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          // Auto-refresh token
          if (error.response?.statusCode == 401) {
            try {
              await _refreshToken();
              final token = _storage.read('token');
              if (token != null) {
                error.requestOptions.headers['Authorization'] = 'Token $token';
                return handler.resolve(await _dio.fetch(error.requestOptions));
              }
            } catch (e) {
              // Clear token dan redirect ke login
              _storage.remove('token');
              Get.offAllNamed('/login');
            }
          }
          return handler.next(error);
        },
      ),
    );

    // Development logging
    if (!const bool.fromEnvironment('dart.vm.product')) {
      _dio.interceptors.add(PrettyDioLogger(
        requestHeader: true,
        requestBody: true,
        responseBody: true,
        responseHeader: false,
        error: true,
        compact: true,
      ));
    }
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  Future<Response> patch(String path, {dynamic data}) {
    return _dio.patch(path, data: data);
  }

  Future<Response> delete(String path) {
    return _dio.delete(path);
  }

  Future<void> setToken(String token) async {
    await _storage.write('token', token);
  }

  Future<void> clearToken() async {
    await _storage.remove('token');
  }

  Future<void> _refreshToken() async {
    try {
      final response = await _dio.post('/authentication/refresh/');
      if (response.statusCode == 200) {
        final token = response.data['token'];
        await setToken(token);
      }
    } catch (e) {
      throw Exception('Failed to refresh token');
    }
  }
}
```

#### 9.5 Authentication Controller
**lib/controller/auth_controller.dart:**
```dart
import 'package:get/get.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../model/user.dart';
import '../services/api_service.dart';
import '../services/firebase_service.dart';

class AuthController extends GetxController {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final ApiService _apiService = Get.find<ApiService>();
  final FirebaseService _firebaseService = Get.find<FirebaseService>();

  // Reactive variables
  var isLoggedIn = false.obs;
  var currentUser = Rxn<UserModel?>();
  var isLoading = false.obs;
  var errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
      // Check Firebase auth
      final firebaseUser = _auth.currentUser;

      // Check local token
      final token = GetStorage().read('token');

      if (firebaseUser != null && token != null) {
        await _getUserProfile();
        isLoggedIn.value = true;
      }
    } catch (e) {
      print('Auth check error: $e');
    }
  }

  Future<void> signInWithGoogle() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      // Firebase Google Sign-In
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      if (googleUser == null) {
        throw Exception('Google sign in cancelled');
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);

      // Exchange token dengan backend
      await _exchangeTokenWithBackend(userCredential.user!);

      isLoggedIn.value = true;
      Get.offAllNamed('/dashboard');

    } catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Error', errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signInWithEmail(String email, String password) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      // Call backend login endpoint
      final response = await _apiService.post('/authentication/manual-login/', data: {
        'username': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = response.data;

        // Store token
        await _apiService.setToken(data['token']);

        // Get user profile
        await _getUserProfile();

        isLoggedIn.value = true;
        Get.offAllNamed('/dashboard');
      } else {
        throw Exception('Login failed');
      }

    } catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Login Error', errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> registerWithEmail(String email, String password, String firstName, String lastName) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      // Call backend register endpoint
      final response = await _apiService.post('/authentication/manual-register/', data: {
        'username': email,
        'email': email,
        'password': password,
        'first_name': firstName,
        'last_name': lastName,
      });

      if (response.statusCode == 201) {
        final data = response.data;

        // Store token
        await _apiService.setToken(data['token']);

        // Get user profile
        await _getUserProfile();

        isLoggedIn.value = true;
        Get.offAllNamed('/dashboard');
      } else {
        throw Exception('Registration failed');
      }

    } catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Registration Error', errorMessage.value);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    try {
      // Firebase logout
      await _auth.signOut();

      // Google logout
      await GoogleSignIn().signOut();

      // Clear local token
      await _apiService.clearToken();

      // Clear user data
      currentUser.value = null;
      isLoggedIn.value = false;

      Get.offAllNamed('/login');

    } catch (e) {
      print('Logout error: $e');
    }
  }

  Future<void> _exchangeTokenWithBackend(User firebaseUser) async {
    try {
      final response = await _apiService.post('/authentication/oauth/', data: {
        'access_token': await firebaseUser.getIdToken(),
        'backend': 'google-oauth2',
      });

      if (response.statusCode == 201) {
        final data = response.data;
        await _apiService.setToken(data['token']);
        await _getUserProfile();
      } else {
        throw Exception('Token exchange failed');
      }
    } catch (e) {
      throw Exception('Failed to exchange token: $e');
    }
  }

  Future<void> _getUserProfile() async {
    try {
      final response = await _apiService.get('/account/me/');

      if (response.statusCode == 200) {
        currentUser.value = UserModel.fromJson(response.data);
      }
    } catch (e) {
      print('Failed to get user profile: $e');
    }
  }
}
```

#### 9.6 Event Controller
**lib/controller/event_controller.dart:**
```dart
import 'package:get/get.dart';
import '../model/event.dart';
import '../services/api_service.dart';

class EventController extends GetxController {
  final ApiService _apiService = Get.find<ApiService>();

  // Reactive variables
  var events = <Event>[].obs;
  var currentEvent = Rxn<Event>();
  var isLoading = false.obs;
  var errorMessage = ''.obs;
  var registeredEvents = <Event>[].obs;

  @override
  void onInit() {
    super.onInit();
    fetchEvents();
  }

  Future<void> fetchEvents() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await _apiService.get('/event/');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['results'];
        events.value = data.map((json) => Event.fromJson(json)).toList();
      }
    } catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Error', 'Failed to load events');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchEventDetail(int eventId) async {
    try {
      isLoading.value = true;

      final response = await _apiService.get('/event/$eventId/');

      if (response.statusCode == 200) {
        currentEvent.value = Event.fromJson(response.data);
      }
    } catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Error', 'Failed to load event details');
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> registerForEvent(int eventId) async {
    try {
      isLoading.value = true;

      final response = await _apiService.post('/event/$eventId/registration/');

      if (response.statusCode == 201) {
        Get.snackbar('Success', 'Registration successful');

        // Refresh events
        await fetchEvents();
        await fetchRegisteredEvents();

        return true;
      }
    } catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Error', errorMessage.value);
    } finally {
      isLoading.value = false;
    }

    return false;
  }

  Future<void> fetchRegisteredEvents() async {
    try {
      final response = await _apiService.get('/account/me/');

      if (response.statusCode == 200) {
        final List<dynamic> eventData = response.data['event_registered'] ?? [];
        registeredEvents.value = eventData
            .map((json) => Event.fromJson(json))
            .toList();
      }
    } catch (e) {
      print('Failed to fetch registered events: $e');
    }
  }

  Future<void> downloadCertificate(int eventId) async {
    try {
      final response = await _apiService.get('/event/$eventId/download-certificate/');

      if (response.statusCode == 200) {
        // Handle certificate download
        Get.snackbar('Success', 'Certificate downloaded');
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to download certificate');
    }
  }

  Future<void> refreshEvents() async {
    await fetchEvents();
  }
}
```

#### 9.7 Event List Page
**lib/pages/event/event_list_page.dart:**
```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controller/event_controller.dart';
import '../../widget/event_card.dart';
import '../../widget/loading_widget.dart';

class EventListPage extends StatelessWidget {
  final EventController eventController = Get.find<EventController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Events'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: eventController.refreshEvents,
          ),
        ],
      ),
      body: Obx(() {
        if (eventController.isLoading.value) {
          return const LoadingWidget();
        }

        if (eventController.errorMessage.value.isNotEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.grey,
                ),
                const SizedBox(height: 16),
                Text(
                  'Failed to load events',
                  style: const TextStyle(
                    fontSize: 18,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: eventController.refreshEvents,
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (eventController.events.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.event_available,
                  size: 64,
                  color: Colors.grey,
                ),
                SizedBox(height: 16),
                Text(
                  'No events available',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: eventController.refreshEvents,
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: eventController.events.length,
            itemBuilder: (context, index) {
              final event = eventController.events[index];
              return EventCard(event: event);
            },
          ),
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Navigate to event creation (if admin/PIC)
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### ✅ Phase 9 Completion Criteria
- [ ] Flutter project setup complete
- [ ] Authentication system working (Google OAuth + Email)
- [ ] State management implemented (GetX)
- [ ] API service integration working
- [ ] Event management screens functional
- [ ] Payment screens implemented
- [ ] Survey screens working
- [ ] Notification system integrated
- [ ] QR code scanner functional
- [ ] Offline support implemented

---

## 🌐 PHASE 10: FRONTEND WEB DEVELOPMENT
**Timeline: 6-8 minggu | Developer: 1 Frontend**

### 🎯 Objectives
- Pembangunan web frontend untuk TMC API
- Admin dashboard
- User portal
- Content management interface
- Analytics & reporting dashboard
- Mobile-responsive design

### 📋 Checklist
- [ ] React project setup
- [ ] Authentication system
- [ ] State management (Zustand)
- [ ] API integration (TanStack Query)
- [ ] Admin dashboard
- [ ] User portal pages
- [ ] Event management interface
- [ ] Analytics dashboard
- [ ] Responsive design

### 🔧 Step-by-Step Implementation

#### 10.1 Project Setup
```bash
# Create React project
npx create-react-app tmc-frontend --template typescript
cd tmc-frontend

# Install dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install react-router-dom
npm install axios
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
npm install react-hook-form @hookform/resolvers zod
npm install recharts
npm install date-fns

# Dev dependencies
npm install -D @types/node
```

#### 10.2 Tailwind CSS Setup
```bash
# Initialize Tailwind CSS
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 10.3 Project Structure
```
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── auth/                  # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── GoogleAuthButton.tsx
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── features/             # Feature components
│       ├── events/
│       ├── blog/
│       ├── companies/
│       └── dashboard/
├── lib/
│   ├── api/                   # API services
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   └── index.ts
│   ├── stores/                # Zustand stores
│   │   └── authStore.ts
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useEvents.ts
│   └── utils/                 # Utility functions
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   └── NotFound.tsx
├── types/
│   └── index.ts               # TypeScript types
├── App.tsx
└── main.tsx
```

#### 10.4 API Client Setup
**src/lib/api/client.ts:**
```typescript
import axios, { AxiosError, AxiosResponse } from 'axios';
import { authStore } from '../stores/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk auto-authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk auto-refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authStore.getState().refreshToken();
        const token = authStore.getState().token;

        if (token) {
          originalRequest.headers.Authorization = `Token ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        authStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

#### 10.5 Auth Store (Zustand)
**src/lib/stores/authStore.ts:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import apiClient from '../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  role: 'admin' | 'pic' | 'member';
  is_pic: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials: LoginCredentials) => {
          try {
            set({ isLoading: true, error: null });

            const response = await apiClient.post('/authentication/manual-login/', credentials);
            const { user, token, role } = response.data;

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Store token untuk axios
            apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        loginWithGoogle: async (accessToken: string) => {
          try {
            set({ isLoading: true, error: null });

            const response = await apiClient.post('/authentication/oauth/', {
              access_token: accessToken,
              backend: 'google-oauth2',
            });

            const { user, token } = response.data;

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Google login failed';
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });

          // Clear token dari axios
          delete apiClient.defaults.headers.common['Authorization'];
        },

        refreshToken: async () => {
          try {
            const { token } = get();
            if (!token) throw new Error('No token available');

            const response = await apiClient.post('/authentication/refresh/');
            const { token: newToken } = response.data;

            set({ token: newToken });
            apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`;
          } catch (error) {
            get().logout();
            throw error;
          }
        },

        clearError: () => {
          set({ error: null });
        },

        updateProfile: async (data: Partial<User>) => {
          try {
            set({ isLoading: true, error: null });

            const response = await apiClient.patch('/account/update-me/', data);
            const updatedUser = response.data;

            set({
              user: updatedUser,
              isLoading: false,
            });
          } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Profile update failed';
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
```

#### 10.6 Custom Hooks
**src/lib/hooks/useAuth.ts:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../api/client';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, loginWithGoogle, updateProfile } = useAuthStore();
  const queryClient = useQueryClient();

  // Get user profile
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/account/me/');
      return response.data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Google login mutation
  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['profile'], updatedUser);
    },
  });

  return {
    user: profile || user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    loginWithGoogle: googleLoginMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    logout,
    refetchProfile: refetch,
  };
};
```

#### 10.7 Event API
**src/lib/api/events.ts:**
```typescript
import apiClient from './client';

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  date: string;
  venue: string;
  is_free: boolean;
  price: string;
  is_registration_close: boolean;
  is_list_attendees: boolean;
  is_done: boolean;
  attendee_count: number;
  registration_count: number;
  is_upcoming: boolean;
  is_past: boolean;
  registration_open: boolean;
  owner_name: string;
  main_image_url?: string;
  created_at: string;
}

export interface EventFilters {
  status?: string;
  search?: string;
  upcoming?: boolean;
  past?: boolean;
}

export const eventsApi = {
  getEvents: async (filters?: EventFilters) => {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.upcoming) params.append('upcoming', 'true');
    if (filters?.past) params.append('past', 'true');

    const response = await apiClient.get(`/event/?${params}`);
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await apiClient.get(`/event/${id}/`);
    return response.data;
  },

  registerForEvent: async (id: string) => {
    const response = await apiClient.post(`/event/${id}/registration/`);
    return response.data;
  },

  getEventRegistrants: async (id: string) => {
    const response = await apiClient.get(`/event/${id}/registrants/`);
    return response.data;
  },

  createEvent: async (data: Partial<Event>) => {
    const response = await apiClient.post('/event/', data);
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<Event>) => {
    const response = await apiClient.patch(`/event/${id}/`, data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await apiClient.delete(`/event/${id}/`);
    return response.data;
  },
};
```

#### 10.8 Event Hooks
**src/lib/hooks/useEvents.ts:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, Event, EventFilters } from '../api/events';

export const useEvents = (filters?: EventFilters) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsApi.getEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getEvent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRegisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.registerForEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useEventRegistrants = (id: string) => {
  return useQuery({
    queryKey: ['event-registrants', id],
    queryFn: () => eventsApi.getEventRegistrants(id),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      eventsApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
```

#### 10.9 Event Components
**src/components/features/events/EventCard.tsx:**
```typescript
import React from 'react';
import { Event } from '../../../lib/api/events';
import { useRegisterEvent } from '../../../lib/hooks/useEvents';
import { Button } from '../../ui/Button';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isRegistered }) => {
  const registerMutation = useRegisterEvent();

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync(event.id.toString());
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>

        <div className="text-sm text-gray-600 space-y-1">
          <p>📅 {formatDate(event.date)}</p>
          <p>📍 {event.venue}</p>
          <p>💰 {event.is_free ? 'Free' : `Rp ${event.price}`}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          event.is_registration_close
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {event.is_registration_close ? 'Closed' : 'Open'}
        </span>

        {!isRegistered && !event.is_registration_close && event.is_upcoming && (
          <Button
            onClick={handleRegister}
            disabled={registerMutation.isPending}
            size="sm"
          >
            {registerMutation.isPending ? 'Registering...' : 'Register'}
          </Button>
        )}

        {isRegistered && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Registered
          </span>
        )}

        {!event.is_upcoming && (
          <span className="text-sm text-gray-600 font-medium">
            Event Ended
          </span>
        )}
      </div>
    </div>
  );
};
```

#### 10.10 Event List Page
**src/pages/dashboard/EventListPage.tsx:**
```typescript
import React, { useState } from 'react';
import { useEvents } from '../../../lib/hooks/useEvents';
import { EventCard } from '../../../components/features/events/EventCard';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const EventListPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useEvents({
    search: searchTerm || undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });

  const events = eventsData?.results || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (status: string) => {
    setFilterStatus(status);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load events</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1"
        />

        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => handleFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
            onClick={() => handleFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={filterStatus === 'past' ? 'default' : 'outline'}
            onClick={() => handleFilter('past')}
          >
            Past
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <p className="text-gray-600">No events found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### ✅ Phase 10 Completion Criteria
- [ ] React project setup complete
- [ ] Authentication system working
- [ ] State management implemented (Zustand)
- [ ] API integration working (TanStack Query)
- [ ] Admin dashboard functional
- [ ] User portal working
- [ ] Event management interface complete
- [ ] Analytics dashboard implemented
- [ ] Mobile-responsive design working

---

## 🧪 PHASE 11: TESTING & QUALITY ASSURANCE
**Timeline: 4-6 minggu | Developer: 1 Backend + 1 QA**

### 🎯 Objectives
- Implementasi sistem testing
- Unit tests untuk models & views
- Integration tests untuk API endpoints
- End-to-end testing
- Performance testing & optimization
- Security testing & penetration testing

### 📋 Checklist
- [ ] Unit tests untuk models
- [ ] Unit tests untuk views & serializers
- [ ] Integration tests untuk API endpoints
- [ ] End-to-end testing dengan Cypress
- [ ] Performance testing
- [ ] Security testing
- [ ] Load testing
- [ ] Code coverage reporting

### 🔧 Step-by-Step Implementation

#### 11.1 Backend Testing Setup
**requirements-test.txt:**
```txt
# Testing Framework
pytest==7.4.3
pytest-django==4.7.0
pytest-cov==4.1.0
factory-boy==3.3.0

# API Testing
requests==2.31.0
httpx==0.25.2

# Mocking
mock==5.1.0
responses==0.23.3

# Database Testing
pytest-postgresql==5.0.0

# Code Quality
flake8==6.1.0
black==23.9.1
isort==5.12.0
```

#### 11.2 Test Configuration
**pytest.ini:**
```ini
[tool:pytest]
DJANGO_SETTINGS_MODULE = core.settings.test
python_files = tests.py test_*.py *_tests.py
addopts = --cov=apps --cov-report=html --cov-report=term-missing
testpaths = tests
```

#### 11.3 Unit Tests for Models
**tests/test_models.py:**
```python
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.event.models import EventModel, RegistrantModel
from apps.transaction.models import Invoice

User = get_user_model()

class TestEventModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.event = EventModel.objects.create(
            title='Test Event',
            date='2024-12-31T10:00:00Z',
            venue='Test Venue',
            is_free=True,
            owned_by=self.user
        )

    def test_event_creation(self):
        """Test event creation"""
        self.assertEqual(self.event.title, 'Test Event')
        self.assertEqual(self.event.owned_by, self.user)
        self.assertTrue(self.event.is_free)
        self.assertTrue(self.event.is_upcoming)

    def test_event_str_method(self):
        """Test event string representation"""
        expected = "Test Event - December 31, 2024"
        self.assertEqual(str(self.event), expected)

    def test_event_slug_generation(self):
        """Test automatic slug generation"""
        self.assertIsNotNone(self.event.slug)
        self.assertTrue(self.event.slug.startswith('test-event'))

    def test_event_registration(self):
        """Test event registration"""
        registration = RegistrantModel.objects.create(
            event=self.event,
            attendance=self.user,
            invited_by=self.user
        )

        self.assertEqual(registration.event, self.event)
        self.assertEqual(registration.attendance, self.user)
        self.assertIsNotNone(registration.certificate_number)

class TestInvoiceModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.invoice = Invoice.objects.create(
            user=self.user,
            amount=100000.00
        )

    def test_invoice_creation(self):
        """Test invoice creation"""
        self.assertEqual(self.invoice.user, self.user)
        self.assertEqual(self.invoice.amount, 100000.00)
        self.assertEqual(self.invoice.status, 101)  # Pending
        self.assertIsNotNone(self.invoice.number)
        self.assertIsNotNone(self.invoice.trx_id)

    def test_invoice_number_format(self):
        """Test invoice number format"""
        self.assertTrue(self.invoice.number.startswith('I'))
        self.assertTrue(len(self.invoice.number) > 1)

    def test_invoice_formatted_amount(self):
        """Test amount formatting"""
        formatted = self.invoice.get_formatted_amount()
        self.assertTrue(formatted.startswith('Rp'))
        self.assertIn('100.000', formatted)

    def test_invoice_can_be_paid(self):
        """Test payment eligibility"""
        self.assertTrue(self.invoice.can_be_paid())

        # Mark as paid
        self.invoice.mark_as_success()
        self.assertFalse(self.invoice.can_be_paid())
```

#### 11.4 API Integration Tests
**tests/test_api.py:**
```python
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.event.models import EventModel

User = get_user_model()

class TestEventAPI(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.event = EventModel.objects.create(
            title='Test Event',
            date='2024-12-31T10:00:00Z',
            venue='Test Venue',
            is_free=True,
            owned_by=self.user
        )

    def test_get_events_list(self):
        """Test GET /api/event/"""
        response = self.client.get('/api/event/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_get_event_detail(self):
        """Test GET /api/event/{id}/"""
        response = self.client.get(f'/api/event/{self.event.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Event')

    def test_create_event_unauthorized(self):
        """Test POST /api/event/ without authentication"""
        data = {
            'title': 'New Event',
            'date': '2024-12-31T10:00:00Z',
            'venue': 'New Venue',
            'is_free': True,
        }
        response = self.client.post('/api/event/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_event_authorized(self):
        """Test POST /api/event/ with authentication"""
        self.client.force_authenticate(user=self.user)

        data = {
            'title': 'New Event',
            'date': '2024-12-31T10:00:00Z',
            'venue': 'New Venue',
            'is_free': True,
        }
        response = self.client.post('/api/event/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Event')

    def test_event_registration(self):
        """Test event registration"""
        self.client.force_authenticate(user=self.user)

        response = self.client.post(f'/api/event/{self.event.id}/registration/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('registration', response.data)

    def test_event_registration_duplicate(self):
        """Test duplicate event registration"""
        self.client.force_authenticate(user=self.user)

        # First registration
        self.client.post(f'/api/event/{self.event.id}/registration/')

        # Second registration (should fail)
        response = self.client.post(f'/api/event/{self.event.id}/registration/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already registered', response.data['error'])

class TestAuthenticationAPI(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_manual_login_success(self):
        """Test successful manual login"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/authentication/manual-login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_manual_login_invalid_credentials(self):
        """Test manual login with invalid credentials"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/authentication/manual-login/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        """Test GET /api/account/me/ with authentication"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/account/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_get_profile_unauthenticated(self):
        """Test GET /api/account/me/ without authentication"""
        response = self.client.get('/api/account/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

#### 11.5 End-to-End Testing with Cypress
**cypress.config.js:**
```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
```

**cypress/e2e/auth.cy.js:**
```javascript
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login page', () => {
    cy.contains('h1', 'Login');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include('/dashboard');
    cy.contains('Welcome, Test User');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid credentials');
    cy.url().should('include('/login');
  });

  it('should allow Google OAuth login', () => {
    // Mock Google OAuth for testing
    cy.get('[data-testid="google-login-button"]').click();

    // In real test, this would redirect to Google OAuth
    // For testing, we'll mock the success callback
    cy.contains('Login successful');
    cy.url().should('include('/dashboard');
  });
});
```

**cypress/e2e/events.cy.js:**
```javascript
describe('Events', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'password123');
    cy.visit('/events');
  });

  it('should display events list', () => {
    cy.contains('h1', 'Events');
    cy.get('[data-testid="event-card"]').should('have.length.greaterThan', 0);
  });

  it('should search events', () => {
    cy.get('[data-testid="search-input"]').type('Test Event');
    cy.get('[data-testid="search-button"]').click();

    cy.get('[data-testid="event-card"]').should('contain', 'Test Event');
  });

  it('should navigate to event detail', () => {
    cy.get('[data-testid="event-card"]').first().click();
    cy.url().should('include('/events/');
    cy.contains('Event Details');
  });

  it('should register for event', () => {
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.get('[data-testid="register-button"]').click();
    });

    cy.contains('Registration successful');
    cy.get('[data-testid="registered-badge"]').should('be.visible');
  });

  it('should filter events by status', () => {
    cy.get('[data-testid="filter-upcoming"]').click();
    cy.url().should('include('upcoming=true');

    cy.get('[data-testid="event-card"]').each(($el) => {
      cy.wrap($el).should('contain', 'Upcoming');
    });
  });
});
```

#### 11.6 Performance Testing
**locustfile.py:**
```python
from locust import HttpUser, task, between
import random

class TMCUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Login on start"""
        response = self.client.post("/api/authentication/manual-login/", json={
            "username": "testuser@example.com",
            "password": "password123"
        })

        if response.status_code == 200:
            self.token = response.json()["token"]
            self.client.headers.update({
                "Authorization": f"Token {self.token}"
            })

    @task(3)
    def view_events(self):
        """Browse events"""
        self.client.get("/api/event/")

    @task(2)
    def view_event_detail(self):
        """View event details"""
        events = self.client.get("/api/event/").json()
        if events["results"]:
            event_id = random.choice(events["results"])["id"]
            self.client.get(f"/api/event/{event_id}/")

    @task(1)
    def register_for_event(self):
        """Register for event"""
        events = self.client.get("/api/event/").json()
        if events["results"]:
            event_id = random.choice(events["results"])["id"]
            self.client.post(f"/api/event/{event_id}/registration/")
```

#### 11.7 Security Testing
**tests/test_security.py:**
```python
import pytest
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class SecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_sql_injection_prevention(self):
        """Test SQL injection prevention"""
        malicious_input = "'; DROP TABLE auth_user; --"

        # Test in search parameter
        response = self.client.get(f'/api/event/?search={malicious_input}')
        assert response.status_code != 500

        # Verify user table still exists
        assert User.objects.filter(username='testuser').exists()

    def test_xss_prevention(self):
        """Test XSS prevention"""
        xss_payload = '<script>alert("xss")</script>'

        # Create event with XSS payload
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/event/', {
            'title': xss_payload,
            'date': '2024-12-31T10:00:00Z',
            'venue': 'Test Venue',
            'is_free': True,
        })

        # Verify XSS payload is escaped
        assert '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;' in response.data['title']

    def test_csrf_protection(self):
        """Test CSRF protection"""
        # Test POST without CSRF token
        response = self.client.post('/api/event/', {
            'title': 'Test Event',
        })

        # Should fail without authentication
        assert response.status_code == 401

    def test_rate_limiting(self):
        """Test rate limiting"""
        # Multiple rapid requests
        for _ in range(100):
            response = self.client.get('/api/event/')
            if response.status_code == 429:
                break

        # Should hit rate limit
        assert response.status_code == 429

    def test_authorization_bypass(self):
        """Test authorization bypass attempts"""
        # Try to access admin endpoint as regular user
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/admin/')
        assert response.status_code in [403, 404]  # Forbidden or Not Found

    def test_sensitive_data_exposure(self):
        """Test sensitive data exposure"""
        self.client.force_authenticate(user=self.user)

        # Get user profile
        response = self.client.get('/api/account/me/')

        # Should not contain sensitive fields like password
        sensitive_fields = ['password', 'token', 'secret']
        data_str = str(response.data)

        for field in sensitive_fields:
            assert field not in data_str.lower()
```

#### 11.8 Code Coverage
**Run tests with coverage:**
```bash
# Run all tests with coverage
pytest --cov=apps --cov-report=html --cov-report=term-missing

# Generate coverage report
pytest --cov=apps --cov-report=html
```

### ✅ Phase 11 Completion Criteria
- [ ] Unit tests for models implemented
- [ ] Unit tests for views & serializers working
- [ ] Integration tests for API endpoints complete
- [ ] End-to-end testing with Cypress working
- [ ] Performance testing implemented
- [ ] Security testing complete
- [ ] Load testing with Locust working
- [ ] Code coverage reporting functional
- [ ] Test coverage > 80%

---

## 🚀 PHASE 12: DEPLOYMENT & PRODUCTION
**Timeline: 2-3 minggu | Developer: 1 DevOps**

### 🎯 Objectives
- Production deployment setup
- SSL certificate configuration
- CDN implementation
- Monitoring & logging setup
- Backup & disaster recovery
- CI/CD pipeline automation
- Performance optimization

### 📋 Checklist
- [ ] Production server setup
- [ ] Database optimization
- [ ] SSL certificate setup
- [] CDN implementation
- [ ] Monitoring & logging
- [ ] Backup & recovery
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Security hardening

### 🔧 Step-by-Step Implementation

#### 12.1 Production Server Setup
**Production Server Configuration:**
```bash
# Ubuntu 22.04 LTS Server Setup

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y

# Install Monitoring Tools
sudo apt install htop iotop -y
```

#### 12.2 Production Docker Compose
**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PWD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - tmc-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - tmc-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DEBUG=False
      - DJANGO_SETTINGS_MODULE=core.settings.production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PWD=${DB_PWD}
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - staticfiles:/app/staticfiles
      - mediafiles:/app/mediafiles
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - tmc-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - staticfiles:/var/www/static
      - mediafiles:/var/www/media
    depends_on:
      - backend
    networks:
      - tmc-network
    restart: unless-stopped

  monitoring:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - tmc-network
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - tmc-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  staticfiles:
  mediafiles:
  grafana_data:
  prometheus_data:

networks:
  tmc-network:
    driver: bridge
```

#### 12.3 Production Nginx Configuration
**nginx/nginx.prod.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upstream backend
    upstream backend {
        server backend:8000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name tmc.id www.tmc.id;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name tmc.id www.tmc.id;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/tmc.id.crt;
        ssl_certificate_key /etc/nginx/ssl/tmc.id.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Static files
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Content-Type-Options nosniff;
        }

        location /media/ {
            alias /var/www/media/;
            expires 1y;
            add_header Cache-Control "public";
            add_header X-Content-Type-Options nosniff;
        }

        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Authentication endpoints (stricter rate limiting)
        location /api/auth/ {
            limit_req zone=auth burst=10 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health/ {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Root path (SPA fallback)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Security configurations
        location ~ /\. {
            deny all;
        }

        location ~ ^/(config|\.env|\.git|docker-compose|Dockerfile) {
            deny all;
        }
    }
}
```

#### 12.4 Environment Configuration
**.env.prod:**
```bash
# Django Configuration
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
DJANGO_SETTINGS_MODULE=core.settings.production
ALLOWED_HOSTS=tmc.id,www.tmc.id

# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_NAME=tmc_production
DB_USER=tmc_user
DB_PWD=your-secure-password-here

# Redis Configuration
REDIS_URL=redis://redis:6379/0

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@tmc.id
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@tmc.id

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Firebase (Mobile)
FIREBASE_PROJECT_ID=tmc-mobile
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tmc-mobile.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Security
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Monitoring
GRAFANA_PASSWORD=your-grafana-password
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# File Storage
USE_S3=True
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=tmc-prod
AWS_S3_REGION_NAME=ap-southeast-1
```

#### 12.5 CI/CD Pipeline (GitHub Actions)
**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        pip install -r requirements-test.txt

    - name: Run tests
      run: |
        cd backend
        python manage.py test
        pytest --cov=apps --cov-fail-under=80

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage.xml

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2

    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}

    - name: Build and push Docker images
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: ${{ secrets.DOCKER_USERNAME }}/tmc-backend:latest

    - name: Deploy to production server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /path/to/tmc-api

          # Backup current database
          docker-compose exec -T db pg_dump $DB_NAME > /backups/backup_$(date +%Y%m%d_%H%M%S).sql

          # Pull latest images
          docker-compose -f docker-compose.prod.yml pull

          # Deploy new version
          docker-compose -f docker-compose.prod.yml up -d

          # Run migrations
          docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

          # Collect static files
          docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

          # Check health
          sleep 30
          curl -f http://localhost/health/

    - name: Run health checks
      run: |
        sleep 60
        curl -f https://tmc.id/health/ | grep "healthy"
```

#### 12.6 Monitoring Setup
**monitoring/grafana/dashboards/tmc-dashboard.json:**
```json
{
  "dashboard": {
    "id": null,
    "title": "TMC Application Dashboard",
    "tags": ["tmc", "django", "production"],
    "timezone": "Asia/Jakarta",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ],
        "gridPos": {
          "x": 0,
          "y": 0,
          "w": 12,
          "h": 8
        }
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ],
        "gridPos": {
          "x": 12,
          "y": 0,
          "w": 12,
          "h": 8
        }
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{status}}"
          }
        ],
        "gridPos": {
          "x": 0,
          "y": 8,
          "w": 12,
          "h": 8
        }
      },
      {
        "id": 4,
        "title": "Database Connections",
        "type": "graph",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Connections"
          }
        ],
        "gridPos": {
          "x": 12,
          "y": 8,
          "w": 12,
          "h": 8
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

#### 12.7 Backup Script
**scripts/backup.sh:**
```bash
#!/bin/bash

# TMC API Backup Script
set -e

# Configuration
BACKUP_DIR="/path/to/backups"
DB_NAME="tmc_production"
DB_USER="tmc_user"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Backing up database..."
docker-compose exec -T db pg_dump $DB_NAME -U $DB_USER > $BACKUP_DIR/db_backup_$DATE.sql

# Media files backup
echo "Backing up media files..."
tar -czf $BACKUP_DIR/media_backup_$DATE.tar.gz mediafiles/

# Static files backup
echo "Backing up static files..."
tar -czf $BACKUP_DIR/static_backup_$DATE.tar.gz staticfiles/

# Configuration files backup
echo "Backing up configuration..."
cp .env.prod $BACKUP_DIR/env_backup_$DATE
cp docker-compose.prod.yml $BACKUP_DIR/docker-compose_backup_$DATE

# Upload to cloud storage (optional)
if [ ! -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "Uploading to S3..."
    aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql s3://tmc-backups/database/
    aws s3 cp $BACKUP_DIR/media_backup_$DATE.tar.gz s3://tmc-backups/media/
    aws s3 cp $BACKUP_DIR/static_backup_$DATE.tar.gz s3://tmc-backups/static/
fi

# Clean old backups
echo "Cleaning old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully!"
echo "Files created:"
ls -la $BACKUP_DIR/*_$DATE.*
```

#### 12.8 Performance Optimization
**backend/core/settings/production.py:**
```python
# Performance optimization settings
INSTALLED_APPS += [
    'django.contrib.sessions.cache',
    'django.contrib.staticfiles',
]

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
    }
}

# Session configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Static files
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/app/logs/django.log',
            'maxBytes': 1024*1024*10,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'tmc': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### ✅ Phase 12 Completion Criteria
- [ ] Production server setup complete
- [ ] Database optimization implemented
- [ ] SSL certificate configured
- [ ] CDN implementation working
- [ ] Monitoring & logging set up
- [ ] Backup & recovery system working
- [ ] CI/CD pipeline functional
- [ ] Performance monitoring active
- [ ] Security hardening complete
- [ ] Documentation updated

---

## 📊 TIMELINE SUMMARY & ESTIMATES

| Phase | Duration | Team | Complexity | Dependencies |
|-------|----------|------|------------|------------|
| **Phase 1** | 2-3 days | 1 Backend + 1 DevOps | Low | None |
| **Phase 2** | 3-4 days | 1 Backend | Medium | Phase 1 |
| **Phase 3** | 7-8 days | 1 Backend | High | Phase 2 |
| **Phase 4** | 5-6 days | 1 Backend | Medium | Phase 2 |
| **Phase 5** | 6-7 days | 1 Backend | High | Phase 2,3,4 |
| **Phase 6** | 4-5 days | 1 Backend | Medium | Phase 1 |
| **Phase 7** | 5-6 days | 1 Backend | High | Phase 2 |
| **Phase 8** | 4-5 days | 1 Backend | Medium | Phase 2 |
| **Phase 9** | 8-10 weeks | 1 Mobile | High | Phases 1-8 |
| **Phase 10** | 6-8 weeks | 1 Frontend | High | Phases 1-8 |
| **Phase 11** | 4-6 weeks | 1 Backend + 1 QA | High | Phases 1-10 |
| **Phase 12** | 2-3 weeks | 1 DevOps | Medium | Phases 1-11 |

### **Total Timeline: 6-8 bulan**
### **Total Team Effort: ~45-55 person-weeks**

### **Recommended Deployment Strategy:**
1. **MVP Launch (Phases 1-5 + Mobile)**: 4-5 bulan
2. **Beta Launch (Phases 1-10)**: 6-7 bulan
3. **Full Launch (All Phases)**: 6-8 bulan

### **Critical Path Dependencies:**
```
Phase 1 → Phase 2 → Phase 3 → Phase 4,5,6,7,8 → Phase 9,10 → Phase 11 → Phase 12
```

---

## 🎯 CONCLUSION

Dokumentasi implementasi per phase ini memberikan panduan lengkap dan terstruktur untuk mengembangkan aplikasi TMC API dari nol hingga production-ready. Setiap phase mencakup:

✅ **Step-by-step implementation** dengan code examples
✅ **Checklist lengkap** untuk memastikan completion
✅ **Testing strategy** untuk validasi functionality
✅ **Best practices** untuk code quality dan security
✅ **Realistic timeline** dengan estimasi yang akurat
✅ **Team structure** yang optimal untuk setiap phase

Dengan mengikuti panduan ini secara sistematis, development team dapat membangun aplikasi TMC API yang:
- **Scalable** untuk menangani growth
- **Secure** dengan implementasi best practices
- **Maintainable** dengan code yang well-documented
- **Production-ready** dengan monitoring dan backup yang lengkap

**🚀 Ready to start development!**