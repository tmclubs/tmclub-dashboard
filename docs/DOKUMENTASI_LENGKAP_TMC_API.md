# DOKUMENTASI LENGKAP TMC API

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Backend Architecture](#backend-architecture)
3. [Database Models](#database-models)
4. [API Endpoints](#api-endpoints)
5. [Business Logic](#business-logic)
6. [Frontend Architecture](#frontend-architecture)
7. [Mobile App Architecture](#mobile-app-architecture)
8. [Security & Authentication](#security--authentication)
9. [Deployment & Configuration](#deployment--configuration)
10. [Integration & External Services](#integration--external-services)

---

## 🚀 PROJECT OVERVIEW

**TMC API** adalah sistem manajemen event membership untuk Toyota Manufacturers Club yang dikembangkan dengan Django REST API backend dan Flutter mobile + React web frontend.

### Teknologi Stack
- **Backend**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL
- **Mobile**: Flutter 2.16.2+ dengan GetX state management
- **Web**: React 18.2 + TypeScript + Vite
- **Authentication**: OAuth2 (Google, Facebook, Apple) + Token-based
- **Deployment**: Docker + Nginx

### Fitur Utama
- ✅ Multi-role authentication (admin, PIC, member)
- ✅ Event management dengan registrasi & pembayaran
- ✅ Blog & content management system
- ✅ Company & member management
- ✅ Survey & form builder
- ✅ Real-time notifications
- ✅ QR code check-in
- ✅ Certificate generation
- ✅ Payment gateway integration

---

## 🏗️ BACKEND ARCHITECTURE

### Project Structure
```
backend/
├── core/                    # Django project configuration
│   ├── settings/
│   │   ├── base.py         # Base settings
│   │   ├── production.py   # Production settings
│   │   └── development.py  # Development settings
│   ├── urls.py             # Root URL configuration
│   ├── wsgi.py             # WSGI configuration
│   └── asgi.py             # ASGI configuration
└── apps/                   # Django applications
    ├── authentication/     # Autentikasi & OAuth
    ├── account/           # Akun & profil pengguna
    ├── common/            # Fungsi umum & file management
    ├── transaction/       # Pembayaran & transaksi
    ├── notification/      # Sistem notifikasi
    ├── reference/         # Data referensi umum
    ├── survey/            # Form builder & survey
    ├── company/           # Manajemen perusahaan
    ├── event/             # Manajemen event
    ├── blog/              # Blog & konten
    ├── about/             # Informasi organisasi
    └── faspay/            # Integrasi pembayaran Faspay
```

### Application Dependencies

#### Core Infrastructure Apps
1. **authentication** - Manajemen autentikasi OAuth2
2. **account** - Akun pengguna dan manajemen peran
3. **common** - File management dan fungsi umum
4. **transaction** - Sistem pembayaran dan invoice
5. **notification** - Sistem notifikasi real-time
6. **reference** - Data referensi umum
7. **survey** - Dynamic form builder dan survey

#### Business Logic Apps
8. **company** - Manajemen perusahaan dan keanggotaan
9. **event** - Manajemen event dan registrasi
10. **blog** - Sistem blog dan konten
11. **about** - Informasi organisasi
12. **faspay** - Integrasi pembayaran (belum aktif)

---

## 🗄️ DATABASE MODELS

### User & Authentication Models

#### User Model (Django Default)
```python
class User(AbstractUser):
    # Django user dengan field standar
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
```

#### CompanyMemberModel (`apps/company.models`)
```python
class CompanyMemberModel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company = models.ForeignKey(CompanyModel, on_delete=models.CASCADE)
    is_pic = models.BooleanField(default=False)  # Person In Charge
    transaction_number = models.CharField(max_length=255, null=True, blank=True)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True,
                                   related_name='invited_members')
    invited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'company']
```

**Logic & Method:**
- `is_pic` menandakan user sebagai PIC (Person In Charge) perusahaan
- `transaction_number` digunakan untuk Virtual Account (VA) pembayaran
- Auto-tracking siapa yang mengundang member (`invited_by`)

### Company & Event Models

#### CompanyModel (`apps.company.models`)
```python
class CompanyModel(models.Model):
    display_name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    contact = models.CharField(max_length=100)
    email = models.EmailField()
    main_image = models.ForeignKey(FileModel, on_delete=models.SET_NULL, null=True)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.display_name)
        super().save(*args, **kwargs)
```

#### EventModel (`apps.event.models`)
```python
class EventModel(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateTimeField()
    venue = models.CharField(max_length=255)
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_registration_close = models.BooleanField(default=False)
    is_list_attendees = models.BooleanField(default=True)
    is_done = models.BooleanField(default=False)
    owned_by = models.ForeignKey(User, on_delete=models.CASCADE)
    main_image = models.ForeignKey(FileModel, on_delete=models.SET_NULL, null=True)
    references = models.ManyToManyField(ReferenceEventModel, blank=True)
    medias = models.ManyToManyField(FileModel, blank=True, related_name='event_medias')
    surveys = models.ManyToManyField(FormBuilderModel, blank=True)
    nonce = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### RegistrantModel (`apps.event.models`)
```python
class RegistrantModel(models.Model):
    event = models.ForeignKey(EventModel, on_delete=models.CASCADE, related_name='registrants')
    attendance = models.ForeignKey(User, on_delete=models.CASCADE, related_name='event_registrants')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invited_registrants')
    certificate_number = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_attendance = models.BooleanField(default=False)
    attendance_time = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)

    def publish(self):
        """Publish registration dengan timestamp"""
        self.published_at = timezone.now()
        self.save()

    def generate_certificate_number(self):
        """Generate nomor sertifikat format: 000X - TMC/ROMAN/THN"""
        if not self.certificate_number:
            year = self.event.date.year
            roman_numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
            month = roman_numerals[self.event.date.month - 1]
            count = RegistrantModel.objects.filter(event__date__year=year).count() + 1
            self.certificate_number = f"{count:04d} - TMC/{month}/{year}"
            self.save()
```

#### BarcodeEventModel (`apps.event.models`)
```python
class BarcodeEventModel(models.Model):
    event = models.OneToOneField(EventModel, on_delete=models.CASCADE)
    barcode = models.ImageField(upload_to='qr_codes/')
    is_open = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        """Generate QR Code otomatis berdasarkan event.nonce"""
        if not self.barcode and self.event.nonce:
            qr = qrcode.QRCode(version=1, box_size=10, border=2)
            qr.add_data(self.event.nonce)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            # Create canvas 370x370 with logo in center
            canvas = Image.new('RGB', (370, 370), 'white')
            logo = Image.open('path/to/logo.png').resize((100, 100))

            canvas.paste(img, ((370-300)//2, 50))
            canvas.paste(logo, ((370-100)//2, (370-100)//2))

            # Save to BytesIO
            buffer = BytesIO()
            canvas.save(buffer, format='JPEG')
            self.barcode.save(f'qr_{self.event.nonce}.jpg', ContentFile(buffer.getvalue()))

        super().save(*args, **kwargs)
```

### Transaction & Payment Models

#### Invoice (`apps.transaction.models`)
```python
class Invoice(models.Model):
    trx_id = models.CharField(max_length=255, unique=True)
    number = models.CharField(max_length=255, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.IntegerField(default=101)  # 101=Pending, 102=Cancel, 201=Success
    status_desc = models.CharField(max_length=255)
    payment_channel = models.CharField(max_length=100, null=True, blank=True)
    no_va = models.CharField(max_length=255, null=True, blank=True)
    log = models.JSONField(default=dict, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def create_number(cls):
        """Generate invoice number format: I + base36"""
        import base36
        timestamp = int(time.time() * 1000)
        return f"I{base36.dumps(timestamp).upper()}"

    def get_formatted_amount(self):
        """Format amount ke Rupiah"""
        return f"Rp {self.amount:,.0f}".replace(',', '.')

    def get_items(self):
        """Get semua invoice items"""
        return self.items.all()
```

#### InvoiceItem (`apps.transaction.models`)
```python
class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    item_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    qty = models.IntegerField(default=1)

    def get_total_amount(self):
        """Hitung total amount (qty * amount)"""
        return self.amount * self.qty

    def get_type_item(self):
        """Get tipe item dari content_type"""
        return self.content_type.model
```

### Notification Models

#### Notification (`apps.notification.models`)
```python
class Notification(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    owned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    button = models.ForeignKey(NotificationButton, on_delete=models.SET_NULL, null=True, blank=True)

    # Generic foreign key untuk berbagai model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.PositiveIntegerField(null=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
```

#### NotificationButton (`apps.notification.models`)
```python
class NotificationButton(models.Model):
    label = models.CharField(max_length=50)
    api_url = models.URLField(max_length=255, null=True, blank=True)
    deeplink = models.URLField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.label
```

### Survey & Form Builder Models

#### FormBuilderModel (`apps.survey.models`)
```python
class FormBuilderModel(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    questions = models.ManyToManyField('QuestionModel', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
```

#### QuestionModel (`apps.survey.models`)
```python
class QuestionModel(models.Model):
    QUESTION_TYPES = [
        ('text', 'Text'),
        ('textarea', 'Textarea'),
        ('radio', 'Radio Button'),
        ('checkbox', 'Checkbox'),
        ('select', 'Dropdown'),
        ('file', 'File Upload'),
        ('date', 'Date'),
        ('time', 'Time'),
        ('rating', 'Rating'),
    ]

    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    is_required = models.BooleanField(default=False)
    is_other_option = models.BooleanField(default=False)
    options = models.ManyToManyField('QuestionOptionModel', blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.question_text[:50]
```

#### FormResponses (`apps.survey.models`)
```python
class FormResponses(models.Model):
    form = models.ForeignKey(FormBuilderModel, on_delete=models.CASCADE)
    question = models.ForeignKey(QuestionModel, on_delete=models.CASCADE)
    responses = models.JSONField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    # Generic foreign key untuk menampung response dari event atau model lain
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True)
    object_id = models.PositiveIntegerField(null=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    created_at = models.DateTimeField(auto_now_add=True)
```

### Blog Models

#### BlogModel (`apps.blog.models`)
```python
class BlogModel(models.Model):
    title = models.CharField(max_length=255)
    summary = models.TextField()
    content = models.TextField()
    slug = models.SlugField(max_length=255, unique=True)
    youtube_id = models.CharField(max_length=50, null=True, blank=True)
    youtube_embeded = models.URLField(max_length=500, null=True, blank=True)
    owned_by = models.ForeignKey(User, on_delete=models.CASCADE)
    albums = models.ManyToManyField(FileModel, blank=True)
    main_image = models.ForeignKey(FileModel, on_delete=models.SET_NULL, null=True,
                                  related_name='blog_main_image')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """Generate slug otomatis dengan penanganan duplikat"""
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while BlogModel.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug
        super().save(*args, **kwargs)
```

### Common Models

#### FileModel (`apps.common.models`)
```python
class FileModel(models.Model):
    display_name = models.CharField(max_length=255)
    caption = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='uploads/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.display_name

    @classmethod
    def from_base64(cls, base64_string, display_name, caption=None):
        """Create FileModel dari base64 string"""
        import base64
        from django.core.files.base import ContentFile

        format, imgstr = base64_string.split(';base64,')
        ext = format.split('/')[-1]
        data = ContentFile(base64.b64decode(imgstr), name=f'{display_name}.{ext}')

        return cls.objects.create(
            display_name=display_name,
            caption=caption,
            image=data
        )
```

---

## 🔌 API ENDPOINTS

### Authentication Endpoints

#### 1. OAuth Authentication
```
POST /api/authentication/oauth/
Content-Type: application/json

Request:
{
    "access_token": "google_access_token",
    "backend": "google-oauth2"  // google-oauth2, facebook, apple-id
}

Response (201):
{
    "token": "jwt_token_here",
    "email": "user@example.com",
    "is_active": true
}
```

#### 2. Manual Login (Password)
```
POST /api/authentication/basic-login/
Content-Type: application/json

Request:
{
    "phone_number": "user@example.com",
    "password": "password123",
    "device_id": "optional_device_id"
}

Response (200):
{
    "token": "jwt_token_here",
    "email": "user@example.com"
}

Response (202): // User belum ada
{
    "register_token": "register_token_here",
    "email": "user@example.com"
}
```

#### 3. Manual Login (Username)
```
POST /api/authentication/manual-login/
Content-Type: application/json

Request:
{
    "username": "username",
    "password": "password123"
}

Response (200):
{
    "token": "jwt_token_here",
    "user": {
        "id": 1,
        "username": "username",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe"
    },
    "role": "member",  // admin, pic, member
    "login_method": "manual",
    "is_pic": false,
    "is_staff": false
}
```

#### 4. Get User Profile
```
GET /api/account/me/
Authorization: Token token_here

Response (200):
{
    "id": 1,
    "username": "username",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "event_registered": [
        {
            "id": 1,
            "title": "Event Title",
            "date": "2024-01-15T10:00:00Z"
        }
    ],
    "role": "member",
    "company": {
        "id": 1,
        "display_name": "Company Name"
    },
    "is_pic": false
}
```

### Company Endpoints

#### 1. Create Company
```
POST /api/company/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "display_name": "PT Example Company",
    "address": "Jl. Example No. 123",
    "city": "Jakarta",
    "contact": "021-12345678",
    "email": "company@example.com",
    "main_image": "file_id_or_base64",
    "description": "Company description"
}

Response (201):
{
    "id": 1,
    "display_name": "PT Example Company",
    "slug": "pt-example-company",
    "address": "Jl. Example No. 123",
    "city": "Jakarta",
    "contact": "021-12345678",
    "email": "company@example.com",
    "main_image": {
        "id": 1,
        "display_name": "company_logo",
        "image": "/uploads/company_logo.jpg"
    },
    "description": "Company description",
    "created_by": 1
}
```

#### 2. Invite Company Member
```
POST /api/company/{pk}/invite/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "action": "invite",  // invite, invite-pic, remove-member, remove-pic
    "email": "member@example.com"
}

Response (200):
{
    "message": "Invitation sent successfully",
    "user": {
        "id": 2,
        "email": "member@example.com",
        "first_name": "Jane",
        "last_name": "Doe"
    }
}
```

#### 3. Set VA Number
```
POST /api/company/{pk}/set-va/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "email": "company@example.com",
    "transaction_number": "8276081234567890"
}

Response (200):
{
    "message": "VA number updated successfully",
    "transaction_number": "8276081234567890",
    "email": "company@example.com"
}
```

### Event Endpoints

#### 1. Create Event
```
POST /api/event/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "title": "Tech Conference 2024",
    "date": "2024-03-15T09:00:00Z",
    "venue": "Jakarta Convention Center",
    "is_free": false,
    "price": "500000.00",
    "main_image": "file_id_or_base64",
    "references": [
        {
            "display_name": "Reference 1",
            "url": "https://example.com"
        }
    ]
}

Response (201):
{
    "id": 1,
    "title": "Tech Conference 2024",
    "date": "2024-03-15T09:00:00Z",
    "venue": "Jakarta Convention Center",
    "is_free": false,
    "price": "500000.00",
    "is_registration_close": false,
    "is_list_attendees": true,
    "is_done": false,
    "nonce": "unique_nonce_here",
    "main_image": {...},
    "references": [...],
    "owned_by": 1
}
```

#### 2. Event Registration (Member)
```
POST /api/event/{pk}/registration/
Authorization: Token token_here

Response (201):
{
    "message": "Registration successful",
    "registration": {
        "id": 1,
        "event": 1,
        "attendance": 2,
        "certificate_number": "0001 - TMC/III/2024",
        "is_attendance": false,
        "published_at": "2024-01-01T10:00:00Z"
    },
    "invoice": null  // null jika event gratis
}
```

#### 3. Event Registration (PIC with Payment)
```
POST /api/event/{pk}/registration-pic/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "users": ["user1@example.com", "user2@example.com"]
}

Response (201):
{
    "message": "PIC registration successful",
    "registrants": [
        {
            "id": 1,
            "email": "user1@example.com",
            "certificate_number": "0001 - TMC/III/2024"
        },
        {
            "id": 2,
            "email": "user2@example.com",
            "certificate_number": "0002 - TMC/III/2024"
        }
    ],
    "invoice": {
        "number": "IABC123XYZ",
        "amount": "1000000.00",
        "status": 101,
        "no_va": "8276081234567890"
    }
}
```

#### 4. Download Certificate
```
GET /api/event/{pk}/download-certificate/
Authorization: Token token_here

Response (200):
Content-Type: image/jpeg
Content-Disposition: attachment; filename="certificate.jpg"

// Binary image data untuk sertifikat
```

### Transaction Endpoints

#### 1. Get Invoices
```
GET /api/transaction/
Authorization: Token token_here
Query Parameters:
- user_id: Filter by user
- status: Filter by status (101=Pending, 201=Success, etc.)
- amount: Filter by amount

Response (200):
{
    "count": 10,
    "next": "http://api/transaction/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "trx_id": "TRX123456",
            "number": "IABC123XYZ",
            "user": {
                "id": 1,
                "email": "user@example.com"
            },
            "amount": "500000.00",
            "status": 101,
            "status_desc": "Pending",
            "payment_channel": "BCA VA",
            "no_va": "8276081234567890",
            "created_at": "2024-01-01T10:00:00Z",
            "items": [
                {
                    "item_name": "Event Registration",
                    "amount": "500000.00",
                    "qty": 1,
                    "get_total_amount": "500000.00"
                }
            ]
        }
    ]
}
```

#### 2. Set Payment Method
```
POST /api/transaction/{number}/payment-method/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "payment_method_id": "bca_va"
}

Response (200):
{
    "id": 1,
    "number": "IABC123XYZ",
    "status": 101,
    "no_va": "8276081234567890",  // Diambil dari company transaction_number
    "payment_channel": "BCA VA",
    "status_desc": "Pending Payment"
}
```

### Blog Endpoints

#### 1. Create Blog
```
POST /api/blog/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "title": "Tech Innovation Article",
    "summary": "Brief summary of the article",
    "content": "Full article content with markdown support",
    "main_image": "file_id_or_base64",
    "albums": ["file_id_1", "file_id_2"],
    "youtube_id": "dQw4w9WgXcQ"
}

Response (201):
{
    "id": 1,
    "title": "Tech Innovation Article",
    "summary": "Brief summary of the article",
    "content": "Full article content...",
    "slug": "tech-innovation-article",
    "youtube_id": "dQw4w9WgXcQ",
    "youtube_embeded": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "owned_by": 1,
    "main_image": {...},
    "albums": [...],
    "created_at": "2024-01-01T10:00:00Z"
}
```

#### 2. Get Blog by Slug
```
GET /api/blog/slug/{slug}/

Response (200):
{
    "id": 1,
    "title": "Tech Innovation Article",
    "summary": "Brief summary",
    "content": "Full content...",
    "slug": "tech-innovation-article",
    "youtube_embeded": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "main_image": {...},
    "albums": [...],
    "created_at": "2024-01-01T10:00:00Z"
}
```

### Notification Endpoints

#### 1. Get Notifications
```
GET /api/notification/
Authorization: Token token_here
Query Parameters:
- status: read/unread (default: all)

Response (200):
{
    "count": 15,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "title": "Event Registration Success",
            "summary": "You have been registered for Tech Conference 2024",
            "body": "Full notification message...",
            "is_read": false,
            "button": {
                "label": "View Event",
                "api_url": "/api/event/1/",
                "deeplink": "tmcapp://event/1"
            },
            "created_at": "2024-01-01T10:00:00Z"
        }
    ]
}
```

#### 2. Mark All as Read
```
POST /api/notification/mark-read-all/
Authorization: Token token_here

Response (200):
{
    "message": "All notifications marked as read",
    "count": 15
}
```

### Survey Endpoints

#### 1. Create Survey
```
POST /api/survey/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "title": "Event Feedback Survey",
    "description": "Please provide your feedback",
    "questions": [
        {
            "question_text": "How satisfied are you with the event?",
            "question_type": "rating",
            "is_required": true
        },
        {
            "question_text": "What can we improve?",
            "question_type": "textarea",
            "is_required": false
        }
    ]
}

Response (201):
{
    "id": 1,
    "title": "Event Feedback Survey",
    "description": "Please provide your feedback",
    "created_by": 1,
    "questions": [...],
    "created_at": "2024-01-01T10:00:00Z"
}
```

#### 2. Submit Survey Response
```
POST /api/survey/{id}/response/
Authorization: Token token_here
Content-Type: application/json

Request:
{
    "responses": [
        {
            "question_id": 1,
            "response": "5"  // Rating value
        },
        {
            "question_id": 2,
            "response": "The event was well organized"
        }
    ],
    "content_type": "event",
    "object_id": 1
}

Response (201):
{
    "message": "Survey response submitted successfully",
    "response_id": 123
}
```

---

## ⚙️ BUSINESS LOGIC

### Registration Flow

#### Member Registration
1. **Request**: User klik registrasi event
2. **Validation**: Cek apakah user sudah terdaftar
3. **Create Registrant**: Buat `RegistrantModel`
4. **Publish**: Set `published_at` timestamp
5. **Certificate**: Generate nomor sertifikat otomatis
6. **Payment**: Jika event berbayar, buat `Invoice`
7. **Notification**: Kirim notifikasi ke user

#### PIC Registration (Bulk)
1. **Request**: PIC input list email user
2. **Validation**: Validasi setiap email
3. **Create Users**: Buat user baru jika belum ada
4. **Create Registrants**: Bulk create `RegistrantModel`
5. **Generate Certificates**: Generate nomor sertifikat untuk semua
6. **Create Invoice**: Satu invoice untuk semua user
7. **Send Notifications**: Email dan notifikasi ke semua user

### Payment Flow

#### Invoice Generation
```python
# Logic di EventRegistrationView
if not event.is_free:
    # Create invoice untuk setiap registrant
    invoice = Invoice.objects.create(
        user=registrant.attendance,
        amount=event.price,
        status=101,  # Pending
        status_desc="Pending Payment"
    )

    # Create invoice item
    InvoiceItem.objects.create(
        invoice=invoice,
        content_object=event,
        item_name=f"Registration: {event.title}",
        amount=event.price,
        qty=1
    )
```

#### VA Number Assignment
```python
# Logic di PaymentMethodView
company_member = CompanyMemberModel.objects.get(
    user=invoice.user,
    company__members__event=event
)
invoice.no_va = company_member.transaction_number
invoice.payment_channel = "Company VA"
invoice.save()
```

### Certificate Generation

#### Number Format
```
Format: [4-digit sequence] - TMC/[Roman Month]/[Year]
Example: 0001 - TMC/III/2024
```

#### Generation Logic
```python
def generate_certificate_number(self):
    year = self.event.date.year
    roman_months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
    month = roman_months[self.event.date.month - 1]

    # Count existing certificates for this year
    count = RegistrantModel.objects.filter(
        event__date__year=year
    ).count() + 1

    self.certificate_number = f"{count:04d} - TMC/{month}/{year}"
    self.save()
```

### QR Code Generation

#### Event QR Code
```python
def generate_qr_code(self):
    # Generate QR dengan event nonce
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(self.event.nonce)  # Unique identifier
    qr.make(fit=True)

    # Create image dengan logo di tengah
    img = qr.make_image(fill_color="black", back_color="white")
    canvas = Image.new('RGB', (370, 370), 'white')

    # Paste QR code
    canvas.paste(img, ((370-300)//2, 50))

    # Paste logo di center
    logo = Image.open('static/images/logo.png').resize((100, 100))
    canvas.paste(logo, ((370-100)//2, (370-100)//2))

    return canvas
```

### Survey Logic

#### Dynamic Form Builder
- **Question Types**: Text, textarea, radio, checkbox, select, file, date, time, rating
- **Hierarchical Questions**: Parent-child relationship untuk conditional logic
- **Branch Logic**: Show/hide questions based on previous answers
- **Generic Responses**: Response bisa linked ke event atau model lain

### Notification Logic

#### Generic Foreign Key
```python
# Notification bisa terkait dengan model apapun
class Notification(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

# Usage examples
# Event notification
Notification.objects.create(
    title="Event Registration",
    content_object=event,
    owned_by=user
)

# Invoice notification
Notification.objects.create(
    title="Payment Required",
    content_object=invoice,
    owned_by=user
)
```

#### Action Buttons
```python
# Notification dengan action button
Notification.objects.create(
    title="Event Registration Success",
    button=NotificationButton.objects.create(
        label="View Event",
        api_url="/api/event/1/",
        deeplink="tmcapp://event/1"
    )
)
```

---

## 💻 FRONTEND ARCHITECTURE (WEB)

### Technology Stack
- **Framework**: React 18.2 + TypeScript 5.0.2
- **Build Tool**: Vite 4.4.0
- **State Management**: Zustand dengan persistence
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM 6.30.1
- **Styling**: Tailwind CSS 3.3.0
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Headless UI + Lucide Icons

### Project Structure
```
tmc_frontend/
├── src/
│   ├── components/           # Reusable Components
│   │   ├── auth/            # Authentication components
│   │   ├── charts/          # Analytics charts
│   │   ├── features/         # Feature-based components
│   │   │   ├── analytics/   # Analytics dashboard
│   │   │   ├── auth/        # Login, register, profile
│   │   │   ├── blog/        # Blog management
│   │   │   ├── companies/   # Company directory
│   │   │   ├── events/      # Event management
│   │   │   ├── members/     # Member management
│   │   │   ├── notifications/ # Notification center
│   │   │   └── profile/     # User profile
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Base UI components
│   ├── lib/                 # Core libraries
│   │   ├── api/             # API service layer
│   │   │   ├── client.ts    # HTTP client configuration
│   │   │   ├── auth.ts      # Authentication API
│   │   │   ├── events.ts    # Event API
│   │   │   ├── blog.ts      # Blog API
│   │   │   ├── companies.ts # Company API
│   │   │   ├── transactions.ts # Transaction API
│   │   │   ├── notifications.ts # Notification API
│   │   │   └── surveys.ts   # Survey API
│   │   ├── auth/            # Authentication system
│   │   │   ├── token-manager.ts # Auto-refresh token
│   │   │   ├── error-codes.ts # Error handling
│   │   │   └── google-oauth.ts # Google OAuth
│   │   ├── stores/          # Zustand stores
│   │   │   └── authStore.ts # Auth state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── config/          # Configuration
│   ├── pages/               # Page components
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard pages
│   │   └── NotFound.tsx     # 404 page
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # Global styles
│   ├── App.tsx              # Root app component
│   └── main.tsx             # App entry point
├── public/                  # Static assets
├── dist/                    # Build output
└── package.json             # Dependencies
```

### State Management (Zustand)

#### Auth Store
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: 'admin' | 'pic' | 'member' | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,

      login: async (credentials) => {
        try {
          const response = await authApi.login(credentials);
          const { user, token, role } = response.data;

          set({
            user,
            token,
            role,
            isAuthenticated: true
          });

          // Set token untuk API calls
          apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          role: null
        });

        // Clear token
        delete apiClient.defaults.headers.common['Authorization'];
      },

      refreshToken: async () => {
        const { token } = get();
        if (token) {
          try {
            const response = await authApi.refreshToken();
            const { token: newToken } = response.data;

            set({ token: newToken });
            apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`;
          } catch (error) {
            get().logout();
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

### API Client Configuration

#### HTTP Client
```typescript
// lib/api/client.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk auto-authentication
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor untuk auto-refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshToken();
        const token = useAuthStore.getState().token;

        if (token) {
          originalRequest.headers.Authorization = `Token ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```

### API Services

#### Auth API
```typescript
// lib/api/auth.ts
import { apiClient } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface GoogleOAuthCredentials {
  access_token: string;
  backend: 'google-oauth2' | 'facebook' | 'apple-id';
}

export interface AuthResponse {
  token: string;
  user: User;
  role: 'admin' | 'pic' | 'member';
  login_method: 'manual' | 'oauth';
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/authentication/manual-login/', credentials);
    return response.data;
  },

  loginWithOAuth: async (credentials: GoogleOAuthCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/authentication/oauth/', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/account/me/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch('/account/update-me/', data);
    return response.data;
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    const response = await apiClient.post('/authentication/refresh/');
    return response.data;
  }
};
```

### Custom Hooks

#### Use Auth Hook
```typescript
// lib/hooks/useAuth.ts
import { useAuthStore } from '../stores/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';

export const useAuth = () => {
  const { user, token, isAuthenticated, role, login, logout } = useAuthStore();
  const queryClient = useQueryClient();

  // Get user profile
  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.data);
      queryClient.setQueryData(['profile'], data.data.user);
    },
  });

  // OAuth login mutation
  const oauthLoginMutation = useMutation({
    mutationFn: authApi.loginWithOAuth,
    onSuccess: (data) => {
      login(data.data);
      queryClient.setQueryData(['profile'], data.data.user);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data.data);
    },
  });

  return {
    user: profile || user,
    token,
    isAuthenticated,
    role,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    loginWithOAuth: oauthLoginMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    logout,
  };
};
```

### React Query Integration

#### Events API Hook
```typescript
// lib/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../api/events';

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
  });
};

export const useRegisterEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.registerEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
```

### Components Architecture

#### Event Card Component
```typescript
// components/features/events/EventCard.tsx
import React from 'react';
import { Event } from '../../../types';
import { format } from 'date-fns';
import { Button } from '../../ui/button';
import { useRegisterEvent } from '../../../hooks/useEvents';

interface EventCardProps {
  event: Event;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isRegistered }) => {
  const registerMutation = useRegisterEvent();

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync(event.id);
      // Show success notification
    } catch (error) {
      // Show error notification
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>📅 {format(new Date(event.date), 'PPP')}</p>
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

        {!isRegistered && !event.is_registration_close && (
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
      </div>
    </div>
  );
};
```

### Routing & Navigation

#### Protected Routes
```typescript
// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'pic' | 'member';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Form Handling

#### Event Registration Form
```typescript
// components/features/events/EventRegistrationForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { useRegisterEvent } from '../../../hooks/useEvents';

const registrationSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  company: z.string().min(1, 'Company is required'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
}

export const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  eventId
}) => {
  const registerMutation = useRegisterEvent();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  });

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await registerMutation.mutateAsync({
        eventId,
        ...data
      });
      // Show success and redirect
    } catch (error) {
      // Show error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input
          id="full_name"
          {...register('full_name')}
          error={errors.full_name?.message}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <Input
          id="phone_number"
          {...register('phone_number')}
          error={errors.phone_number?.message}
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
          Company
        </label>
        <Input
          id="company"
          {...register('company')}
          error={errors.company?.message}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || registerMutation.isPending}
        className="w-full"
      >
        {isSubmitting || registerMutation.isPending
          ? 'Registering...'
          : 'Register for Event'
        }
      </Button>
    </form>
  );
};
```

---

## 📱 MOBILE APP ARCHITECTURE (FLUTTER)

### Technology Stack
- **Framework**: Flutter 2.16.2+
- **State Management**: GetX (GetX Controller + Rx)
- **Navigation**: GetX Navigation dengan persistent bottom bar
- **Firebase**: Authentication, Firestore, Cloud Storage
- **HTTP Client**: Dio
- **UI Components**: GetWidget (GF)
- **Internationalization**: flutter_localizations
- **Code Generation**: Custom auto-generation tools

### Project Structure
```
TMClub-Flutter/
├── lib/
│   ├── controller/          # GetX Controllers (12 total)
│   │   ├── AuthController.dart
│   │   ├── EventController.dart
│   │   ├── BlogController.dart
│   │   ├── CompanyController.dart
│   │   ├── ChatController.dart
│   │   ├── BottomTabController.dart
│   │   ├── NotificationController.dart
│   │   ├── TransactionController.dart
│   │   ├── SurveyController.dart
│   │   ├── FileController.dart
│   │   ├── QrController.dart
│   │   └── ProfileController.dart
│   ├── model/               # Data Models (15 total)
│   │   ├── user.dart
│   │   ├── event_tmc.dart
│   │   ├── blog.dart
│   │   ├── company.dart
│   │   ├── invoice.dart
│   │   ├── notification.dart
│   │   ├── survey.dart
│   │   ├── file_model.dart
│   │   └── ... (other models)
│   ├── pages/               # Main Screens (30+ screens)
│   │   ├── event.dart
│   │   ├── blog.dart
│   │   ├── chat.dart
│   │   ├── about.dart
│   │   ├── profile.dart
│   │   ├── dashboard.dart
│   │   ├── registration.dart
│   │   ├── invoice_detail.dart
│   │   ├── certificate.dart
│   │   └── ... (other screens)
│   ├── widget/              # Reusable Widgets (20+ widgets)
│   │   ├── form_registrasi_mandiri.dart
│   │   ├── form_attedance.dart
│   │   ├── event_card.dart
│   │   ├── blog_card.dart
│   │   ├── invoice_card.dart
│   │   ├── notification_tile.dart
│   │   └── ... (other widgets)
│   ├── utils/               # Utilities
│   │   ├── api.dart         # API configuration
│   │   ├── constants.dart   # App constants
│   │   ├── helpers.dart     # Helper functions
│   │   └── validators.dart  # Validation functions
│   ├── services/            # External services
│   │   ├── firebase_service.dart
│   │   ├── notification_service.dart
│   │   └── storage_service.dart
│   ├── main.dart            # App entry point
│   ├── authentication.dart  # Firebase auth
│   └── routes.dart          # App routing
├── assets/                  # Images & assets
│   ├── images/
│   ├── icons/
│   └── fonts/
├── android/                 # Android platform
├── ios/                     # iOS platform
└── pubspec.yaml             # Dependencies
```

### State Management (GetX)

#### Auth Controller
```dart
// lib/controller/AuthController.dart
import 'package:get/get.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../model/user.dart';
import '../utils/api.dart';

class AuthController extends GetxController {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final Api _api = Api();

  // Reactive variables
  var isLoggedIn = false.obs;
  var currentUser = Rxn<UserModel>();
  var isLoading = false.obs;
  var errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    User? firebaseUser = _auth.currentUser;
    if (firebaseUser != null) {
      await _getUserData(firebaseUser);
    }
  }

  Future<void> signInWithGoogle() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      // Firebase Google Sign-In
      final GoogleSignInAccount? googleUser = await GoogleSignIn().signIn();
      final GoogleSignInAuthentication googleAuth = await googleUser!.authentication;

      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      UserCredential userCredential = await _auth.signInWithCredential(credential);

      // Exchange token with backend
      await _exchangeTokenWithBackend(userCredential.user!);

      isLoggedIn.value = true;
      Get.offAllNamed('/dashboard');

    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _exchangeTokenWithBackend(User firebaseUser) async {
    try {
      final response = await _api.post('/authentication/oauth/', {
        'access_token': await firebaseUser.getIdToken(),
        'backend': 'google-oauth2'
      });

      if (response.statusCode == 201) {
        final data = response.data;

        // Store token
        await _api.setToken(data['token']);

        // Get user data
        await _getUserData(firebaseUser);
      }
    } catch (e) {
      throw Exception('Failed to exchange token: $e');
    }
  }

  Future<void> _getUserData(User firebaseUser) async {
    try {
      final response = await _api.get('/account/me/');

      if (response.statusCode == 200) {
        currentUser.value = UserModel.fromJson(response.data);
        isLoggedIn.value = true;
      }
    } catch (e) {
      // User exists in Firebase but not in backend
      await _createUserInBackend(firebaseUser);
    }
  }

  Future<void> _createUserInBackend(User firebaseUser) async {
    try {
      final response = await _api.post('/authentication/basic-register/', {
        'username': firebaseUser.email,
        'email': firebaseUser.email,
        'first_name': firebaseUser.displayName?.split(' ')[0] ?? '',
        'last_name': firebaseUser.displayName?.split(' ')[1] ?? '',
      });

      if (response.statusCode == 201) {
        await _getUserData(firebaseUser);
      }
    } catch (e) {
      throw Exception('Failed to create user: $e');
    }
  }

  Future<void> logout() async {
    try {
      await _auth.signOut();
      await _api.clearToken();

      isLoggedIn.value = false;
      currentUser.value = null;

      Get.offAllNamed('/login');
    } catch (e) {
      errorMessage.value = e.toString();
    }
  }
}
```

#### Event Controller
```dart
// lib/controller/EventController.dart
import 'package:get/get.dart';
import '../model/event_tmc.dart';
import '../utils/api.dart';

class EventController extends GetxController {
  final Api _api = Api();

  // Reactive variables
  var events = <EventModel>[].obs;
  var currentEvent = Rxn<EventModel>();
  var registeredEvents = <EventModel>[].obs;
  var isLoading = false.obs;
  var errorMessage = ''.obs;

  @override
  void onInit() {
    super.onInit();
    fetchEvents();
  }

  Future<void> fetchEvents() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final response = await _api.get('/event/');

      if (response.statusCode == 200) {
        List<dynamic> data = response.data['results'];
        events.value = data.map((json) => EventModel.fromJson(json)).toList();
      }
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> fetchEventDetail(int eventId) async {
    try {
      isLoading.value = true;

      final response = await _api.get('/event/$eventId/');

      if (response.statusCode == 200) {
        currentEvent.value = EventModel.fromJson(response.data);
      }
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> registerForEvent(int eventId) async {
    try {
      isLoading.value = true;

      final response = await _api.post('/event/$eventId/registration/');

      if (response.statusCode == 201) {
        // Show success
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
      final response = await _api.get('/account/me/');

      if (response.statusCode == 200) {
        List<dynamic> eventData = response.data['event_registered'] ?? [];
        registeredEvents.value = eventData
            .map((json) => EventModel.fromJson(json))
            .toList();
      }
    } catch (e) {
      errorMessage.value = e.toString();
    }
  }

  Future<void> downloadCertificate(int eventId) async {
    try {
      final response = await _api.get('/event/$eventId/download-certificate/');

      if (response.statusCode == 200) {
        // Save certificate to device
        await _saveCertificateToDevice(response.data);

        Get.snackbar('Success', 'Certificate downloaded');
      }
    } catch (e) {
      errorMessage.value = e.toString();
      Get.snackbar('Error', 'Failed to download certificate');
    }
  }

  Future<void> _saveCertificateToDevice(List<int> bytes) async {
    // Implementation to save file to device storage
    final directory = await getApplicationDocumentsDirectory();
    final file = File('${directory.path}/certificate.jpg');
    await file.writeAsBytes(bytes);
  }
}
```

### Models

#### Event Model
```dart
// lib/model/event_tmc.dart
class EventModel {
  final int id;
  final String title;
  final DateTime date;
  final String venue;
  final bool isFree;
  final double price;
  final bool isRegistrationClose;
  final bool isListAttendees;
  final bool isDone;
  final String? mainImage;
  final List<ReferenceModel> references;
  final List<FileModel> medias;
  final List<SurveyModel> surveys;
  final String nonce;
  final DateTime createdAt;

  EventModel({
    required this.id,
    required this.title,
    required this.date,
    required this.venue,
    required this.isFree,
    required this.price,
    required this.isRegistrationClose,
    required this.isListAttendees,
    required this.isDone,
    this.mainImage,
    required this.references,
    required this.medias,
    required this.surveys,
    required this.nonce,
    required this.createdAt,
  });

  factory EventModel.fromJson(Map<String, dynamic> json) {
    return EventModel(
      id: json['id'],
      title: json['title'],
      date: DateTime.parse(json['date']),
      venue: json['venue'],
      isFree: json['is_free'],
      price: double.parse(json['price'].toString()),
      isRegistrationClose: json['is_registration_close'],
      isListAttendees: json['is_list_attendees'],
      isDone: json['is_done'],
      mainImage: json['main_image']?['image'],
      references: (json['references'] as List?)
          ?.map((ref) => ReferenceModel.fromJson(ref))
          .toList() ?? [],
      medias: (json['medias'] as List?)
          ?.map((media) => FileModel.fromJson(media))
          .toList() ?? [],
      surveys: (json['surveys'] as List?)
          ?.map((survey) => SurveyModel.fromJson(survey))
          .toList() ?? [],
      nonce: json['nonce'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  String get formattedPrice {
    if (isFree) return 'Free';
    return 'Rp ${price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.'
    )}';
  }

  String get formattedDate {
    final date = this.date;
    return '${date.day} ${_getMonthName(date.month)} ${date.year}';
  }

  String _getMonthName(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }

  bool get isUpcoming => date.isAfter(DateTime.now());
  bool get isPast => date.isBefore(DateTime.now());
  bool get isToday => date.day == DateTime.now().day &&
                     date.month == DateTime.now().month &&
                     date.year == DateTime.now().year;
}
```

### API Service

#### HTTP Client Configuration
```dart
// lib/utils/api.dart
import 'package:dio/dio.dart';
import 'package:get_storage/get_storage.dart';

class Api {
  late Dio _dio;
  final GetStorage _storage = GetStorage();

  Api() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.tmc.id/api',
      connectTimeout: 10000,
      receiveTimeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Request interceptor untuk auto-authentication
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = _storage.read('token');
          if (token != null) {
            options.headers['Authorization'] = 'Token $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          // Auto-refresh token jika 401
          if (error.response?.statusCode == 401) {
            try {
              await _refreshToken();
              // Retry request dengan token baru
              final token = _storage.read('token');
              error.requestOptions.headers['Authorization'] = 'Token $token';

              final response = await _dio.fetch(error.requestOptions);
              handler.resolve(response);
            } catch (e) {
              // Clear token dan redirect ke login
              _storage.remove('token');
              Get.offAllNamed('/login');
              handler.next(error);
            }
          } else {
            handler.next(error);
          }
        },
      ),
    );
  }

  Future<void> setToken(String token) async {
    await _storage.write('token', token);
  }

  Future<void> clearToken() async {
    await _storage.remove('token');
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

### Screens

#### Event List Screen
```dart
// lib/pages/event.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/EventController.dart';
import '../widget/event_card.dart';

class EventScreen extends StatelessWidget {
  final EventController _eventController = Get.put(EventController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Events'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _eventController.fetchEvents,
          ),
        ],
      ),
      body: Obx(() {
        if (_eventController.isLoading.value) {
          return Center(child: CircularProgressIndicator());
        }

        if (_eventController.errorMessage.value.isNotEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'Failed to load events',
                  style: TextStyle(fontSize: 18, color: Colors.grey),
                ),
                SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _eventController.fetchEvents,
                  child: Text('Retry'),
                ),
              ],
            ),
          );
        }

        if (_eventController.events.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.event_available, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'No events available',
                  style: TextStyle(fontSize: 18, color: Colors.grey),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: _eventController.fetchEvents,
          child: ListView.builder(
            padding: EdgeInsets.all(16),
            itemCount: _eventController.events.length,
            itemBuilder: (context, index) {
              final event = _eventController.events[index];
              return EventCard(event: event);
            },
          ),
        );
      }),
    );
  }
}
```

#### Event Registration Form
```dart
// lib/widget/form_registrasi_mandiri.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controller/EventController.dart';
import '../controller/AuthController.dart';

