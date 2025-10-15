# TMC API - Toyota Manufacturers Club API Documentation

## Project Overview

TMC API is a comprehensive Django REST API backend for mobile apps and web integration for Toyota Manufacturers Club (TMC). The system serves as the central data management and business logic hub for Toyota manufacturers community events, members, companies, and activities.

### Core Business Purpose
- Manage Toyota manufacturers community members and companies
- Organize and track events, registrations, and attendance
- Provide content management for blogs and company information
- Handle surveys and feedback collection
- Process payments and transactions
- Enable authentication via Google OAuth

---

## Technical Architecture

### 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         TMC API Backend                        │
│                    (Django REST Framework)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Blog      │ │   Event     │ │  Company    │ │   Survey    │ │
│  │   Module    │ │   Module    │ │   Module    │ │   Module    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Account   │ │Transaction  │ │Notification │ │ Reference   │ │
│  │   Module    │ │   Module    │ │   Module    │ │   Module    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Core Infrastructure Layer                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │Authentication│ │   Common    │ │  Payment    │ │   About     │ │
│  │   Module    │ │   Module    │ │ (Faspay)    │ │   Module    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Django    │ │   DRF       │ │ PostgreSQL  │ │   Docker    │ │
│  │   Core      │ │  Framework  │ │  Database   │ │ Container   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                    External Services & Integrations            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │   Google    │ │   Faspay    │ │   Mobile    │ │   Web       │ │
│  │   OAuth2    │ │  Payment    │ │   Apps      │ │ Dashboard   │ │
│  │             │ │  Gateway    │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Technology Stack

#### Backend Framework
- **Django 4.0.6** - Core web framework
- **Django REST Framework 3.13.1** - API development
- **Python 3.9** - Programming language

#### Database & Storage
- **PostgreSQL** - Primary database
- **Django ORM** - Database abstraction layer
- **Media files** - Image and file storage

#### Authentication & Security
- **Google OAuth2** - Social authentication
- **Django built-in authentication** - User management
- **Token-based authentication** - API security
- **CORS configuration** - Cross-origin request handling

#### Payment Integration
- **Faspay** - Payment gateway integration

#### Documentation & API
- **drf-yasg2** - OpenAPI/Swagger documentation
- **ReDoc** - API documentation interface

#### Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Gunicorn** - WSGI server
- **Nginx** - Reverse proxy and static file serving

### 3. Application Structure

#### Module Architecture
The project follows a modular Django apps architecture with clear separation of concerns:

```
backend/
├── core/                           # Django project configuration
│   ├── settings/
│   │   ├── base.py                # Base settings
│   │   ├── development.py         # Development settings
│   │   └── production.py          # Production settings
│   ├── libs/                      # Core utilities and helpers
│   │   ├── authentication/        # Authentication utilities
│   │   ├── certificate/           # Certificate generation
│   │   ├── rest_module/           # API response utilities
│   │   └── ...
│   └── urls.py                    # Main URL configuration
└── apps/                          # Django applications
    ├── Core Infrastructure Apps:   # Dependencies
    │   ├── common/                # Shared models (FileModel)
    │   ├── authentication/        # Authentication logic
    │   ├── account/               # User account management
    │   ├── transaction/           # Payment transactions
    │   ├── notification/          # Notification system
    │   ├── reference/             # Reference data
    │   └── survey/                # Survey and forms
    └── Business Logic Apps:        # Domain-specific features
        ├── company/               # Company management
        ├── event/                 # Event management
        ├── blog/                  # Content management
        ├── about/                 # About pages
        └── faspay/                # Payment integration
```

### 4. Database Schema Architecture

#### Core Entities
- **User** (Django built-in) - User accounts and authentication
- **FileModel** - Media file management (images, documents)
- **CompanyModel** - Company profiles and information
- **EventModel** - Event management and organization
- **BlogModel** - Content and blog management
- **Survey/Forms** - Dynamic form builder and responses

#### Relationship Patterns
- **One-to-Many**: User → Company, User → Events, User → Blog Posts
- **Many-to-Many**: Events ↔ Companies, Events ↔ Surveys, Blog ↔ Media Files
- **Generic Foreign Keys**: Survey responses for various models
- **Polymorphic Relationships**: Invoice items for different content types

---

## API Endpoints Documentation

### 1. Authentication Module (/authenticate/)

#### Google OAuth2 Integration
- `POST /google-token` - Exchange Google OAuth token for API token
- `GET /authenticate/login/` - Initiate OAuth2 flow

### 2. Company Module (/company/)

