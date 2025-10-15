# TMC Frontend - Vercel Deployment Guide

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

Set the following environment variables in Vercel Dashboard:

#### Required Variables:
```bash
VITE_API_URL=https://api.tmclub.id
VITE_API_VERSION=v1
VITE_APP_URL=https://your-domain.vercel.app
VITE_API_TIMEOUT=10000
```

#### Google OAuth (if enabled):
```bash
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