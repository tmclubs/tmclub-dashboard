# Testing Login Functionality

## Status Perbaikan Error ✅

Error yang sebelumnya terjadi sudah **DIPERBAIKI**:
- ❌ `Failed to load resource: the server responded with a status of 404 ()`
- ❌ `Login error: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Root Cause**: 
1. Backend API tidak berjalan di port 1338
2. Konflik konfigurasi antara authStore dan proxy Vite

**Solusi**: 
1. Mock API server dibuat dan berjalan di port 1338
2. AuthStore diperbaiki untuk menggunakan proxy Vite (`/api` prefix)

### Masalah yang Ditemukan:
1. **Backend API tidak berjalan** - Error 404 terjadi karena tidak ada server di port 1338
2. **JSON parsing error** - Terjadi karena frontend mencoba parse HTML error page sebagai JSON

### Solusi yang Diterapkan:
1. **Mock API Server** - Dibuat mock server di port 1338 yang mensimulasikan backend API
2. **Frontend Server** - Berjalan di http://localhost:5174/
3. **Mock API Server** - Berjalan di http://localhost:1338/

## Cara Test Login

### 1. Akses Aplikasi
Buka browser dan kunjungi: **http://localhost:5174/login**

### 2. Test Credentials
Gunakan salah satu dari test user berikut:

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Role: admin

**Regular User:**
- Username: `user`  
- Password: `user123`
- Role: member

### 3. Test Steps
1. Masukkan username dan password
2. Klik tombol "Sign In"
3. Jika berhasil, akan redirect ke dashboard
4. Jika gagal, akan muncul error message

### 4. Expected Behavior
- ✅ Login berhasil dengan credentials yang benar
- ✅ Error message muncul dengan credentials yang salah
- ✅ Redirect ke dashboard setelah login berhasil
- ✅ Token tersimpan di localStorage
- ✅ User state ter-update di aplikasi

## Technical Details

### API Endpoint
- **URL**: `http://localhost:1338/authentication/manual-login/`
- **Method**: POST
- **Content-Type**: application/json

### Request Format
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Response Format (Success)
```json
{
  "status_code": 200,
  "success_code": "2000102",
  "message": {
    "en": "Login successful",
    "id": "Login berhasil"
  },
  "data": {
    "token": "mock_token_1_1760515990583",
    "login_method": "manual",
    "role": "admin",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@tmclub.id",
      "firstName": "Admin",
      "lastName": "User",
      "company": "TMC Admin",
      "role": "admin"
    }
  }
}
```

### Response Format (Error)
```json
{
  "status_code": 422,
  "success_code": "4220101",
  "message": {
    "en": "Invalid username or password",
    "id": "Username atau password salah"
  },
  "data": null
}
```

## Servers Status

### Frontend Server
- **Status**: ✅ Running
- **URL**: http://localhost:5174/
- **Command**: `bun run dev`

### Mock API Server  
- **Status**: ✅ Running
- **URL**: http://localhost:1338/
- **Command**: `node mock-server.js`
- **Health Check**: http://localhost:1338/health

## Next Steps

1. **Test login functionality** dengan credentials di atas
2. **Verify dashboard access** setelah login berhasil
3. **Test logout functionality** 
4. **Replace mock server** dengan backend API yang sebenarnya ketika sudah siap

## Troubleshooting

### Jika Login Masih Error:
1. Pastikan kedua server berjalan (frontend di 5174, API di 1338)
2. Check browser console untuk error messages
3. Verify network requests di browser DevTools
4. Check mock server logs untuk request yang masuk

### Jika Server Tidak Berjalan:
```bash
# Frontend
bun run dev

# Mock API (di terminal terpisah)
node mock-server.js
```