class FormRegistrasiMandiri extends StatefulWidget {
  final int eventId;

  FormRegistrasiMandiri({required this.eventId});

  @override
  _FormRegistrasiMandiriState createState() => _FormRegistrasiMandiriState();
}

class _FormRegistrasiMandiriState extends State<FormRegistrasiMandiri> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _companyController = TextEditingController();

  final EventController _eventController = Get.find<EventController>();
  final AuthController _authController = Get.find<AuthController>();

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill form with user data
    final user = _authController.currentUser.value;
    if (user != null) {
      _fullNameController.text = user.fullName ?? '';
      _emailController.text = user.email ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Event Registration'),
      ),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _fullNameController,
                decoration: InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your full name';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),

              TextFormField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  if (!GetUtils.isEmail(value)) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),

              TextFormField(
                controller: _phoneController,
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your phone number';
                  }
                  if (value.length < 10) {
                    return 'Phone number must be at least 10 digits';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),

              TextFormField(
                controller: _companyController,
                decoration: InputDecoration(
                  labelText: 'Company',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your company';
                  }
                  return null;
                },
              ),
              SizedBox(height: 32),

              ElevatedButton(
                onPressed: _isLoading ? null : _submitRegistration,
                child: _isLoading
                    ? CircularProgressIndicator(color: Colors.white)
                    : Text('Register for Event'),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitRegistration() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final success = await _eventController.registerForEvent(widget.eventId);

      if (success) {
        Get.back(); // Close form
        // Show success dialog or navigate to success page
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _companyController.dispose();
    super.dispose();
  }
}
```

### Navigation

#### App Routes
```dart
// lib/routes.dart
import 'package:get/get.dart';
import '../pages/event.dart';
import '../pages/blog.dart';
import '../pages/dashboard.dart';
import '../pages/profile.dart';
import '../pages/login.dart';