#### Endpoints
- `GET /company/` - List all companies
- `POST /company/` - Create new company
- `GET /company/{id}/` - Get company details
- `PUT /company/{id}/` - Update company
- `DELETE /company/{id}/` - Delete company

#### Models
```python
CompanyModel:
- nonce: UUID
- display_name: CharField(250)
- slug: CharField(250)
- address: TextField
- main_image: ForeignKey(FileModel)
- description: TextField
- contact: CharField(200)
- email: EmailField
- city: CharField(200)
- created_by: ForeignKey(User)

CompanyMemberModel:
- nonce: UUID
- is_pic: BooleanField
- invited_by: ForeignKey(User)
- transaction_number: CharField(10)
- user: ForeignKey(User)
- company: ForeignKey(CompanyModel)
```

### 3. Event Module (/event/)

#### Endpoints
- `GET /event/` - List events
- `POST /event/` - Create event
- `GET /event/{id}/` - Get event details
- `PUT /event/{id}/` - Update event
- `POST /event/{id}/register/` - Register for event
- `POST /event/{id}/attend/` - Mark attendance

#### Models
```python
EventModel:
- nonce: UUID
- title: CharField(250)
- date: DateTimeField
- venue: CharField(250)
- main_image: ForeignKey(FileModel)
- description: TextField
- level: CharField(200)
- is_free: BooleanField
- is_registration_close: BooleanField
- price: IntegerField
- published_at: DateField
- owned_by: ForeignKey(User)
- references: ManyToMany(ReferenceEventModel)
- medias: ManyToMany(FileModel)
- surveys: ManyToMany(FormBuilderModel)
- is_done: BooleanField

RegistrantModel:
- nonce: UUID
- certificate_number: CharField(128)
- is_attendance: BooleanField
- attendance_time: DateTimeField
- attendance: ForeignKey(User)
- event: ForeignKey(EventModel)
- published_at: DateTimeField
- response_survey: ManyToMany(FormBuilderModel)
- invited_by: ForeignKey(User)
```

### 4. Blog Module (/blog/)

#### Endpoints
- `GET /blog/` - List blog posts
- `POST /blog/` - Create blog post
- `GET /blog/{id}/` - Get blog details
- `PUT /blog/{id}/` - Update blog post
- `DELETE /blog/{id}/` - Delete blog post

#### Models
```python
BlogModel:
- title: CharField(200)
- summary: CharField(255)
- slug: SlugField
- main_image: ForeignKey(FileModel)
- content: TextField
- youtube_id: CharField(255)
- youtube_embeded: TextField
- owned_by: ForeignKey(User)
- albums: ManyToMany(FileModel)
```

### 5. Survey Module (/survey/)

#### Endpoints
- `GET /survey/` - List surveys
- `POST /survey/` - Create survey
- `GET /survey/{id}/` - Get survey details
- `POST /survey/{id}/respond/` - Submit survey response

#### Models
```python
FormBuilderModel:
- nonce: UUID
- title: CharField(250)
- description: TextField
- created_by: ForeignKey(User)
- questions: ManyToMany(QuestionModel)

QuestionModel:
- question_text: TextField
- question_type: CharField(30)
- description: TextField
- is_required: BooleanField
- parent: ForeignKey("self")
- options: ManyToMany(QuestionOptionModel)
- is_other_option: BooleanField
- init: CharField(250)

FormResponses:
- form: ForeignKey(FormBuilderModel)
- question: ForeignKey(QuestionModel)
- responses: TextField
- created_by: ForeignKey(User)
- content_type: ForeignKey(ContentType)
- object_id: PositiveIntegerField
- content_object: GenericForeignKey
```

### 6. Transaction Module (/transaction/)

#### Endpoints
- `GET /transaction/invoices/` - List invoices
- `POST /transaction/invoices/` - Create invoice
- `GET /transaction/invoices/{id}/` - Get invoice details
- `POST /transaction/payment/` - Process payment

#### Models
```python
Invoice:
- trx_id: CharField(20)
- number: CharField(50) - Auto-generated (I + base36 format)
- amount: IntegerField
- status: CharField(20)
- status_desc: CharField(50)
- payment_channel: CharField(20)
- payment_channel_desc: CharField(125)
- payment_date: DateTimeField
- no_va: CharField(20)
- log: JSONField
- owned_by: ForeignKey(User)

InvoiceItem:
- invoice: ForeignKey(Invoice)
- amount: IntegerField
- qty: PositiveIntegerField
- item_name: CharField(50)
- content_type: ForeignKey(ContentType)
- object_id: PositiveIntegerField
- content_object: GenericForeignKey
- owned_by: ForeignKey(User)
```

