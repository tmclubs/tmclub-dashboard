# TMC Frontend - Deployment Guide

## Supported Platforms

- **Vercel** ⭐ (Recommended)
- **Netlify** ⭐ (Alternative)
- **Docker + Nginx** ⭐ (Self-hosted, Production)

---

# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Bun Runtime**: Ensure Bun is available (Vercel supports Bun natively)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `tmclub.id/tmc_frontend`

### 2. Configure Build Settings

Vercel will automatically detect the configuration from `vercel.json`:

- **Framework Preset**: Vite
- **Build Command**: `bun run build`
- **Install Command**: `bun install`
- **Output Directory**: `dist`

### 3. Environment Variables

**📁 Environment Files Available:**
- `.env.example`: Development template
- `.env.production`: Production template ⭐

**Quick Setup:** Copy values from `.env.production` to your deployment platform dashboard.

Set the following environment variables in Vercel Dashboard:

#### Required Variables:
```bash
VITE_API_URL=https://api.tmclub.id
VITE_API_VERSION=v1
VITE_APP_URL=https://your-domain.vercel.app
VITE_API_TIMEOUT=10000
```

#### Google OAuth (opsional):
```bash
VITE_ENABLE_GOOGLE_AUTH=false # default: nonaktif
# Jika diaktifkan (true), wajib set variabel di bawah:
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
```

#### Payment Gateway (if enabled):
```bash
VITE_FASPAY_API_URL=https://api.faspay.id
VITE_FASPAY_MERCHANT_ID=your-faspay-merchant-id
VITE_FASPAY_MERCHANT_SECRET=your-faspay-secret
VITE_FASPAY_ENVIRONMENT=production
```

#### App Configuration:
```bash
VITE_APP_NAME=TMC Web App
VITE_APP_DESCRIPTION=Toyota Manufacturers Club - Community Management Platform
VITE_APP_VERSION=1.0.0
VITE_APP_SUPPORT_EMAIL=support@tmclub.id
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_QR_SCANNER=true
VITE_DEV_TOOLS=false
VITE_LOG_LEVEL=error
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

### 4. Deploy

1. Click "Deploy" in Vercel Dashboard
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

---

# Netlify Deployment Guide

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare values from `.env.production`

## Deployment Steps

### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and authorize Netlify
4. Select your repository: `tmclub.id/tmc_frontend`

### 2. Configure Build Settings

Netlify will use the configuration from `netlify.toml`:

- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18

### 3. Environment Variables

**📁 Use `.env.production` template for quick setup.**

Go to Site settings → Environment variables and add:

#### Required Variables:
```bash
VITE_API_URL=https://api.tmclub.id
VITE_API_VERSION=v1
VITE_APP_URL=https://your-netlify-site.netlify.app
VITE_API_TIMEOUT=10000
VITE_ENABLE_GOOGLE_AUTH=false # default: nonaktif
# Jika diaktifkan (true), wajib set variabel Google berikut:
VITE_GOOGLE_CLIENT_ID=your-google-client-id-production
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret-production
VITE_GOOGLE_REDIRECT_URI=https://your-netlify-site.netlify.app/auth/callback
VITE_FASPAY_API_URL=https://api.faspay.id
VITE_FASPAY_MERCHANT_ID=your-faspay-merchant-id-production
VITE_FASPAY_MERCHANT_SECRET=your-faspay-secret-production
VITE_FASPAY_ENVIRONMENT=production
VITE_APP_NAME=TMC Web App
VITE_APP_DESCRIPTION=Toyota Manufacturers Club - Community Management Platform
VITE_APP_VERSION=1.0.0
VITE_APP_SUPPORT_EMAIL=support@tmclub.id
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_PAYMENT=true
VITE_ENABLE_QR_SCANNER=true
VITE_DEV_TOOLS=false
VITE_LOG_LEVEL=error
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx
```

### 4. Deploy

1. Click "Deploy site" in Netlify Dashboard
2. Wait for the build to complete
3. Your app will be available at `https://your-site-name.netlify.app`

## Netlify Features Configured