class AppRoutes {
  static const String initial = '/dashboard';
  static const String login = '/login';
  static const String dashboard = '/dashboard';
  static const String events = '/events';
  static const String blogs = '/blogs';
  static const String profile = '/profile';
  static const String eventDetail = '/event-detail';
  static const String blogDetail = '/blog-detail';
  static const String registration = '/registration';
  static const String invoice = '/invoice';
  static const String certificate = '/certificate';

  static final routes = [
    GetPage(
      name: login,
      page: () => LoginScreen(),
      transition: Transition.fadeIn,
    ),
    GetPage(
      name: dashboard,
      page: () => DashboardScreen(),
      transition: Transition.fadeIn,
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: events,
      page: () => EventScreen(),
      transition: Transition.fadeIn,
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: eventDetail,
      page: () => EventDetailScreen(),
      transition: Transition.rightToLeft,
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: blogs,
      page: () => BlogScreen(),
      transition: Transition.fadeIn,
      middlewares: [AuthMiddleware()],
    ),
    GetPage(
      name: profile,
      page: () => ProfileScreen(),
      transition: Transition.fadeIn,
      middlewares: [AuthMiddleware()],
    ),
  ];
}

class AuthMiddleware extends GetMiddleware {
  @override
  RouteSettings? redirect(String? route) {
    final authController = Get.find<AuthController>();

    if (!authController.isLoggedIn.value) {
      return RouteSettings(name: AppRoutes.login);
    }

    return null;
  }
}
```

### Custom Widgets

#### Event Card Widget
```dart
// lib/widget/event_card.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../model/event_tmc.dart';
import '../controller/EventController.dart';
import '../controller/AuthController.dart';