---

## Business Logic & Workflows

### 1. User Registration & Authentication Flow

```
1. User initiates login via Google OAuth2
2. Google authentication and consent
3. Callback to API with authorization code
4. Exchange code for access token
5. Retrieve user profile from Google
6. Create/update user in database
7. Generate API token for mobile app
8. Return user data and token to client
```

### 2. Event Management Workflow

```
Event Creation:
1. Admin/Company creates event
2. Set event details (title, date, venue, price)
3. Upload images and media
4. Configure registration settings
5. Publish event

Registration Process:
1. User browses events
2. Selects event and views details
3. Registers for event (free or paid)
4. For paid events: redirect to payment
5. Generate registration confirmation
6. Send notification/email confirmation

Attendance Management:
1. Check-in at event venue
2. Scan QR code or manual verification
3. Mark attendance in system
4. Generate certificate (if applicable)
5. Send completion notification
```

### 3. Company Management Workflow

```
Company Registration:
1. User creates company profile
2. Add company information and media
3. Invite members via email/transaction number
4. Members accept invitation
5. Company admin manages member roles

Company Events:
1. Company creates events under company profile
2. Members can register for company events
3. Track attendance and participation
4. Generate reports and analytics
```

### 4. Payment Processing Workflow

```
Payment Initiation:
1. User selects paid event/service
2. System creates invoice with unique number
3. Redirect to Faspay payment gateway
4. User selects payment method
5. Complete payment process

Payment Completion:
1. Faspay sends payment confirmation
2. System updates invoice status
3. Trigger confirmation notifications
4. Update registration status
5. Generate receipts/proof of payment
```

### 5. Survey & Feedback Workflow

```
Survey Creation:
1. Admin creates survey form
2. Add questions (multiple types supported)
3. Configure branching logic
4. Associate with events/content
5. Publish survey

Response Collection:
1. Users receive survey invitations
2. Complete survey responses
3. System collects and stores responses
4. Generate analytics and reports
5. Export data for analysis
```

---

## Product Requirements Document (PRD)

### 1. Vision & Goals

**Vision**: To create a comprehensive digital platform for Toyota Manufacturers Club that facilitates community engagement, event management, and company collaboration.

**Primary Goals**:
- Streamline event management and registration processes
- Enable seamless communication between Toyota manufacturers
- Provide centralized content and information management
- Facilitate payment processing for events and services
- Enable data-driven decision making through surveys and analytics

### 2. Target Users

**Primary User Personas**:

1. **TMC Administrators**
   - Manage overall platform operations
   - Create and manage events
   - Oversee company registrations
   - Generate reports and analytics

2. **Company Representatives**
   - Register and manage company profiles
   - Invite and manage company members
   - Create company-specific events
   - Track employee participation

3. **Individual Members**
   - Register personal profiles
   - Browse and register for events
   - Participate in surveys
   - Access content and resources

4. **Event Organizers**
   - Create and manage events
   - Track registrations and attendance
   - Generate certificates
   - Collect feedback

### 3. Core Features

#### 3.1 User Authentication & Profile Management
- Google OAuth2 integration
- User profile management
- Company association management
- Role-based permissions

#### 3.2 Company Management
- Company profile creation and management
- Member invitation system
- Role-based access within companies
- Company directory and search

#### 3.3 Event Management
- Event creation and scheduling
- Registration management (free and paid)
- Attendance tracking with QR codes
- Certificate generation
- Event analytics and reporting

#### 3.4 Content Management
- Blog/article publishing
- Media file management
- Content categorization
- SEO-friendly URLs

#### 3.5 Survey & Feedback System
- Dynamic form builder
- Multiple question types
- Conditional logic and branching
- Response collection and analysis
- Data export capabilities

#### 3.6 Payment Processing
- Integration with Faspay payment gateway
- Invoice generation and management
- Payment status tracking
- Receipt generation

#### 3.7 Notification System
- Email notifications
- In-app notifications
- SMS notifications (future enhancement)
- Notification preferences management

### 4. Functional Requirements

#### 4.1 Authentication Requirements
- **FR-AUTH-001**: Users must authenticate via Google OAuth2
- **FR-AUTH-002**: System must generate API tokens for mobile app access
- **FR-AUTH-003**: Password recovery through email
- **FR-AUTH-004**: Multi-factor authentication support (future)

#### 4.2 Company Management Requirements
- **FR-COMP-001**: Users can register and manage company profiles
- **FR-COMP-002**: Company admins can invite members via email or transaction number
- **FR-COMP-003**: Support for role-based permissions within companies
- **FR-COMP-004**: Company directory with search and filtering

