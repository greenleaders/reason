# Quick Start Guide

Get the Social Media Management Platform up and running in 5 minutes!

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

## 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd social-media-management-platform

# Install all dependencies
npm run install-all
```

## 2. Database Setup

```bash
# Create PostgreSQL database
createdb social_media_platform

# Run database migrations
cd server
npm run migrate

# Seed with sample data (optional)
npm run seed
```

## 3. Environment Configuration

Create environment files:

**Server (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=social_media_platform
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=development

STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

CLIENT_URL=http://localhost:3000
```

**Client (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_key
```

## 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend API on http://localhost:5000
- Frontend app on http://localhost:3000

## 5. Access the Application

Open http://localhost:3000 in your browser.

### Sample Accounts (if you ran the seed script)

**Admin:**
- Email: admin@example.com
- Password: admin123

**Business:**
- Email: business1@example.com
- Password: business123

**Influencer:**
- Email: influencer1@example.com
- Password: influencer123

## 6. First Steps

### As Admin:
1. Login with admin credentials
2. View all campaigns and influencers
3. Assign influencers to campaigns
4. Review content submissions

### As Business:
1. Login with business credentials
2. Create a new campaign
3. Review content submissions
4. Track campaign performance

### As Influencer:
1. Login with influencer credentials
2. Update your profile
3. Accept campaign assignments
4. Submit content for review

## 7. Test the Workflow

1. **Create a Campaign** (as Business)
   - Go to "Create Campaign"
   - Fill in campaign details
   - Submit for approval

2. **Assign Influencer** (as Admin)
   - Go to "Campaigns"
   - Select a campaign
   - Click "Assign Influencer"
   - Choose an influencer

3. **Accept Assignment** (as Influencer)
   - Go to "My Assignments"
   - Accept the assignment

4. **Submit Content** (as Influencer)
   - Click "Submit Content"
   - Upload content and add details
   - Submit for review

5. **Review Content** (as Business/Admin)
   - Go to "Content Review"
   - Approve or request revisions

## Troubleshooting

### Common Issues

**Database Connection Error:**
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL
pg_ctl start
```

**Port Already in Use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Database Migration Failed:**
```bash
# Drop and recreate database
dropdb social_media_platform
createdb social_media_platform
npm run migrate
```

### Check Logs

**Backend logs:**
```bash
cd server
npm run dev
# Check console output for errors
```

**Frontend logs:**
```bash
cd client
npm start
# Check browser console for errors
```

## Development Tips

### Hot Reload
- Frontend: Changes auto-reload
- Backend: Restarts on file changes (with nodemon)

### Database Management
```bash
# Connect to database
psql social_media_platform

# View tables
\dt

# View users
SELECT * FROM users;

# Reset database
npm run migrate
npm run seed
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/auth/me
```

## Next Steps

1. **Customize the UI** - Modify components in `client/src/components/`
2. **Add Features** - Create new API endpoints in `server/routes/`
3. **Configure Stripe** - Set up real Stripe keys for payments
4. **Deploy** - Follow the deployment guide for production

## Need Help?

- Check the [API Documentation](API_DOCUMENTATION.md)
- Review the [Deployment Guide](DEPLOYMENT.md)
- Look at the [Full README](README.md)

## File Structure

```
social-media-management-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   └── contexts/       # React contexts
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── database/           # Database schema
│   └── package.json
├── README.md               # Full documentation
├── QUICK_START.md          # This file
├── API_DOCUMENTATION.md    # API reference
└── DEPLOYMENT.md           # Deployment guide
```

## Environment Variables Reference

### Server (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `social_media_platform` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_password` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |

### Client (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` |

That's it! You should now have a fully functional social media management platform running locally. 🎉