class EventCard extends StatelessWidget {
  final EventModel event;
  final VoidCallback? onTap;

  const EventCard({
    Key? key,
    required this.event,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final EventController eventController = Get.find<EventController>();
    final AuthController authController = Get.find<AuthController>();

    final isRegistered = eventController.registeredEvents
        .any((e) => e.id == event.id);

    return Card(
      margin: EdgeInsets.only(bottom: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap ?? () => Get.toNamed('/event-detail', arguments: event),
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Event Image
            if (event.mainImage != null)
              ClipRRect(
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                child: Image.network(
                  event.mainImage!,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 200,
                      color: Colors.grey[300],
                      child: Icon(Icons.event, size: 64, color: Colors.grey[600]),
                    );
                  },
                ),
              ),

            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Event Title
                  Text(
                    event.title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 8),

                  // Event Details
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 16, color: Colors.grey[600]),
                      SizedBox(width: 4),
                      Text(
                        event.formattedDate,
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),

                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
                      SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          event.venue,
                          style: TextStyle(color: Colors.grey[600]),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),

                  Row(
                    children: [
                      Icon(Icons.monetization_on, size: 16, color: Colors.grey[600]),
                      SizedBox(width: 4),
                      Text(
                        event.formattedPrice,
                        style: TextStyle(
                          color: event.isFree ? Colors.green : Colors.orange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),

                  // Status and Actions
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Registration Status
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: event.isRegistrationClose
                              ? Colors.red.withOpacity(0.1)
                              : Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          event.isRegistrationClose ? 'Closed' : 'Open',
                          style: TextStyle(
                            color: event.isRegistrationClose ? Colors.red : Colors.green,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),

                      // Register Button
                      if (!isRegistered && !event.isRegistrationClose && !event.isPast)
                        ElevatedButton(
                          onPressed: () => _showRegistrationDialog(event),
                          style: ElevatedButton.styleFrom(
                            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          ),
                          child: Text('Register'),
                        )
                      else if (isRegistered)
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Registered',
                            style: TextStyle(
                              color: Colors.blue,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        )
                      else if (event.isPast)
                        Text(
                          'Event Ended',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showRegistrationDialog(EventModel event) {
    Get.dialog(
      AlertDialog(
        title: Text('Register for ${event.title}'),
        content: Text('Are you sure you want to register for this event?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              Get.toNamed('/registration', arguments: event);
            },
            child: Text('Register'),
          ),
        ],
      ),
    );
  }
}
```

---

## 🔒 SECURITY & AUTHENTICATION

### Authentication Methods

#### 1. OAuth2 Social Authentication
```python
# Google OAuth2 Flow
POST /api/authentication/oauth/
{
    "access_token": "google_access_token",
    "backend": "google-oauth2"
}

# Facebook OAuth2 Flow
POST /api/authentication/oauth/
{
    "access_token": "facebook_access_token",
    "backend": "facebook"
}

# Apple ID Flow
POST /api/authentication/oauth/
{
    "access_token": "apple_id_token",
    "backend": "apple-id"
}
```

#### 2. Manual Authentication
```python
# Manual Login
POST /api/authentication/manual-login/
{
    "username": "username",
    "password": "password123"
}

# Auto Registration if user doesn't exist
POST /api/authentication/basic-register/
{
    "username": "new_user@example.com",
    "email": "new_user@example.com",
    "first_name": "John",
    "last_name": "Doe"
}
```

### Token Management

#### JWT Token Structure
```python
# Token Payload
{
    "user_id": 123,
    "email": "user@example.com",
    "role": "member",  # admin, pic, member
    "is_staff": false,
    "is_pic": false,
    "exp": 1640995200,  # Expiration timestamp
    "iat": 1640908800   # Issued at timestamp
}
```

#### Auto-Refresh Token
```python
# Refresh Token Flow
POST /api/authentication/refresh/
Authorization: Token current_token

Response:
{
    "token": "new_jwt_token_here",
    "expires_in": 3600
}
```

### Permission Levels

#### Role-Based Access Control
```python
# IsAdminUser - Admin only access
class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

# IsPICUser - PIC only access
class IsPICUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return CompanyMemberModel.objects.filter(
            user=request.user,
            is_pic=True
        ).exists()

# IsEventOwner - Event owner access
class IsEventOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owned_by == request.user
```

### Security Measures

#### Input Validation
```python
# Custom Validators
def validate_phone_number(value):
    if not re.match(r'^\+?1?\d{9,15}$', value):
        raise ValidationError('Invalid phone number format')

def validate_slug(value):
    if not re.match(r'^[-a-zA-Z0-9_]+$', value):
        raise ValidationError('Slug can only contain letters, numbers, hyphens and underscores')

# Model Validation
class EventModel(models.Model):
    def clean(self):
        if self.date < timezone.now():
            raise ValidationError('Event date cannot be in the past')

        if not self.is_free and self.price <= 0:
            raise ValidationError('Price must be greater than 0 for paid events')
```

#### SQL Injection Prevention
```python
# Django ORM prevents SQL injection
events = EventModel.objects.filter(
    title__icontains=search_query,
    date__gte=start_date,
    is_registration_close=False
)

# Raw SQL with parameterization
events = EventModel.objects.raw(
    "SELECT * FROM event_eventmodel WHERE date >= %s",
    [start_date]
)
```

#### File Upload Security
```python
# File type validation
def validate_image(value):
    import os
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']

    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file type. Allowed types: ' + str(valid_extensions))

# File size validation
def validate_file_size(value):
    filesize = value.size

    if filesize > 5 * 1024 * 1024:  # 5MB limit
        raise ValidationError('File size cannot exceed 5MB')
```

#### Rate Limiting
```python
# Custom rate limiting middleware
class RateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Rate limit authentication endpoints
        if '/api/authentication/' in request.path:
            client_ip = self.get_client_ip(request)

            if self.is_rate_limited(client_ip):
                return HttpResponse('Rate limit exceeded', status=429)

        return self.get_response(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
```

### CORS Configuration

#### Production CORS Settings
```python
# backend/core/settings/production.py
CORS_ALLOWED_ORIGINS = [
    "https://tmc.id",
    "https://www.tmc.id",
    "https://app.tmc.id"
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_ALL_ORIGINS = False  # Security: Don't allow all origins in production

# Allow specific headers for authentication
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### Password Security

#### Password Validation
```python
# Django built-in password validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Custom password strength validation
class StrongPasswordValidator:
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]', password):
            raise ValidationError('Password must contain at least one uppercase letter')

        if not re.search(r'[a-z]', password):
            raise ValidationError('Password must contain at least one lowercase letter')

        if not re.search(r'\d', password):
            raise ValidationError('Password must contain at least one digit')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError('Password must contain at least one special character')
```

---

## 🚀 DEPLOYMENT & CONFIGURATION

### Docker Configuration

#### Dockerfile (Backend)
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=core.settings.production

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Create static directory
RUN mkdir -p /app/staticfiles /app/mediafiles

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "core.wsgi:application"]
```

#### Docker Compose
```yaml
# docker-compose.yaml
version: '3.8'

services:
  db:
    image: postgres:15
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
    build: ./backend
    environment:
      - DEBUG=False
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PWD=${DB_PWD}
      - SECRET_KEY=${SECRET_KEY}
      - APP_IP=0.0.0.0
      - APP_PORT=8000
    volumes:
      - ./backend:/app
      - staticfiles:/app/staticfiles
      - mediafiles:/app/mediafiles
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "1338:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - staticfiles:/var/www/static
      - mediafiles:/var/www/media
    depends_on:
      - backend

volumes:
  postgres_data:
  staticfiles:
  mediafiles:
```

### Nginx Configuration

#### Production Nginx Config
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name tmc.id www.tmc.id;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Static files
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Media files
        location /media/ {
            alias /var/www/media/;
            expires 1y;
            add_header Cache-Control "public";
        }

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Authentication endpoints with stricter rate limiting
        location /api/authentication/ {
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
    }
}
```

### Environment Configuration

#### Production Environment (.env)
```bash
# .env for production
DEBUG=False
SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=core.settings.production

# Database Configuration
DB_HOST=db
DB_PORT=5432
DB_NAME=tmc_production
DB_USER=tmc_user
DB_PWD=secure_password_here

# Application Configuration
APP_IP=0.0.0.0
APP_PORT=8000
ALLOWED_HOSTS=tmc.id,www.tmc.id,localhost

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@tmc.id
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@tmc.id

# Firebase Configuration (Mobile)
FIREBASE_PROJECT_ID=tmc-mobile
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tmc-mobile.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

#### Development Environment (.env.dev)
```bash
# .env for development
DEBUG=True
SECRET_KEY=dev-secret-key-not-for-production
DJANGO_SETTINGS_MODULE=core.settings.development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tmc_dev
DB_USER=postgres
DB_PWD=postgres

# Application Configuration
APP_IP=127.0.0.1
APP_PORT=8000
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS for development
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:1338

# Email Configuration (Console backend for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Makefile Commands

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

collectstatic:
	@echo "Collecting static files..."
	docker-compose exec backend python manage.py collectstatic --noinput

logs:
	@echo "Showing logs..."
	docker-compose logs -f
```

### CI/CD Pipeline (GitHub Actions)

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
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

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt

    - name: Run tests
      run: |
        cd backend
        python manage.py test
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db
        SECRET_KEY: test-secret-key
        DEBUG: True

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

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

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/tmc-api
          docker-compose pull
          docker-compose up -d
          docker-compose exec backend python manage.py migrate
          docker-compose exec backend python manage.py collectstatic --noinput
```

### Monitoring & Logging

#### Django Logging Configuration
```python
# backend/core/settings/production.py
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
            'class': 'logging.FileHandler',
            'filename': '/app/logs/django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'tmc': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

#### Health Check Endpoint
```python
# backend/apps/common/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    """Health check endpoint for monitoring"""
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    # Check cache
    try:
        cache.set('health_check', 'ok', 10)
        cache_status = "healthy" if cache.get('health_check') == 'ok' else "unhealthy"
    except Exception:
        cache_status = "unhealthy"

    overall_status = "healthy" if db_status == "healthy" and cache_status == "healthy" else "unhealthy"

    response_data = {
        "status": overall_status,
        "database": db_status,
        "cache": cache_status,
        "timestamp": timezone.now().isoformat(),
    }

    status_code = 200 if overall_status == "healthy" else 503
    return JsonResponse(response_data, status=status_code)
```

---

## 🔌 INTEGRATION & EXTERNAL SERVICES

### OAuth2 Authentication

#### Google OAuth2 Setup
```python
# backend/core/settings/base.py
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# Google OAuth2 Configuration
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
            'client_id': env('GOOGLE_CLIENT_ID'),
            'secret': env('GOOGLE_CLIENT_SECRET'),
            'key': '',
        }
    }
}
```

#### Facebook OAuth2 Setup
```python
# Facebook OAuth2 Configuration
SOCIALACCOUNT_PROVIDERS = {
    'facebook': {
        'METHOD': 'oauth2',
        'SCOPE': ['email', 'public_profile'],
        'AUTH_PARAMS': {'auth_type': 'rerequest'},
        'INIT_PARAMS': {'cookie': True},
        'FIELDS': [
            'id',
            'email',
            'name',
            'first_name',
            'last_name',
            'verified',
        ],
        'EXCHANGE_TOKEN': True,
        'LOCALE_FUNC': lambda request: 'en_US',
        'VERIFIED_EMAIL': False,
        'VERSION': 'v7.0',
        'APP': {
            'client_id': env('FACEBOOK_CLIENT_ID'),
            'secret': env('FACEBOOK_CLIENT_SECRET'),
        }
    }
}
```

### Email Service Integration

#### SMTP Email Configuration
```python
# backend/core/settings/production.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = int(env('EMAIL_PORT'))
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')

