const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireBusiness, requireAdmin } = require('../middleware/auth');
const { validateRequest, campaignSchema } = require('../middleware/validation');

const router = express.Router();

// Get all campaigns (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, business_id, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        c.*,
        u.first_name as business_first_name,
        u.last_name as business_last_name,
        bp.company_name,
        COUNT(ca.id) as assigned_influencers
      FROM campaigns c
      LEFT JOIN users u ON c.business_id = u.id
      LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
      LEFT JOIN campaign_assignments ca ON c.id = ca.campaign_id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;

    // Role-based filtering
    if (req.user.role === 'business') {
      conditions.push(`c.business_id = $${++paramCount}`);
      params.push(req.user.id);
    }

    if (status) {
      conditions.push(`c.status = $${++paramCount}`);
      params.push(status);
    }

    if (business_id && req.user.role === 'admin') {
      conditions.push(`c.business_id = $${++paramCount}`);
      params.push(business_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY c.id, u.first_name, u.last_name, bp.company_name
      ORDER BY c.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM campaigns c';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      campaigns: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single campaign
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const campaignResult = await pool.query(`
      SELECT 
        c.*,
        u.first_name as business_first_name,
        u.last_name as business_last_name,
        bp.company_name,
        bp.industry
      FROM campaigns c
      LEFT JOIN users u ON c.business_id = u.id
      LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
      WHERE c.id = $1
    `, [id]);

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = campaignResult.rows[0];

    // Check permissions
    if (req.user.role === 'business' && campaign.business_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get assigned influencers
    const influencersResult = await pool.query(`
      SELECT 
        ca.*,
        u.first_name,
        u.last_name,
        ip.bio,
        ip.niche,
        ip.follower_count,
        ip.engagement_rate,
        ip.instagram_handle,
        ip.tiktok_handle
      FROM campaign_assignments ca
      JOIN users u ON ca.influencer_id = u.id
      LEFT JOIN influencer_profiles ip ON ca.influencer_id = ip.user_id
      WHERE ca.campaign_id = $1
    `, [id]);

    campaign.assigned_influencers = influencersResult.rows;

    res.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new campaign
router.post('/', authenticateToken, requireBusiness, validateRequest(campaignSchema), async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      currency,
      startDate,
      endDate,
      deliverables,
      targetAudience,
      contentGuidelines,
      approvalRequired,
      maxInfluencers
    } = req.body;

    const result = await pool.query(`
      INSERT INTO campaigns (
        business_id, title, description, budget, currency, start_date, end_date,
        deliverables, target_audience, content_guidelines, approval_required, max_influencers
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      req.user.id, title, description, budget, currency, startDate, endDate,
      JSON.stringify(deliverables), JSON.stringify(targetAudience), contentGuidelines,
      approvalRequired, maxInfluencers
    ]);

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: result.rows[0]
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update campaign
router.put('/:id', authenticateToken, validateRequest(campaignSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      budget,
      currency,
      startDate,
      endDate,
      deliverables,
      targetAudience,
      contentGuidelines,
      approvalRequired,
      maxInfluencers
    } = req.body;

    // Check if campaign exists and user has permission
    const existingCampaign = await pool.query(
      'SELECT business_id, status FROM campaigns WHERE id = $1',
      [id]
    );

    if (existingCampaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = existingCampaign.rows[0];

    // Check permissions
    if (req.user.role === 'business' && campaign.business_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Don't allow editing active campaigns
    if (campaign.status === 'active' && req.user.role === 'business') {
      return res.status(400).json({ error: 'Cannot edit active campaign' });
    }

    const result = await pool.query(`
      UPDATE campaigns SET
        title = $1, description = $2, budget = $3, currency = $4,
        start_date = $5, end_date = $6, deliverables = $7, target_audience = $8,
        content_guidelines = $9, approval_required = $10, max_influencers = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [
      title, description, budget, currency, startDate, endDate,
      JSON.stringify(deliverables), JSON.stringify(targetAudience),
      contentGuidelines, approvalRequired, maxInfluencers, id
    ]);

    res.json({
      message: 'Campaign updated successfully',
      campaign: result.rows[0]
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update campaign status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'pending_approval', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      message: 'Campaign status updated successfully',
      campaign: result.rows[0]
    });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete campaign
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if campaign exists and user has permission
    const existingCampaign = await pool.query(
      'SELECT business_id, status FROM campaigns WHERE id = $1',
      [id]
    );

    if (existingCampaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = existingCampaign.rows[0];

    // Check permissions
    if (req.user.role === 'business' && campaign.business_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Don't allow deleting active campaigns
    if (campaign.status === 'active') {
      return res.status(400).json({ error: 'Cannot delete active campaign' });
    }

    await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
