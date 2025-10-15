# TMC API Authentication Documentation for Frontend Implementation

## Overview
TMC API provides multiple authentication methods for the Toyota Manufacturers Club application. The system uses Token-based authentication (Django REST Framework Token Authentication).

## Base URL
```
http://localhost:1338 (development)
```

## Authentication Methods

### 1. Manual Registration & Login (Email/Password)

#### Register User
**Endpoint:** `POST /authentication/basic-register/`
**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "code": "2000101",
  "message": {
    "en": "User registered successfully!",
    "id": "Registrasi berhasil!"
  },
  "data": {
    "id": 123,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John"
  }
}
```

#### Login User
**Endpoint:** `POST /authentication/basic-login/`
**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "john@example.com", // Can be email OR username
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": "2000102",
  "message": {
    "en": "Successfully authenticated!",
    "id": "Login sukses!"
  },
  "data": {
    "token": "abc123def456...",
    "login_method": "email" // or "username"
  }
}
```

**Error Response (422):**
```json
{
  "status": "error",
  "code": "4220101",
  "message": {
    "en": "Authentication failed",
    "id": "Ontentikasi gagal"
  },
  "data": {}
}
```

### 2. OAuth Authentication (Google)

#### OAuth Login/Register
**Endpoint:** `POST /authentication/`
**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "uid": "google_user_id_123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "code": "2000102",
  "message": {
    "en": "Successfully authenticated!",
    "id": "Login sukses!"
  },
  "data": {
    "uid": "google_user_id_123",
    "token": "abc123def456...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "member" // "member", "admin", or "PIC"
  }
}
```

### 3. Google Token Access
**Endpoint:** `POST /google-token`
**Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "access_token": "google_access_token"
}
```

## Using Authentication Token

### Authorization Header
For all authenticated endpoints, include:
```
Authorization: Token <your-token>
```

### Token Storage (Frontend)
- Store token securely (localStorage, sessionStorage, or secure cookies)
- Include token in all subsequent API requests
- Handle token expiration/renewal

## User Roles
The system assigns roles based on user profile:
- **member**: Regular user
- **admin**: Staff user (is_staff=True)
- **PIC**: Person In Charge for a company

## Error Codes
- `4220101`: User not found
- `4220102`: Invalid password
- `2000101`: Registration successful
- `2000102`: Login successful

## Frontend Implementation Plan

### 1. Create Authentication Service
- HTTP client setup with token interceptor
- Login/register/logout functions
- Token storage management
- Auto-logout on token expiry

### 2. State Management
- User profile storage
- Authentication state tracking
- Role-based access control

### 3. Route Protection
- Auth guards for protected routes
- Role-based route access
- Redirect logic for unauthenticated users

### 4. UI Components
- Login form with validation
- Registration form
- Password reset flow
- Profile management

## Example Frontend Implementation

### JavaScript/TypeScript Example
```javascript
// Auth Service
class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(email, password) {
    const response = await fetch('/authentication/basic-login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password
      })
    });

    const data = await response.json();
    if (data.status === 'success') {
      this.token = data.data.token;
      this.user = data.data.user;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    }
    return data;
  }

  async register(userData) {
    const response = await fetch('/authentication/basic-register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    return await response.json();
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getAuthHeader() {
    return this.token ? { 'Authorization': `Token ${this.token}` } : {};
  }
}
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user profile
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const authService = new AuthService();
    const result = await authService.login(email, password);
    if (result.status === 'success') {
      setUser(result.data.user);
    }
    return result;
  };

  const logout = () => {
    const authService = new AuthService();
    authService.logout();
    setUser(null);
  };

  return { user, login, logout, loading };
}
```

## Testing Endpoints

### Using curl
```bash
# Register user
curl -X POST http://localhost:1338/authentication/basic-register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "first_name": "Test User"
  }'

# Login user
curl -X POST http://localhost:1338/authentication/basic-login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "testpass123"
  }'

# Access protected endpoint
curl -X GET http://localhost:1338/account/me/ \
  -H "Authorization: Token <your-token-here>"
```

This documentation provides complete information for implementing authentication in frontend applications using the TMC API.