# Email templates
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_EMAIL_SUBJECT_PREFIX = '[TMC] '
```

#### Custom Email Service
```python
# backend/apps/common/services/email_service.py
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

class EmailService:
    @staticmethod
    def send_registration_confirmation(user, event):
        subject = f'Registration Confirmation - {event.title}'

        context = {
            'user': user,
            'event': event,
            'site_url': settings.SITE_URL,
        }

        html_message = render_to_string('emails/registration_confirmation.html', context)
        plain_message = render_to_string('emails/registration_confirmation.txt', context)

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )

    @staticmethod
    def send_payment_reminder(user, invoice):
        subject = f'Payment Reminder - Invoice {invoice.number}'

        context = {
            'user': user,
            'invoice': invoice,
            'site_url': settings.SITE_URL,
        }

        html_message = render_to_string('emails/payment_reminder.html', context)
        plain_message = render_to_string('emails/payment_reminder.txt', context)

        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
```

### Firebase Integration (Mobile)

#### Firebase Admin SDK
```python
# backend/apps/common/services/firebase_service.py
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings

class FirebaseService:
    def __init__(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY,
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "client_id": settings.FIREBASE_CLIENT_ID,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            })
            firebase_admin.initialize_app(cred)

    def send_push_notification(self, device_token, title, body, data=None):
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=device_token,
        )

        try:
            response = messaging.send(message)
            return response
        except Exception as e:
            print(f"Error sending push notification: {e}")
            return None

    def send_topic_notification(self, topic, title, body, data=None):
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            topic=topic,
        )

        try:
            response = messaging.send(message)
            return response
        except Exception as e:
            print(f"Error sending topic notification: {e}")
            return None