#### 4.3 Event Management Requirements
- **FR-EVENT-001**: Admins can create events with detailed information
- **FR-EVENT-002**: Support for both free and paid events
- **FR-EVENT-003**: Event registration with capacity limits
- **FR-EVENT-004**: QR code-based attendance tracking
- **FR-EVENT-005**: Automatic certificate generation

#### 4.4 Payment Requirements
- **FR-PAY-001**: Integration with Faspay payment gateway
- **FR-PAY-002**: Support for multiple payment methods
- **FR-PAY-003**: Automatic invoice generation
- **FR-PAY-004**: Payment status tracking and notifications

#### 4.5 Content Management Requirements
- **FR-CONTENT-001**: Blog post creation and management
- **FR-CONTENT-002**: Media file upload and organization
- **FR-CONTENT-003**: Content categorization and tagging
- **FR-CONTENT-004**: Content scheduling and publishing

#### 4.6 Survey Requirements
- **FR-SURVEY-001**: Dynamic form builder with multiple question types
- **FR-SURVEY-002**: Conditional logic and question branching
- **FR-SURVEY-003**: Response collection and analysis
- **FR-SURVEY-004**: Data export in multiple formats

### 5. Non-Functional Requirements

#### 5.1 Performance Requirements
- **NFR-PERF-001**: API response time < 500ms for 95% of requests
- **NFR-PERF-002**: Support for 1000+ concurrent users
- **NFR-PERF-003**: Database query optimization for large datasets
- **NFR-PERF-004**: Efficient image/media file serving

#### 5.2 Security Requirements
- **NFR-SEC-001**: All API endpoints must be secured
- **NFR-SEC-002**: HTTPS/TLS encryption for all communications
- **NFR-SEC-003**: Secure storage of sensitive data
- **NFR-SEC-004**: Regular security audits and updates

#### 5.3 Reliability Requirements
- **NFR-REL-001**: 99.9% uptime availability
- **NFR-REL-002**: Automated backup and recovery procedures
- **NFR-REL-003**: Graceful error handling and recovery
- **NFR-REL-004**: Monitoring and alerting system

#### 5.4 Scalability Requirements
- **NFR-SCALE-001**: Horizontal scaling capability
- **NFR-SCALE-002**: Database sharding support (future)
- **NFR-SCALE-003**: CDN integration for static assets
- **NFR-SCALE-004**: Load balancing for high traffic

### 6. Technical Specifications

#### 6.1 API Specifications
- RESTful API design following OpenAPI 3.0
- JSON request/response format
- Token-based authentication
- Comprehensive error handling
- Rate limiting and throttling

#### 6.2 Database Specifications
- PostgreSQL primary database
- Foreign key constraints for data integrity
- Indexing for performance optimization
- Migration management

#### 6.3 Integration Specifications
- Google OAuth2 for authentication
- Faspay for payment processing
- Email service for notifications
- CDN for media delivery

### 7. Deployment & Infrastructure

#### 7.1 Development Environment
- Docker containerization
- Development database with sample data
- Hot reloading for development
- Debug logging and monitoring

#### 7.2 Production Environment
- Docker Compose orchestration
- Nginx reverse proxy
- Gunicorn WSGI server
- PostgreSQL database
- Automated deployment pipeline

#### 7.3 Monitoring & Maintenance
- Application performance monitoring
- Error tracking and logging
- Database performance monitoring
- Security vulnerability scanning

### 8. Future Enhancements

#### 8.1 Mobile Application
- Native mobile apps (iOS/Android)
- Push notifications
- Offline capabilities
- Mobile-specific features

#### 8.2 Advanced Analytics
- Event attendance analytics
- User behavior tracking
- Business intelligence dashboard
- Predictive analytics

#### 8.3 Integration Enhancements
- CRM system integration
- Social media integration
- Third-party calendar integration
- Video conferencing integration

#### 8.4 Advanced Features
- AI-powered recommendations
- Machine learning for user personalization
- Blockchain for certificate verification
- IoT integration for event management

---

## Conclusion

The TMC API represents a comprehensive, scalable solution for Toyota Manufacturers Club community management. The architecture supports current requirements while providing flexibility for future enhancements. The modular design ensures maintainability and extensibility, while the Django REST Framework provides a solid foundation for API development.

The system successfully addresses the core business needs of event management, user authentication, company management, and payment processing while maintaining high standards for security, performance, and reliability.

---

*This documentation reflects the current state of the TMC API as of the analysis date. For the most up-to-date information, please refer to the source code and API documentation.*