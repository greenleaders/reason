# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:
```json
{
  "data": {}, // Response data
  "message": "Success message", // Optional
  "error": "Error message" // Only present on errors
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "business", // "business" or "influencer"
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890" // Optional
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "business",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token"
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "business",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt-token"
}
```

### Get Current User Profile
```http
GET /auth/me
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "business",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "profile": {
    // Role-specific profile data
  }
}
```

---

## Campaign Endpoints

### Get All Campaigns
```http
GET /campaigns?status=active&page=1&limit=10
```

**Query Parameters:**
- `status` - Filter by status (draft, pending_approval, active, completed, cancelled)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "title": "Campaign Title",
      "description": "Campaign description",
      "budget": 5000,
      "currency": "USD",
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "status": "active",
      "business_id": "uuid",
      "business_first_name": "John",
      "business_last_name": "Doe",
      "company_name": "Company Inc",
      "assigned_influencers": 2,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Get Single Campaign
```http
GET /campaigns/:id
```

**Response:**
```json
{
  "campaign": {
    "id": "uuid",
    "title": "Campaign Title",
    "description": "Campaign description",
    "budget": 5000,
    "currency": "USD",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "status": "active",
    "deliverables": ["Instagram post", "Story"],
    "target_audience": {
      "ageRange": "18-35",
      "interests": "Fashion, Lifestyle"
    },
    "content_guidelines": "Guidelines here",
    "approval_required": true,
    "max_influencers": 3,
    "business_id": "uuid",
    "business_first_name": "John",
    "business_last_name": "Doe",
    "company_name": "Company Inc",
    "assigned_influencers": [
      {
        "id": "uuid",
        "first_name": "Jane",
        "last_name": "Smith",
        "status": "accepted",
        "payment_amount": 1000,
        "payment_status": "pending"
      }
    ]
  }
}
```

### Create Campaign
```http
POST /campaigns
```

**Request Body:**
```json
{
  "title": "Campaign Title",
  "description": "Campaign description",
  "budget": 5000,
  "currency": "USD",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "deliverables": ["Instagram post", "Story"],
  "targetAudience": {
    "ageRange": "18-35",
    "interests": "Fashion, Lifestyle",
    "location": "United States",
    "demographics": "Young adults"
  },
  "contentGuidelines": "Guidelines here",
  "approvalRequired": true,
  "maxInfluencers": 3
}
```

### Update Campaign
```http
PUT /campaigns/:id
```

**Request Body:** Same as create campaign

### Update Campaign Status (Admin only)
```http
PATCH /campaigns/:id/status
```

**Request Body:**
```json
{
  "status": "active" // draft, pending_approval, active, completed, cancelled
}
```

### Delete Campaign
```http
DELETE /campaigns/:id
```

---

## Influencer Endpoints

### Get All Influencers
```http
GET /influencers?niche=fitness&min_followers=10000&page=1&limit=10
```

