const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireInfluencer, requireAdmin } = require('../middleware/auth');
const { validateRequest, influencerProfileSchema } = require('../middleware/validation');

const router = express.Router();

// Get all influencers (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { niche, min_followers, max_followers, location, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.created_at,
        ip.bio,
        ip.niche,
        ip.follower_count,
        ip.engagement_rate,
        ip.instagram_handle,
        ip.tiktok_handle,
        ip.youtube_handle,
        ip.twitter_handle,
        ip.linkedin_handle,
        ip.location,
        ip.languages,
        ip.rates
      FROM users u
      LEFT JOIN influencer_profiles ip ON u.id = ip.user_id
      WHERE u.role = 'influencer' AND u.is_active = true
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (niche) {
      conditions.push(`ip.niche ILIKE $${++paramCount}`);
      params.push(`%${niche}%`);
    }

    if (min_followers) {
      conditions.push(`ip.follower_count >= $${++paramCount}`);
      params.push(min_followers);
    }

    if (max_followers) {
      conditions.push(`ip.follower_count <= $${++paramCount}`);
      params.push(max_followers);
    }

    if (location) {
      conditions.push(`ip.location ILIKE $${++paramCount}`);
      params.push(`%${location}%`);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += `
      ORDER BY ip.follower_count DESC NULLS LAST
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM users u
      LEFT JOIN influencer_profiles ip ON u.id = ip.user_id
      WHERE u.role = 'influencer' AND u.is_active = true
    `;
    if (conditions.length > 0) {
      countQuery += ' AND ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      influencers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single influencer profile
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.created_at,
        ip.*
      FROM users u
      LEFT JOIN influencer_profiles ip ON u.id = ip.user_id
      WHERE u.id = $1 AND u.role = 'influencer'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    res.json({ influencer: result.rows[0] });
  } catch (error) {
    console.error('Get influencer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update influencer profile
router.post('/profile', authenticateToken, requireInfluencer, validateRequest(influencerProfileSchema), async (req, res) => {
  try {
    const {
      bio,
      niche,
      followerCount,
      engagementRate,
      instagramHandle,
      tiktokHandle,
      youtubeHandle,
      twitterHandle,
      linkedinHandle,
      location,
      languages,
      rates,
      portfolioUrls
    } = req.body;

    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT id FROM influencer_profiles WHERE user_id = $1',
      [req.user.id]
    );

    let result;
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      result = await pool.query(`
        UPDATE influencer_profiles SET
          bio = $1, niche = $2, follower_count = $3, engagement_rate = $4,
          instagram_handle = $5, tiktok_handle = $6, youtube_handle = $7,
          twitter_handle = $8, linkedin_handle = $9, location = $10,
          languages = $11, rates = $12, portfolio_urls = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $14
        RETURNING *
      `, [
        bio, niche, followerCount, engagementRate, instagramHandle, tiktokHandle,
        youtubeHandle, twitterHandle, linkedinHandle, location, languages,
        JSON.stringify(rates), portfolioUrls, req.user.id
      ]);
    } else {
      // Create new profile
      result = await pool.query(`
        INSERT INTO influencer_profiles (
          user_id, bio, niche, follower_count, engagement_rate,
          instagram_handle, tiktok_handle, youtube_handle, twitter_handle,
          linkedin_handle, location, languages, rates, portfolio_urls
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        req.user.id, bio, niche, followerCount, engagementRate, instagramHandle,
        tiktokHandle, youtubeHandle, twitterHandle, linkedinHandle, location,
        languages, JSON.stringify(rates), portfolioUrls
      ]);
    }

    res.json({
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get influencer's assigned campaigns
router.get('/:id/campaigns', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    // Check if user has permission to view this influencer's campaigns
    if (req.user.role === 'influencer' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = `
      SELECT 
        c.*,
        ca.status as assignment_status,
        ca.assigned_at,
        ca.accepted_at,
        ca.completed_at,
        ca.payment_amount,
        ca.payment_status,
        u.first_name as business_first_name,
        u.last_name as business_last_name,
        bp.company_name
      FROM campaign_assignments ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN users u ON c.business_id = u.id
      LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
      WHERE ca.influencer_id = $1
    `;
    
    const params = [id];
    let paramCount = 1;

    if (status) {
      query += ` AND ca.status = $${++paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY ca.assigned_at DESC';

    const result = await pool.query(query, params);

    res.json({ campaigns: result.rows });
  } catch (error) {
    console.error('Get influencer campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assignment status (influencer accepting/declining)
router.patch('/assignments/:assignmentId/status', authenticateToken, requireInfluencer, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if assignment exists and belongs to user
    const assignment = await pool.query(
      'SELECT * FROM campaign_assignments WHERE id = $1 AND influencer_id = $2',
      [assignmentId, req.user.id]
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const acceptedAt = status === 'accepted' ? new Date() : null;

    const result = await pool.query(
      'UPDATE campaign_assignments SET status = $1, accepted_at = $2 WHERE id = $3 RETURNING *',
      [status, acceptedAt, assignmentId]
    );

    res.json({
      message: 'Assignment status updated successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