```

### File Storage Integration

#### AWS S3 Configuration
```python
# backend/core/settings/production.py
# S3 Configuration for file storage
AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

# Static and Media files
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
```

#### Cloudinary Integration (Alternative)
```python
# backend/core/settings/production.py
# Cloudinary for image storage and processing
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': env('CLOUDINARY_API_KEY'),
    'API_SECRET': env('CLOUDINARY_API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
```

### Payment Gateway Integration

#### Faspay Payment Gateway
```python
# backend/apps/faspay/services/faspay_service.py
import requests
from django.conf import settings
from decimal import Decimal

class FaspayService:
    BASE_URL = "https://dev.faspay.co.id/cvr/100001/10"

    def __init__(self):
        self.user_id = settings.FASPAY_USER_ID
        self.password = settings.FASPAY_PASSWORD
        self.merchant_id = settings.FASPAY_MERCHANT_ID

    def create_payment(self, invoice):
        """Create payment request to Faspay"""
        data = {
            'user_id': self.user_id,
            'password': self.password,
            'merchant_id': self.merchant_id,
            'merchant_transaction_id': invoice.number,
            'amount': str(invoice.amount),
            'currency': 'IDR',
            'description': f'Payment for {invoice.number}',
            'customer_name': invoice.user.get_full_name(),
            'customer_email': invoice.user.email,
            'return_url': f'{settings.SITE_URL}/payment/return/',
            'notify_url': f'{settings.SITE_URL}/api/faspay/notify/',
        }

        try:
            response = requests.post(f'{self.BASE_URL}/payment', data=data)
            return response.json()
        except Exception as e:
            print(f"Faspay payment error: {e}")
            return None

    def check_payment_status(self, transaction_id):
        """Check payment status from Faspay"""
        data = {
            'user_id': self.user_id,
            'password': self.password,
            'merchant_id': self.merchant_id,
            'transaction_id': transaction_id,
        }

        try:
            response = requests.post(f'{self.BASE_URL}/check', data=data)
            return response.json()
        except Exception as e:
            print(f"Faspay status check error: {e}")
            return None
```

### Analytics Integration

#### Google Analytics 4
```python
# backend/apps/common/services/analytics_service.py
import requests
from django.conf import settings

class AnalyticsService:
    def __init__(self):
        self.measurement_id = settings.GA4_MEASUREMENT_ID
        self.api_secret = settings.GA4_API_SECRET

    def track_event(self, event_name, user_id=None, parameters=None):
        """Track custom event to Google Analytics 4"""
        url = f'https://www.google-analytics.com/mp/collect?measurement_id={self.measurement_id}&api_secret={self.api_secret}'

        payload = {
            'client_id': user_id or 'anonymous',
            'events': [{
                'name': event_name,
                'parameters': parameters or {}
            }]
        }

        try:
            response = requests.post(url, json=payload)
            return response.status_code == 204
        except Exception as e:
            print(f"Analytics tracking error: {e}")
            return False

    def track_page_view(self, page_path, user_id=None):
        """Track page view"""
        return self.track_event('page_view', user_id, {
            'page_path': page_path,
        })

    def track_event_registration(self, event_id, user_id):
        """Track event registration"""
        return self.track_event('event_registration', user_id, {
            'event_id': event_id,
        })

    def track_payment_completed(self, invoice_id, amount, user_id):
        """Track payment completion"""
        return self.track_event('purchase', user_id, {
            'transaction_id': invoice_id,
            'value': float(amount),
            'currency': 'IDR',
        })
```

### SMS Service Integration

#### WhatsApp Business API
```python
# backend/apps/common/services/whatsapp_service.py
import requests
from django.conf import settings

class WhatsAppService:
    def __init__(self):
        self.base_url = "https://graph.facebook.com/v15.0"
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN

    def send_message(self, to, message):
        """Send WhatsApp message"""
        url = f"{self.base_url}/{self.phone_number_id}/messages"

        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
        }

        data = {
            'messaging_product': 'whatsapp',
            'to': to,
            'type': 'text',
            'text': {
                'body': message
            }
        }

        try:
            response = requests.post(url, json=data, headers=headers)
            return response.json()
        except Exception as e:
            print(f"WhatsApp API error: {e}")
            return None

    def send_event_reminder(self, to, event_title, event_date):
        """Send event reminder via WhatsApp"""
        message = f"""
📅 Event Reminder

Hello! This is a reminder for your upcoming event:

🎯 {event_title}
📅 {event_date.strftime('%d %B %Y at %H:%M')}

Please ensure you're ready to join. Thank you!

Toyota Manufacturers Club
        """.strip()

        return self.send_message(to, message)

    def send_payment_reminder(self, to, invoice_number, amount):
        """Send payment reminder via WhatsApp"""
        message = f"""
💳 Payment Reminder

Hello! This is a payment reminder for your invoice:

📄 Invoice: {invoice_number}
💰 Amount: Rp {amount:,.0f}

Please complete your payment as soon as possible. Thank you!

Toyota Manufacturers Club
        """.strip()

        return self.send_message(to, message)
