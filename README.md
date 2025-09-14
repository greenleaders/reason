# Social Media Management Platform

A full-stack social media management platform that connects businesses with influencers for marketing campaigns. Built with React, Node.js, Express, and PostgreSQL.

## Features

### User Roles
- **Admin**: Manages campaigns, assigns influencers, reviews content, and oversees the platform
- **Business**: Creates campaigns, reviews content submissions, and manages their marketing efforts
- **Influencer**: Accepts assignments, submits content, and manages their profile

### Core Functionality
- **Campaign Management**: Create, edit, and manage marketing campaigns
- **Influencer Matching**: Admin can assign influencers to campaigns
- **Content Approval Workflow**: Multi-step content review and approval process
- **Payment Integration**: Stripe integration for secure payments
- **Analytics Dashboard**: Comprehensive reporting and insights
- **Real-time Notifications**: Keep users informed of important updates

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **Stripe** payment processing
- **Multer** file uploads
- **Joi** validation

### Frontend
- **React 18** with functional components and hooks
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Lucide React** for icons
- **Recharts** for analytics charts
- **Styled Components** for styling

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-management-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up the database**
   ```bash
   # Create a PostgreSQL database
   createdb social_media_platform
   
   # Run the migration script
   cd server
   npm run migrate
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=social_media_platform
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # File Upload Configuration
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=10485760

   # CORS Configuration
   CLIENT_URL=http://localhost:3000
   ```

   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Initial Setup

1. **Create an admin user**
   ```bash
   curl -X POST http://localhost:5000/api/auth/create-admin \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "admin123",
       "firstName": "Admin",
       "lastName": "User"
     }'
   ```

2. **Access the application**
   - Open http://localhost:3000 in your browser
   - Login with the admin credentials
   - Start creating campaigns and managing the platform

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/create-admin` - Create admin user

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create new campaign
- `PUT /api/campaigns/:id` - Update campaign
- `PATCH /api/campaigns/:id/status` - Update campaign status
- `DELETE /api/campaigns/:id` - Delete campaign

### Influencers
- `GET /api/influencers` - Get all influencers
- `GET /api/influencers/:id` - Get single influencer
- `POST /api/influencers/profile` - Update influencer profile
- `GET /api/influencers/:id/campaigns` - Get influencer campaigns

### Assignments
- `POST /api/assignments` - Assign influencer to campaign
- `DELETE /api/assignments/:id` - Remove assignment
- `GET /api/assignments/campaign/:id` - Get campaign assignments
- `GET /api/assignments/influencer/:id` - Get influencer assignments

### Content
- `POST /api/content/submit` - Submit content
- `GET /api/content/campaign/:id` - Get campaign content
- `GET /api/content/influencer/:id` - Get influencer content
- `PATCH /api/content/:id/review` - Review content

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/stats` - Get payment statistics

## Database Schema

The application uses the following main tables:
- `users` - User accounts with role-based access
- `business_profiles` - Business-specific information
- `influencer_profiles` - Influencer-specific information
- `campaigns` - Marketing campaigns
- `campaign_assignments` - Many-to-many relationship between campaigns and influencers
- `content_submissions` - Content submitted by influencers
- `payments` - Payment records
- `notifications` - User notifications
- `campaign_analytics` - Analytics data

## Features by Role

### Admin Dashboard
- View all campaigns and their status
- Assign influencers to campaigns
- Review and approve content
- Manage platform analytics
- Oversee payment processing

### Business Dashboard
- Create and manage campaigns
- Review content submissions
- Track campaign performance
- Manage influencer relationships

### Influencer Dashboard
- View assigned campaigns
- Submit content for review
- Manage profile information
- Track payment history

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- Password hashing with bcrypt

## Payment Integration

The platform integrates with Stripe for secure payment processing:
- Automatic platform fee calculation (10%)
- Secure payment intent creation
- Webhook handling for payment status updates
- Payment history and analytics

## Development

### Project Structure
```
social-media-management-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── database/          # Database schema and migrations
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   └── index.js
└── package.json           # Root package.json
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for all packages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