**Query Parameters:**
- `niche` - Filter by niche
- `min_followers` - Minimum follower count
- `max_followers` - Maximum follower count
- `location` - Filter by location
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "influencers": [
    {
      "id": "uuid",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "bio": "Fitness enthusiast",
      "niche": "Fitness",
      "follower_count": 50000,
      "engagement_rate": 4.5,
      "instagram_handle": "jane_fitness",
      "tiktok_handle": "jane_fitness",
      "location": "Los Angeles, CA",
      "rates": {
        "post": 500,
        "story": 200,
        "video": 1000
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get Single Influencer
```http
GET /influencers/:id
```

### Update Influencer Profile
```http
POST /influencers/profile
```

**Request Body:**
```json
{
  "bio": "Updated bio",
  "niche": "Fitness",
  "followerCount": 50000,
  "engagementRate": 4.5,
  "instagramHandle": "jane_fitness",
  "tiktokHandle": "jane_fitness",
  "youtubeHandle": "jane_fitness",
  "twitterHandle": "jane_fitness",
  "linkedinHandle": "jane_fitness",
  "location": "Los Angeles, CA",
  "languages": ["English", "Spanish"],
  "rates": {
    "post": 500,
    "story": 200,
    "video": 1000,
    "reel": 800
  },
  "portfolioUrls": ["https://example.com/portfolio"]
}
```

### Get Influencer Campaigns
```http
GET /influencers/:id/campaigns?status=accepted
```

### Update Assignment Status
```http
PATCH /influencers/assignments/:assignmentId/status
```

**Request Body:**
```json
{
  "status": "accepted" // "accepted" or "declined"
}
```

---

## Assignment Endpoints

### Assign Influencer to Campaign (Admin only)
```http
POST /assignments
```

**Request Body:**
```json
{
  "campaignId": "uuid",
  "influencerId": "uuid",
  "paymentAmount": 1000 // Optional
}
```

### Remove Assignment (Admin only)
```http
DELETE /assignments/:assignmentId
```

### Get Campaign Assignments
```http
GET /assignments/campaign/:campaignId
```

### Get Influencer Assignments
```http
GET /assignments/influencer/:influencerId
```

### Update Assignment Payment (Admin only)
```http
PATCH /assignments/:assignmentId/payment
```

**Request Body:**
```json
{
  "paymentAmount": 1200
}
```

---

## Content Endpoints

### Submit Content
```http
POST /content/submit
```

**Request Body (multipart/form-data):**
```
assignmentId: "uuid"
contentType: "image" // image, video, post, story, reel
contentUrl: "https://example.com/content" // or file upload
caption: "Content caption"
platform: "instagram" // instagram, tiktok, youtube, twitter, linkedin
file: [file] // Optional file upload
```

### Get Campaign Content
```http
GET /content/campaign/:campaignId?status=submitted
```

**Query Parameters:**
- `status` - Filter by status (submitted, under_review, approved, revision_requested, rejected)

### Get Influencer Content
```http
GET /content/influencer/:influencerId
```

### Review Content
```http
PATCH /content/:submissionId/review
```

**Request Body:**
```json
{
  "status": "approved", // approved, revision_requested, rejected
  "feedback": "Great content!",
  "revisionNotes": "Please adjust the lighting" // Optional
}
```

### Get Single Content Submission
```http
GET /content/:submissionId
```

---

## Payment Endpoints

### Create Payment Intent
```http
POST /payments/create-payment-intent
```

**Request Body:**
```json
{
  "assignmentId": "uuid",
  "amount": 1000,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Confirm Payment
```http
POST /payments/confirm-payment
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx"
}
```

### Get Payment History
```http
GET /payments/history
```

**Response:**
```json
{
  "payments": [
    {
      "id": "uuid",
      "amount": 1000,
      "platform_fee": 100,
      "influencer_amount": 900,
      "currency": "USD",
      "status": "completed",
      "created_at": "2024-01-01T00:00:00.000Z",
      "campaign_title": "Campaign Title",
      "influencer_first_name": "Jane",
      "influencer_last_name": "Smith"
    }
  ]
}
```

### Get Payment Statistics (Admin only)
```http
GET /payments/stats
```

**Response:**
```json
{
  "overall": {
    "total_payments": 50,
    "total_amount": "50000.00",
    "total_platform_fee": "5000.00",
    "total_influencer_amount": "45000.00",
    "completed_payments": 45,
    "pending_payments": 3,
    "failed_payments": 2
  },
  "monthly": [
    {
      "month": "2024-01-01T00:00:00.000Z",
      "payment_count": "10",
      "total_amount": "10000.00",
      "platform_fee": "1000.00"
    }
  ]
}
```

---

## Webhook Endpoints

### Stripe Webhook
```http
POST /payments/webhook
```

This endpoint handles Stripe webhook events for payment status updates.

---

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Returns `429 Too Many Requests` when limit exceeded

## File Uploads

- Maximum file size: 10MB
- Allowed types: Images (JPEG, PNG, GIF), Videos (MP4, MOV, AVI), PDFs
- Files are stored in the `uploads/` directory
- Access via `/uploads/filename` endpoint

## Pagination

All list endpoints support pagination:
- `page` - Page number (starts from 1)
- `limit` - Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message",
  "details": ["Detailed error 1", "Detailed error 2"] // Optional
}
```

Common error scenarios:
- Validation errors (400)
- Authentication required (401)
- Insufficient permissions (403)
- Resource not found (404)
- Server error (500)