```

---

## 📊 MONITORING & ANALYTICS

### Application Performance Monitoring

#### Django Debug Toolbar (Development)
```python
# backend/core/settings/development.py
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

#### Sentry Integration (Production)
```python
# backend/core/settings/production.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.redis import RedisIntegration

sentry_sdk.init(
    dsn=env('SENTRY_DSN'),
    integrations=[
        DjangoIntegration(
            transaction_style='url',
            middleware_spans=True,
            signals_spans=True,
        ),
        RedisIntegration(),
    ],
    traces_sample_rate=0.1,
    send_default_pii=False,
    environment=env('SENTRY_ENVIRONMENT', 'production'),
)
```

### Database Performance Monitoring

#### Django Extensions for Query Analysis
```python
# backend/core/settings/base.py
INSTALLED_APPS += ['django_extensions']

# Enable query count and profiling
MIDDLEWARE += [
    'django_extensions.middleware.QueryCountMiddleware',
]
```

#### Custom Query Logging
```python
# backend/apps/common/middleware/query_logging.py
import time
import logging
from django.db import connection
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('django.db.queries')

class QueryLoggingMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if connection.queries:
            total_time = sum(float(q['time']) for q in connection.queries)
            logger.info(
                f"{request.method} {request.path} - "
                f"{len(connection.queries)} queries in {total_time:.3f}s"
            )

            # Log slow queries (>100ms)
            for query in connection.queries:
                if float(query['time']) > 0.1:
                    logger.warning(f"Slow query ({query['time']}s): {query['sql'][:200]}...")

        return response
```

