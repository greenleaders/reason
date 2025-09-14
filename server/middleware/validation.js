const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// User validation schemas
const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('business', 'influencer').required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().optional()
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Business profile validation
const businessProfileSchema = Joi.object({
  companyName: Joi.string().min(2).max(255).required(),
  industry: Joi.string().max(100).optional(),
  website: Joi.string().uri().optional(),
  description: Joi.string().max(1000).optional(),
  companySize: Joi.string().max(50).optional()
});

// Influencer profile validation
const influencerProfileSchema = Joi.object({
  bio: Joi.string().max(1000).optional(),
  niche: Joi.string().max(100).optional(),
  followerCount: Joi.number().integer().min(0).optional(),
  engagementRate: Joi.number().min(0).max(100).optional(),
  instagramHandle: Joi.string().max(100).optional(),
  tiktokHandle: Joi.string().max(100).optional(),
  youtubeHandle: Joi.string().max(100).optional(),
  twitterHandle: Joi.string().max(100).optional(),
  linkedinHandle: Joi.string().max(100).optional(),
  location: Joi.string().max(100).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  rates: Joi.object().optional(),
  portfolioUrls: Joi.array().items(Joi.string().uri()).optional()
});

// Campaign validation
const campaignSchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  description: Joi.string().min(10).max(2000).required(),
  budget: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  deliverables: Joi.array().items(Joi.string()).required(),
  targetAudience: Joi.object().required(),
  contentGuidelines: Joi.string().max(1000).optional(),
  approvalRequired: Joi.boolean().default(true),
  maxInfluencers: Joi.number().integer().min(1).default(1)
});

// Content submission validation
const contentSubmissionSchema = Joi.object({
  contentType: Joi.string().valid('image', 'video', 'post', 'story', 'reel').required(),
  contentUrl: Joi.string().uri().required(),
  caption: Joi.string().max(2200).optional(),
  platform: Joi.string().valid('instagram', 'tiktok', 'youtube', 'twitter', 'linkedin').required()
});

module.exports = {
  validateRequest,
  userRegistrationSchema,
  userLoginSchema,
  businessProfileSchema,
  influencerProfileSchema,
  campaignSchema,
  contentSubmissionSchema
};
