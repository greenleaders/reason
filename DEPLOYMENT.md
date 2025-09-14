# Deployment Guide

This guide covers deploying the Social Media Management Platform to production.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Domain name and SSL certificate
- Stripe account for payments
- File storage solution (AWS S3, Google Cloud Storage, etc.)

## Environment Setup

### 1. Database Setup

Create a production PostgreSQL database:

```bash
# Create production database
createdb social_media_platform_prod

# Run migrations
cd server
npm run migrate
```

### 2. Environment Variables

Create production environment files:

**Server (.env):**
```env
# Database Configuration
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=social_media_platform_prod
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_db_password

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Stripe Configuration (Production Keys)
STRIPE_SECRET_KEY=sk_live_your_stripe_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
CLIENT_URL=https://your-domain.com
```

**Client (.env):**
```env
REACT_APP_API_URL=https://api.your-domain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_live_publishable_key
```

## Deployment Options

### Option 1: VPS/Cloud Server (Recommended)

#### Using PM2 for Process Management

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Build the client:**
   ```bash
   cd client
   npm run build
   ```

3. **Create PM2 ecosystem file (ecosystem.config.js):**
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'social-media-api',
         script: './server/index.js',
         cwd: './',
         instances: 'max',
         exec_mode: 'cluster',
         env: {
           NODE_ENV: 'production',
           PORT: 5000
         },
         error_file: './logs/api-error.log',
         out_file: './logs/api-out.log',
         log_file: './logs/api-combined.log',
         time: true
       }
     ]
   };
   ```

4. **Start the application:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### Using Nginx as Reverse Proxy

Create `/etc/nginx/sites-available/social-media-platform`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Serve React app
    location / {
        root /path/to/your/app/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Docker Deployment

#### Create Dockerfile for Backend

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY server/ ./

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "index.js"]
```

#### Create Dockerfile for Frontend

```dockerfile
# client/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: social_media_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: .
      dockerfile: server/Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PASSWORD=your_password
    depends_on:
      - postgres
    ports:
      - "5000:5000"
    volumes:
      - ./server/uploads:/app/uploads

  client:
    build:
      context: .
      dockerfile: client/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

### Option 3: Cloud Platform Deployment

#### Heroku

1. **Install Heroku CLI**

2. **Create Heroku apps:**
   ```bash
   heroku create your-app-name-api
   heroku create your-app-name-client
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production -a your-app-name-api
   heroku config:set DB_HOST=your_db_host -a your-app-name-api
   # ... other variables
   ```

4. **Deploy:**
   ```bash
   git subtree push --prefix server heroku main
   ```

#### AWS/GCP/Azure

Use container services like:
- AWS ECS/EKS
- Google Cloud Run/GKE
- Azure Container Instances/AKS

## Security Considerations

### 1. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access by IP
- Regular backups

### 2. Application Security
- Use HTTPS in production
- Set secure headers
- Implement rate limiting
- Regular security updates

### 3. File Upload Security
- Validate file types and sizes
- Scan for malware
- Store files outside web root
- Use CDN for file delivery

### 4. Environment Variables
- Never commit .env files
- Use secrets management
- Rotate keys regularly

## Monitoring and Logging

### 1. Application Monitoring
- Use PM2 monitoring
- Set up health checks
- Monitor error rates
- Track performance metrics

### 2. Database Monitoring
- Monitor connection pools
- Track query performance
- Set up alerts for issues

### 3. Log Management
- Centralized logging
- Log rotation
- Error tracking (Sentry, Bugsnag)

## Backup Strategy

### 1. Database Backups
```bash
# Daily backup script
pg_dump social_media_platform_prod > backup_$(date +%Y%m%d).sql
```

### 2. File Backups
- Regular uploads directory backup
- Version control for code
- Environment configuration backup

## SSL Certificate Setup

### Using Let's Encrypt (Certbot)
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Using Cloudflare
1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption
4. Configure page rules

## Performance Optimization

### 1. Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize images

### 2. Backend
- Database indexing
- Query optimization
- Connection pooling
- Caching (Redis)

### 3. Database
- Regular VACUUM and ANALYZE
- Monitor slow queries
- Optimize indexes
- Connection pooling

## Health Checks

Create health check endpoints:

```javascript
// server/routes/health.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check connection string
   - Verify database is running
   - Check firewall settings

2. **File Upload Issues**
   - Check directory permissions
   - Verify file size limits
   - Check disk space

3. **CORS Issues**
   - Verify CLIENT_URL setting
   - Check nginx configuration
   - Test API endpoints

4. **Stripe Issues**
   - Verify API keys
   - Check webhook configuration
   - Test payment flow

### Logs Location
- Application logs: `./logs/`
- Nginx logs: `/var/log/nginx/`
- PM2 logs: `pm2 logs`

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor disk space
- Check error logs
- Review security updates
- Backup verification

### Scaling Considerations
- Horizontal scaling with load balancer
- Database read replicas
- CDN for static assets
- Caching layer (Redis)
- Microservices architecture for large scale