### API Analytics

#### Django REST Framework Analytics
```python
# backend/apps/common/middleware/api_analytics.py
import time
import json
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from apps.common.services.analytics_service import AnalyticsService

class APIAnalyticsMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if request.path.startswith('/api/'):
            # Track API usage
            self._track_api_usage(request, response)

            # Track to Google Analytics
            self._track_to_analytics(request, response)

        return response

    def _track_api_usage(self, request, response):
        endpoint = request.path
        method = request.method
        status_code = response.status_code
        user = getattr(request, 'user', None)

        # Increment cache counter
        cache_key = f'api_usage:{endpoint}:{method}'
        cache.incr(cache_key)

        # Log slow endpoints
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            if duration > 2.0:  # 2 seconds threshold
                logger.warning(f"Slow API endpoint: {method} {endpoint} - {duration:.2f}s")

    def _track_to_analytics(self, request, response):
        if hasattr(request, 'user') and request.user.is_authenticated:
            analytics = AnalyticsService()

            event_name = f'api_{request.method.lower()}'
            parameters = {
                'endpoint': request.path,
                'status_code': response.status_code,
            }

            analytics.track_event(event_name, request.user.id, parameters)

    def process_request(self, request):
        request.start_time = time.time()
        return None
```

### Health Checks

#### Django Health Check Configuration
```python
# backend/core/settings/production.py
INSTALLED_APPS += ['django_health_check']

HEALTH_CHECK = {
    'DISK_USAGE_MAX': 90,  # percent
    'MEMORY_MIN': 100,     # in MB
}

HEALTH_CHECKS = [
    'django_health_check.contrib.psutil.checks.DiskUsageCheck',
    'django_health_check.contrib.psutil.checks.MemoryUsageCheck',
    'django_health_check.contrib.database.checks.DatabaseCheck',
    'django_health_check.contrib.redis.checks.RedisCheck',
]
```

### Custom Metrics

#### Application Metrics Dashboard
```python
# backend/apps/common/views.py
from django.http import JsonResponse
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

class MetricsAPIView(APIView):
    """API endpoint for application metrics"""

    def get(self, request):
        metrics = {
            'users': self._get_user_metrics(),
            'events': self._get_event_metrics(),
            'transactions': self._get_transaction_metrics(),
            'system': self._get_system_metrics(),
        }

        return Response(metrics)

    def _get_user_metrics(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        now = timezone.now()
        last_30_days = now - timedelta(days=30)

        return {
            'total': User.objects.count(),
            'active_last_30_days': User.objects.filter(
                last_login__gte=last_30_days
            ).count(),
            'new_last_30_days': User.objects.filter(
                date_joined__gte=last_30_days
            ).count(),
            'by_role': {
                'admin': User.objects.filter(is_staff=True).count(),
                'pic': User.objects.filter(
                    companymembermodel__is_pic=True
                ).count(),
                'member': User.objects.filter(
                    is_staff=False,
                    companymembermodel__is_pic=False
                ).count(),
            }
        }

    def _get_event_metrics(self):
        from apps.event.models import EventModel, RegistrantModel

        now = timezone.now()
        upcoming = EventModel.objects.filter(date__gte=now).count()
        past = EventModel.objects.filter(date__lt=now).count()

        return {
            'total': EventModel.objects.count(),
            'upcoming': upcoming,
            'past': past,
            'total_registrations': RegistrantModel.objects.count(),
            'avg_registrations_per_event': (
                RegistrantModel.objects.count() / max(EventModel.objects.count(), 1)
            ),
            'by_month': self._get_events_by_month(),
        }

    def _get_transaction_metrics(self):
        from apps.transaction.models import Invoice

        now = timezone.now()
        last_30_days = now - timedelta(days=30)

        recent_invoices = Invoice.objects.filter(created_at__gte=last_30_days)

        return {
            'total': Invoice.objects.count(),
            'last_30_days': recent_invoices.count(),
            'total_revenue': sum(invoice.amount for invoice in recent_invoices),
            'success_rate': (
                recent_invoices.filter(status=201).count() /
                max(recent_invoices.count(), 1) * 100
            ),
            'by_status': {
                'pending': Invoice.objects.filter(status=101).count(),
                'success': Invoice.objects.filter(status=201).count(),
                'cancelled': Invoice.objects.filter(status=102).count(),
            }
        }

    def _get_system_metrics(self):
        import psutil

        return {
            'cpu_usage': psutil.cpu_percent(),
            'memory_usage': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'uptime': time.time() - psutil.boot_time(),
        }

    def _get_events_by_month(self):
        from apps.event.models import EventModel
        from django.db.models import Count
        from django.db.models.functions import TruncMonth

        return list(
            EventModel.objects
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
            .values('month', 'count')
        )
```

---

## 🎯 CONCLUSION

TMC API adalah sistem manajemen event membership yang komprehensif dengan arsitektur modern dan skalabel. Berikut adalah highlight utama:

### ✅ **Keunggulan Arsitektur**
- **Microservices-ready**: Django apps yang terorganisir dengan baik
- **RESTful API**: Endpoints yang konsisten dan well-documented
- **Multi-platform**: Flutter mobile + React web frontend
- **Scalable**: Docker containerization dengan nginx load balancing
- **Secure**: OAuth2 authentication + role-based access control

### 🚀 **Fitur Utama**
- **Multi-role Authentication**: Admin, PIC, Member dengan permission berbeda
- **Event Management**: Registrasi, pembayaran, QR code check-in, sertifikat
- **Company Management**: Multi-company dengan PIC assignment
- **Payment System**: Invoice generation, VA numbers, payment gateway integration
- **Survey System**: Dynamic form builder dengan conditional logic
- **Notification System**: Real-time notifications dengan action buttons
- **Blog System**: Content management dengan media support
- **Analytics**: User behavior tracking dan system metrics

### 🔧 **Teknologi Modern**
- **Backend**: Django 4.2 + DRF + PostgreSQL + Redis
- **Mobile**: Flutter 2.16 + GetX + Firebase
- **Web**: React 18 + TypeScript + Vite + Tailwind CSS
- **Deployment**: Docker + Nginx + GitHub Actions CI/CD
- **Monitoring**: Sentry + Custom metrics + Health checks

### 📈 **Scalability & Performance**
- **Database Optimization**: Query optimization dengan select/prefetch related
- **Caching Strategy**: Redis caching untuk data yang sering diakses
- **CDN Integration**: Static files via CDN (AWS S3/Cloudinary)
- **Load Balancing**: Nginx reverse proxy dengan rate limiting
- **Background Tasks**: Celery untuk async processing (future enhancement)

### 🔒 **Security Measures**
- **Authentication**: OAuth2 + JWT tokens dengan auto-refresh
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation pada semua inputs
- **Rate Limiting**: API rate limiting untuk mencegah abuse
- **CORS Configuration**: Secure CORS settings
- **SQL Injection Prevention**: Django ORM protection

### 📱 **Cross-Platform Experience**
- **Consistent API**: Satu backend untuk mobile dan web
- **Responsive Design**: UI yang adaptif di berbagai devices
- **Offline Support**: Data caching untuk offline access (mobile)
- **Real-time Updates**: Firebase untuk real-time features

Sistem ini dirancang untuk mendukung growth Toyota Manufacturers Club dengan fitur-fitur yang comprehensive dan arsitektur yang scalable untuk future enhancements.

---

## 📞 SUPPORT & CONTACT

Untuk informasi lebih lanjut atau dukungan teknis:
- **Documentation**: File markdown ini
- **API Documentation**: `/api/docs/` (Swagger)
- **Admin Panel**: `/admin/` untuk backend management
- **Health Check**: `/health/` untuk system monitoring
- **Support Email**: support@tmc.id

---

*Last Updated: November 2024*
*Version: 1.0*