- **SPA Routing**: Configured via `_redirects` file
- **HTTPS Redirect**: Automatic HTTP to HTTPS redirect
- **Security Headers**: CSP, HSTS, and other security headers
- **Cache Optimization**: Static assets cached for 1 year, HTML for 1 hour
- **API Proxy**: `/api/*` routes proxied to backend
- **Build Optimization**: Node.js 18, npm caching enabled

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS records as instructed by Netlify
4. Update `VITE_APP_URL` and `VITE_GOOGLE_REDIRECT_URI` environment variables

## Netlify CLI (Optional)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from local
netlify deploy --prod
```

## Automatic Deployments

- **Production**: Pushes to `main` branch trigger production deployments
- **Preview**: Pushes to other branches create preview deployments
- **Pull Requests**: Automatically create preview deployments

## Build Optimization

The project is configured with:

- **Bun**: Fast package manager and runtime
- **Vite**: Lightning-fast build tool
- **TypeScript**: Type checking during build
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Automatic chunk splitting for better performance

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Console errors are captured
- **Build Logs**: Available in Vercel Dashboard

## Troubleshooting

### Build Failures

1. Check build logs in Vercel Dashboard
2. Ensure all environment variables are set
3. Verify TypeScript compilation: `bun run type-check`
4. Test build locally: `bun run build`

### Runtime Errors

1. Check browser console for client-side errors
2. Verify API endpoints are accessible
3. Check environment variable values
4. Review network requests in browser dev tools

## Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Type checking
bun run type-check

# Linting
bun run lint

---

# Docker + Nginx Deployment Guide

## Prerequisites

- Docker dan Docker Compose terpasang
- Port untuk Nginx tersedia (default `80`, override via `NGINX_HTTP_PORT`)
- Environment file `.env` berisi variabel Vite yang diperlukan

## Build & Run (Production)

1. Periksa status proyek dan ketersediaan port:

```bash
./manage.sh status
```

2. Jalankan produksi dengan Nginx (build otomatis menggunakan multi-stage Dockerfile):

```bash
./manage.sh docker-prod
```

Atau menggunakan Makefile:

```bash
make deploy
```

3. Akses aplikasi:

- `http://localhost:${NGINX_PORT:-8080}`

## Konfigurasi yang Digunakan

- `docker-compose.yml` menjalankan satu service utama produksi:
  - `nginx`: build target `web` dari `Dockerfile` yang otomatis membangun aplikasi (stage `builder`) dan menyalin `dist` ke `/usr/share/nginx/html` untuk dilayani secara statik.
- `nginx/nginx.conf` berisi konfigurasi server statik untuk SPA:
  - Fallback `try_files $uri $uri/ /index.html;` agar routing SPA bekerja.
  - Caching untuk `/assets/` dengan header `immutable`.
  - Header keamanan (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `CSP`).
- Stage `web` pada `Dockerfile` bertindak sebagai image Nginx produksi dengan healthcheck aktif.

## Environment Variables

Tambahkan variabel ini pada `.env` untuk build:

```env
VITE_API_URL=https://api.tmclub.id
VITE_APP_URL=https://your-domain
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=https://your-domain/auth/callback
NGINX_PORT=8080
```

Variabel `VITE_*` diteruskan sebagai build args ke image `nginx` (target `web`) pada `docker-compose.yml` sehingga build Vite mengambil nilai yang benar.

## Keamanan

- Header keamanan diaktifkan: `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `CSP`.
- Healthcheck container Nginx aktif via `curl` ke `http://localhost/`.

## Perintah Operasional

```bash
# Stop containers
./manage.sh docker-stop

# Lihat log
./manage.sh docker-logs

# Bersihkan resources
./manage.sh docker-clean
```
bun run lint:fix

# Formatting
bun run format
```

## Performance Tips

1. **Image Optimization**: Use Vercel's built-in image optimization
2. **Caching**: Configure appropriate cache headers
3. **Bundle Analysis**: Use `bun run build --analyze` to analyze bundle size
4. **Lazy Loading**: Implement route-based code splitting

## Security

- All sensitive data should be in environment variables
- Never commit `.env.local` or `.env.production` with real values
- Use HTTPS in production (automatic with Vercel)
- Configure CORS properly for API calls