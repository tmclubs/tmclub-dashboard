# CI/CD Configuration for TMClub Dashboard

This directory contains GitHub Actions workflows for automated testing, building, and deployment.

## Workflows

### 1. CI - Test & Build (`ci.yml`)

**Triggered on:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Steps:**
1. Checkout code
2. Setup Node.js 20 with npm caching
3. Install dependencies (`npm ci`)
4. Run TypeScript type checking
5. Run ESLint
6. Run tests (if available)
7. Build application
8. Upload build artifacts

**Environment Variables:**
- All `VITE_*` variables for build configuration
- See `.env.example` for full list

---

### 2. CD - Build & Push Docker Image (`cd-docker.yml`)

**Triggered on:**
- Push to `main` branch
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Docker Buildx
3. Login to Docker Hub
4. Extract metadata (tags, labels)
5. Build and push Docker image with cache
6. Display image digest and pull commands

**Docker Tags:**
- `latest` (for main branch)
- `main-{sha}` (commit-specific)
- `{branch}` (branch name)

**Cache Strategy:**
- Uses build cache from Docker registry
- Speeds up subsequent builds significantly

---

### 3. CD - Deploy to Server (`cd-deploy.yml`) - Optional

**Triggered on:**
- Manual workflow dispatch only

**Parameters:**
- `environment`: Choose `production` or `staging`

**Steps:**
1. Checkout code
2. SSH to deployment server
3. Pull latest Docker image
4. Stop old containers
5. Start new containers
6. Verify deployment
7. Check logs

---

## Required Secrets

Configure these in **GitHub Repository Settings → Secrets and variables → Actions**:

### Docker Registry
```
DOCKER_USERNAME        - Docker Hub username
DOCKER_PASSWORD        - Docker Hub access token/password
```

### Application Configuration
```
VITE_API_URL                  - Backend API endpoint
VITE_APP_URL                  - Frontend app URL
VITE_GOOGLE_CLIENT_ID         - Google OAuth client ID
VITE_GOOGLE_REDIRECT_URI      - OAuth redirect URL
VITE_FASPAY_API_URL           - Faspay payment gateway URL
VITE_FASPAY_MERCHANT_ID       - Faspay merchant ID
VITE_FASPAY_MERCHANT_SECRET   - Faspay merchant secret
```

### Deployment (Optional)
```
DEPLOY_HOST           - Server IP/hostname
DEPLOY_USER           - SSH username
DEPLOY_SSH_KEY        - Private SSH key (full key content)
DEPLOY_PORT           - SSH port (default: 22)
DEPLOY_PATH           - Project path on server (default: /opt/tmclub-dashboard)
```

---

## Required Variables (Non-Sensitive)

Configure these in **GitHub Repository Settings → Secrets and variables → Actions → Variables**:

```
VITE_APP_NAME                  - Application name (default: TMClub)
VITE_APP_DESCRIPTION           - App description
VITE_FASPAY_ENVIRONMENT        - production/staging
VITE_ENABLE_GOOGLE_AUTH        - true/false
VITE_ENABLE_ANALYTICS          - true/false
VITE_ENABLE_NOTIFICATIONS      - true/false
VITE_ENABLE_PAYMENT            - true/false
VITE_ENABLE_QR_SCANNER         - true/false
VITE_DEV_TOOLS                 - false (production)
VITE_LOG_LEVEL                 - error/warn/info/debug
VITE_MAX_FILE_SIZE             - 10485760 (10MB)
VITE_ALLOWED_FILE_TYPES        - jpg,jpeg,png,pdf,doc,docx
```

---

## Setup Instructions

### 1. Configure Docker Hub

