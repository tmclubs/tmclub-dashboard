# GitHub Secrets Configuration for TMClub Dashboard

## Required Setup

Configure these secrets in your GitHub repository at:
**Settings → Secrets and variables → Actions → Secrets**

---

## Docker Registry Secrets

```bash
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-access-token
```

**How to get Docker Hub token:**
1. Login to Docker Hub
2. Go to Account Settings → Security → Access Tokens
3. Create new token with Read/Write/Delete permissions
4. Copy the token immediately (you won't see it again)

---

## Application Secrets

```bash
VITE_API_URL=https://api.tmclub.id
VITE_APP_URL=https://tmclub.id
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://tmclub.id/auth/callback
VITE_FASPAY_API_URL=https://api.faspay.id
VITE_FASPAY_MERCHANT_ID=your-merchant-id
VITE_FASPAY_MERCHANT_SECRET=your-merchant-secret
```

---

## Deployment Secrets (for cd-deploy.yml)

Based on your server: **tmc-user@103.197.188.206**

```bash
DEPLOY_HOST=103.197.188.206
DEPLOY_USER=tmc-user
DEPLOY_SSH_KEY=<paste your private SSH key here>
DEPLOY_PORT=22
DEPLOY_PATH=~/tmclub-dashboard
```

### Generate SSH Key for Deployment

**On your server (103.197.188.206):**

```bash
# SSH to server
ssh tmc-user@103.197.188.206

# Generate deployment key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-actions

# Add public key to authorized_keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# Display private key (copy this to GitHub secret DEPLOY_SSH_KEY)
cat ~/.ssh/github-actions
```

**Copy the entire private key output** (including `-----BEGIN` and `-----END` lines) and paste it into GitHub secret `DEPLOY_SSH_KEY`.

---

## Variables (Non-Sensitive)

Configure these in:
**Settings → Secrets and variables → Actions → Variables**

```bash
VITE_APP_NAME=TMClub
VITE_APP_DESCRIPTION=Toyota Manufacturers Club
VITE_FASPAY_ENVIRONMENT=production
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

---

## Quick Setup Commands

```bash
# 1. Add all secrets via GitHub CLI (if installed)
gh secret set DOCKER_USERNAME
gh secret set DOCKER_PASSWORD
gh secret set VITE_API_URL
# ... (repeat for all secrets)

# 2. Or use GitHub UI
# Go to: https://github.com/YOUR_USERNAME/tmclub-dashboard/settings/secrets/actions
```

---

## Verify Configuration

After adding all secrets, you can verify by:

1. Go to **Actions** tab
2. Run **CI - Test & Build** workflow manually
3. Check if build succeeds with environment variables

---

## Security Notes

- ✅ Never commit `.env` files with real values
- ✅ Rotate tokens every 6 months
- ✅ Use minimal permissions for Docker tokens
- ✅ Restrict SSH key to deployment user only
- ✅ Enable 2FA on Docker Hub and GitHub
