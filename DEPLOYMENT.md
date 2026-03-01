# Deployment Guide - CipherSQLStudio

Comprehensive guide for deploying CipherSQLStudio to production environments.

## Table of Contents
1. [Frontend Deployment](#frontend-deployment)
2. [Backend Deployment](#backend-deployment)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [CI/CD Setup](#cicd-setup)
6. [Post-Deployment Verification](#post-deployment-verification)

## Frontend Deployment

### Option 1: Vercel (Recommended)

**Advantages:**
- Zero-config deployment
- Automatic HTTPS
- Global CDN
- Easy environment management

**Steps:**

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select "Next.js" framework (or let it auto-detect Vite)

3. **Configure Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://api.yourdomain.com/api
     VITE_APP_TITLE=CipherSQLStudio
     ```

4. **Deploy**
   ```bash
   npm run build
   # Vercel automatically deploys from main branch
   ```

### Option 2: Netlify

**Steps:**

1. **Build locally**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Configure in Netlify**
   - Site settings → Build & deploy
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment variables: Set VITE_API_URL

### Option 3: Custom Server (AWS, DigitalOcean, etc.)

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Upload dist folder**
   ```bash
   scp -r dist/* user@server:/var/www/ciphersqlstudio
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       root /var/www/ciphersqlstudio;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://backend-server:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## Backend Deployment

### Option 1: Heroku (Docker)

**Steps:**

1. **Create Heroku app**
   ```bash
   heroku create ciphersqlstudio-api
   ```

2. **Create Dockerfile in backend/**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist/ ./dist/
   EXPOSE 5000
   CMD ["node", "dist/index.js"]
   ```

3. **Build and push**
   ```bash
   heroku login
   npm run build
   heroku container:push web
   heroku container:release web
   ```

4. **Set environment variables**
   ```bash
   heroku config:set POSTGRES_HOST=your-db.postgresql.net
   heroku config:set POSTGRES_USER=postgres
   heroku config:set POSTGRES_PASSWORD=***
   heroku config:set POSTGRES_DB=ciphersql_prod
   heroku config:set MONGODB_URI=mongodb+srv://...
   heroku config:set OPENAI_API_KEY=sk-...
   ```

### Option 2: AWS EC2

**Steps:**

1. **Launch EC2 instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance type: t3.small or larger
   - Security groups: Allow 80, 443, 5000

2. **SSH into instance**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install dependencies**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql
   ```

4. **Clone and setup**
   ```bash
   git clone https://github.com/your-repo/ciphersqlstudio.git
   cd ciphersqlstudio/backend
   npm install
   npm run build
   ```

5. **Use PM2 for process management**
   ```bash
   sudo npm install -g pm2
   pm2 start dist/index.js --name "ciphersql-api"
   pm2 startup
   pm2 save
   ```

6. **Configure Nginx**
   ```bash
   sudo apt install nginx
   # Use Nginx config from Option 3 above
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

### Option 3: Railway or Render

**Railway:**
1. Sign up at railway.app
2. Connect GitHub repository
3. Add PostgreSQL and MongoDB plugins
4. Set environment variables
5. Deploy automatically

**Render:**
1. Sign up at render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `npm run build`
5. Set start command: `node dist/index.js`

## Database Configuration

### PostgreSQL Production Setup

**AWS RDS:**
1. Create RDS instance (PostgreSQL 14+)
2. Configure security group to allow connections
3. Update connection string in backend .env:
   ```
   POSTGRES_HOST=your-rds-endpoint
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=strong-password
   POSTGRES_DB=ciphersql_production
   ```

**DigitalOcean Database:**
1. Create managed PostgreSQL cluster
2. Get connection string
3. Add IP whitelist for your backend server

**Schema Migration:**
```bash
# Connect to production database
psql -h your-prod-server -U postgres -d ciphersql_production

# Run schema setup (backend initializes on startup)
```

### MongoDB Atlas Production Setup

1. **Create MongoDB Atlas account**: https://www.mongodb.com/cloud/atlas

2. **Create cluster**
   - Choose region close to backend
   - Select M0 (free) or paid tier
   - Configure security

3. **Get connection string**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority
   ```

4. **Add to backend .env**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ciphersqlstudio
   ```

5. **Seed initial data**
   ```bash
   # SSH into backend server
   npm run seed
   ```

## Environment Variables

### Backend Production (.env)

```env
# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# PostgreSQL
POSTGRES_HOST=your-rds-endpoint.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=strong-production-password
POSTGRES_DB=ciphersql_production

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ciphersqlstudio

# LLM
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-production-key-here

# Security
JWT_SECRET=strong-random-secret-key
QUERY_TIMEOUT=5000
```

### Frontend Production (.env)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_TITLE=CipherSQLStudio
```

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npm run deploy

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build backend
        run: |
          cd backend
          npm install
          npm run build
      
      - name: Deploy to Heroku
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
        run: |
          git push heroku main
```

## SSL/HTTPS Configuration

### Let's Encrypt (Free)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Generate certificate**
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
   ```

3. **Configure Nginx**
   ```nginx
   listen 443 ssl http2;
   ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
   ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
   ```

4. **Auto-renewal**
   ```bash
   sudo systemctl enable certbot.timer
   sudo systemctl start certbot.timer
   ```

## Post-Deployment Verification

### Health Checks

1. **Backend Health**
   ```bash
   curl https://api.yourdomain.com/api/health
   # Expected: { "status": "OK", "timestamp": "..." }
   ```

2. **Frontend Loading**
   - Visit https://yourdomain.com
   - Check DevTools console for errors
   - Verify API calls work

3. **Database Connections**
   ```bash
   # SSH to backend server
   npm run seed  # Should complete without errors
   ```

4. **LLM Integration**
   - Create test assignment
   - Click "Get Hint"
   - Verify hint appears

### Monitoring & Logging

**Backend Logs:**
```bash
# Heroku
heroku logs --tail

# EC2
tail -f /var/log/pm2/ciphersql-api-0.log

# Railway/Render
View logs in dashboard
```

**Error Tracking (Optional):**
```bash
# Install Sentry
npm install @sentry/node

# Configure in index.ts
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**Performance Monitoring:**
- Set up CloudWatch (AWS)
- Monitor response times
- Track error rates
- Alert on high latency

### Backup Strategy

**PostgreSQL:**
```bash
# Automated backups
AWS RDS: Enable automated backups (7-35 days)

# Manual backup
pg_dump -h your-server -U postgres -d ciphersql_prod > backup.sql

# Restore
psql -h your-server -U postgres -d ciphersql_prod < backup.sql
```

**MongoDB:**
- Enable Atlas automatic backups (free tier: 8 snapshots)
- Configure backup retention policy
- Test restore procedures

## Scaling Considerations

### Horizontal Scaling

**Load Balancer:**
```nginx
upstream backend {
    server backend1.internal:5000;
    server backend2.internal:5000;
    server backend3.internal:5000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

**Database Scaling:**
- PostgreSQL: Read replicas
- MongoDB: Sharding (Pro tier)

### Performance Optimization

1. **Frontend:**
   - Enable gzip compression
   - Minify CSS/JS
   - Cache static assets
   - Use CDN

2. **Backend:**
   - Connection pooling
   - Query caching
   - Rate limiting
   - Lazy loading

## Troubleshooting

### Common Issues

**"502 Bad Gateway"**
- Check backend process is running
- Verify environment variables
- Check database connections
- Review backend logs

**"CORS errors"**
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in Express

**"Database connection timeout"**
- Verify connection string
- Check IP whitelist (MongoDB Atlas)
- Ensure server can reach database

**"LLM API errors"**
- Verify API key is valid
- Check account has credits
- Review rate limits

## Rollback Procedure

### Frontend
```bash
# Revert to previous deployment
vercel rollback  # Vercel
# or
git revert HEAD
git push origin main
```

### Backend
```bash
# Heroku
heroku releases
heroku rollback v2

# EC2
git checkout previous-commit
npm run build
pm2 reload ciphersql-api
```

---

For more information, see:
- [README.md](README.md) - Setup guide
- [QUICK_START.md](QUICK_START.md) - Development setup
- [DATA_FLOW.md](DATA_FLOW.md) - Architecture overview
