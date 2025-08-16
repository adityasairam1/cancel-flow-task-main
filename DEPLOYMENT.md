# Deployment Guide

This guide covers deploying the Migrate Mate cancellation flow to various platforms.

## 🚀 Quick Deploy Options

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/cancel-flow-task-main)

1. **Connect Repository**
   - Fork or clone this repository
   - Connect to Vercel from the dashboard

2. **Configure Environment Variables**
   ```bash
   # Required
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
   
   # Optional
   NEXT_PUBLIC_APP_NAME=Migrate Mate
   NEXT_PUBLIC_ENABLE_AB_TESTING=true
   NEXT_PUBLIC_ENABLE_ANALYTICS=true
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Each push to main branch triggers a new deployment

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/cancel-flow-task-main)

1. **Connect Repository**
   - Connect your GitHub repository to Netlify

2. **Build Settings**
   ```bash
   Build command: npm run build
   Publish directory: .next
   Node version: 18
   ```

3. **Environment Variables**
   - Add all environment variables in Netlify dashboard
   - Same variables as Vercel configuration

## 🚀 Simple Deployment

### Prerequisites
- Node.js 18+ installed
- Supabase Cloud account (free tier available)
- Git repository

### Quick Deploy Steps
1. **Push your code to GitHub**
2. **Connect to your preferred platform** (Vercel/Netlify)
3. **Add environment variables** in the platform dashboard
4. **Deploy automatically** on every push

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_cloud_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## ☁️ Cloud Platform Deployments

### AWS (ECS/Fargate)

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name migrate-mate-cancel-flow
   ```

2. **Build and Push Image**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   docker build -t migrate-mate-cancel-flow .
   docker tag migrate-mate-cancel-flow:latest your-account.dkr.ecr.us-east-1.amazonaws.com/migrate-mate-cancel-flow:latest
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/migrate-mate-cancel-flow:latest
   ```

3. **Create ECS Task Definition**
   ```json
   {
     "family": "migrate-mate-cancel-flow",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::your-account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "app",
         "image": "your-account.dkr.ecr.us-east-1.amazonaws.com/migrate-mate-cancel-flow:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NEXT_PUBLIC_SUPABASE_URL",
             "value": "your_supabase_url"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/migrate-mate-cancel-flow",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

### Google Cloud Platform (Cloud Run)

1. **Build and Push to GCR**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/migrate-mate-cancel-flow
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy migrate-mate-cancel-flow \
     --image gcr.io/your-project/migrate-mate-cancel-flow \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   ```

### Azure (Container Instances)

1. **Build and Push to ACR**
   ```bash
   az acr build --registry your-registry --image migrate-mate-cancel-flow .
   ```

2. **Deploy to Container Instances**
   ```bash
   az container create \
     --resource-group your-rg \
     --name migrate-mate-cancel-flow \
     --image your-registry.azurecr.io/migrate-mate-cancel-flow:latest \
     --dns-name-label migrate-mate-cancel-flow \
     --ports 3000 \
     --environment-variables NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   ```

## 🔧 Manual Server Deployment

### Prerequisites
- Node.js 18+ installed
- PM2 or similar process manager (optional)
- Nginx or Apache for reverse proxy (optional)

### 1. Build Application
```bash
npm install
npm run build
```

### 2. Setup Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'migrate-mate-cancel-flow',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
      SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_key'
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use secrets management in production
- Rotate keys regularly

### Supabase Security
- Enable Row Level Security (RLS)
- Use service role key only on server-side
- Implement proper authentication

### HTTPS
- Always use HTTPS in production
- Redirect HTTP to HTTPS
- Use secure headers

### Monitoring
- Set up health checks
- Monitor error rates
- Track performance metrics

## 📊 Performance Optimization

### Build Optimization
```bash
# Enable build caching
npm run build --cache

# Analyze bundle size
npm run build --analyze
```

### Runtime Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies

### Database Optimization
- Use connection pooling
- Optimize queries
- Monitor database performance

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf .next
npm run build

# Check Node.js version
node --version
```

#### Runtime Errors
```bash
# Check logs
pm2 logs migrate-mate-cancel-flow

# Restart application
pm2 restart migrate-mate-cancel-flow
```

#### Database Connection Issues
```bash
# Test connection
curl -X GET "your_supabase_url/rest/v1/" \
  -H "apikey: your_supabase_anon_key"
```

### Health Check Endpoint
Add to your application:
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION
  });
}
```

## 📈 Monitoring & Analytics

### Application Monitoring
- Set up error tracking (Sentry)
- Monitor performance (New Relic, DataDog)
- Track user analytics

### Infrastructure Monitoring
- Monitor server resources
- Set up alerts for downtime
- Track deployment metrics

### Database Monitoring
- Monitor query performance
- Track connection usage
- Set up backup alerts

---

For additional support, refer to the main README.md file or create an issue in the repository.