1. Create Docker Hub account at https://hub.docker.com
2. Create access token:
   - Go to Account Settings → Security → Access Tokens
   - Click "New Access Token"
   - Name: `github-actions-tmclub`
   - Permissions: Read, Write, Delete
   - Copy the token (you won't see it again!)

3. Add to GitHub Secrets:
   - Go to repository → Settings → Secrets and variables → Actions
   - New repository secret:
     - Name: `DOCKER_USERNAME` → Your Docker Hub username
     - Name: `DOCKER_PASSWORD` → The access token

### 2. Configure Application Secrets

Add all `VITE_*` secrets following the template in `.env.example`:

```bash
# Example values (use your actual values!)
VITE_API_URL=https://api.tmclub.id
VITE_APP_URL=https://tmclub.id
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://tmclub.id/auth/callback
```

### 3. Configure Deployment (Optional)

If using automated deployment:

1. Generate SSH key pair on your server:
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions
   ```

2. Add public key to server's `~/.ssh/authorized_keys`

3. Copy **private key** content to GitHub Secret `DEPLOY_SSH_KEY`

4. Add other deployment secrets:
   ```
   DEPLOY_HOST=your-server-ip
   DEPLOY_USER=deploy-user
   DEPLOY_PATH=/opt/tmclub-dashboard
   ```

---

## Usage

### Continuous Integration

CI runs automatically on every push and pull request:
```bash
# Push to trigger CI
git push origin develop
```

### Docker Build & Push

Automatically runs on push to `main`:
```bash
# Merge PR to main
git checkout main
git merge develop
git push origin main
```

Or trigger manually:
```bash
# Via GitHub UI: Actions → CD - Build & Push → Run workflow
```

### Manual Deployment

1. Go to GitHub Actions
2. Select "CD - Deploy to Server"
3. Click "Run workflow"
4. Choose environment (production/staging)
5. Click "Run workflow"

---

## Docker Image Usage

After CI/CD builds and pushes the image:

```bash
# Pull latest image
docker pull yourusername/tmclub-dashboard:latest

# Pull specific commit
docker pull yourusername/tmclub-dashboard:main-abc1234

# Run with docker-compose (on server)
cd /opt/tmclub-dashboard
docker-compose pull
docker-compose up -d
```

---

## Monitoring

### GitHub Actions Dashboard

- View all workflow runs: Actions tab
- Check build logs
- Debug failures
- View artifacts

### Notifications

GitHub automatically notifies on:
- Build failures
- Deployment issues
- PR checks

---

## Troubleshooting

### Build Failures

**Problem**: Type check fails
```
Solution: Run locally first
npm run type-check
Fix errors, commit, push
```

**Problem**: Lint errors
```
Solution: Auto-fix locally
npm run lint:fix
Commit fixed code
```

**Problem**: Build fails
```
Solution: Check environment variables
Verify all VITE_* secrets are set in GitHub
```

### Docker Build Issues

**Problem**: Authentication failed
```
Solution: Regenerate Docker Hub token
Update DOCKER_PASSWORD secret
```

**Problem**: Build timeout
```
Solution: Check Dockerfile efficiency
Review dependencies
Enable build cache
```

### Deployment Issues

**Problem**: SSH connection failed
```
Solution: Verify SSH key is correct
Check server firewall allows GitHub IPs
Test SSH manually
```

**Problem**: Container fails to start
```
Solution: Check environment variables
Review docker-compose.yml
Check server resources (disk, memory)
```

---

## Best Practices

1. **Always test locally first**
   ```bash
   make ci  # Run full CI pipeline
   ```

2. **Use pull requests**
   - Create PR from feature branch
   - CI runs automatically
   - Merge after green checks

3. **Tag releases**
   ```bash
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   ```

4. **Monitor build times**
   - Keep builds under 5 minutes
   - Use caching effectively
   - Optimize dependencies

5. **Secure secrets**
   - Never commit `.env` files
   - Rotate secrets regularly
   - Use GitHub Environments for production

---

## Rollback Procedure

If deployment fails:

```bash
# SSH to server
ssh user@server

# Navigate to project
cd /opt/tmclub-dashboard

# Pull previous image
docker pull yourusername/tmclub-dashboard:main-<previous-sha>

# Update docker-compose.yml to use specific tag
# Or pull by digest

# Restart containers
docker-compose up -d
```

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [SSH Action](https://github.com/appleboy/ssh-action)

---

## Maintenance

Regular tasks:
- Review and update dependencies monthly
- Monitor build cache effectiveness
- Clean old Docker images quarterly
- Audit secrets and tokens annually
