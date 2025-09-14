-- Social Media Management Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handles all user types: Admin, Business, Influencer)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'business', 'influencer')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business profiles (extends users table)
CREATE TABLE business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    company_size VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Influencer profiles (extends users table)
CREATE TABLE influencer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    niche VARCHAR(100),
    follower_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    instagram_handle VARCHAR(100),
    tiktok_handle VARCHAR(100),
    youtube_handle VARCHAR(100),
    twitter_handle VARCHAR(100),
    linkedin_handle VARCHAR(100),
    location VARCHAR(100),
    languages TEXT[], -- Array of languages
    rates JSONB, -- JSON object for different content types and rates
    portfolio_urls TEXT[], -- Array of portfolio URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'active', 'completed', 'cancelled')),
    deliverables JSONB, -- JSON array of required deliverables
    target_audience JSONB, -- JSON object describing target audience
    content_guidelines TEXT,
    approval_required BOOLEAN DEFAULT true,
    max_influencers INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign assignments (many-to-many relationship between campaigns and influencers)
CREATE TABLE campaign_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'declined', 'completed')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    payment_amount DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    UNIQUE(campaign_id, influencer_id)
);

-- Content submissions
CREATE TABLE content_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES campaign_assignments(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'post', 'story', etc.
    content_url TEXT NOT NULL,
    caption TEXT,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'tiktok', 'youtube', etc.
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'revision_requested', 'rejected')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    feedback TEXT,
    revision_notes TEXT
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES campaign_assignments(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    influencer_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Analytics table
CREATE TABLE campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES campaign_assignments(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content_submissions(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'views', 'likes', 'comments', 'shares', 'clicks', 'engagement_rate'
    value DECIMAL(15,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'campaign_assigned', 'content_approved', 'payment_received', etc.
    is_read BOOLEAN DEFAULT false,
    related_id UUID, -- ID of related entity (campaign, assignment, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaign_assignments_campaign_id ON campaign_assignments(campaign_id);
CREATE INDEX idx_campaign_assignments_influencer_id ON campaign_assignments(influencer_id);
CREATE INDEX idx_content_submissions_assignment_id ON content_submissions(assignment_id);
CREATE INDEX idx_content_submissions_status ON content_submissions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_influencer_profiles_updated_at BEFORE UPDATE ON influencer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
