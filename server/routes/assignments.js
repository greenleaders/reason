const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Assign influencer to campaign (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { campaignId, influencerId, paymentAmount } = req.body;

    // Validate required fields
    if (!campaignId || !influencerId) {
      return res.status(400).json({ error: 'Campaign ID and Influencer ID are required' });
    }

    // Check if campaign exists and is not completed
    const campaign = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND status != $2',
      [campaignId, 'completed']
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found or already completed' });
    }

    // Check if influencer exists and is active
    const influencer = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND role = $2 AND is_active = true',
      [influencerId, 'influencer']
    );

    if (influencer.rows.length === 0) {
      return res.status(404).json({ error: 'Influencer not found or inactive' });
    }

    // Check if assignment already exists
    const existingAssignment = await pool.query(
      'SELECT id FROM campaign_assignments WHERE campaign_id = $1 AND influencer_id = $2',
      [campaignId, influencerId]
    );

    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({ error: 'Influencer already assigned to this campaign' });
    }

    // Check max influencers limit
    const currentAssignments = await pool.query(
      'SELECT COUNT(*) FROM campaign_assignments WHERE campaign_id = $1',
      [campaignId]
    );

    const currentCount = parseInt(currentAssignments.rows[0].count);
    if (currentCount >= campaign.rows[0].max_influencers) {
      return res.status(400).json({ error: 'Maximum number of influencers reached for this campaign' });
    }

    // Create assignment
    const result = await pool.query(`
      INSERT INTO campaign_assignments (campaign_id, influencer_id, payment_amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [campaignId, influencerId, paymentAmount || null]);

    // Create notification for influencer
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      influencerId,
      'New Campaign Assignment',
      `You have been assigned to a new campaign: ${campaign.rows[0].title}`,
      'campaign_assigned',
      campaignId
    ]);

    res.status(201).json({
      message: 'Influencer assigned to campaign successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Assign influencer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove influencer from campaign (admin only)
router.delete('/:assignmentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Check if assignment exists
    const assignment = await pool.query(
      'SELECT * FROM campaign_assignments WHERE id = $1',
      [assignmentId]
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Don't allow removing completed assignments
    if (assignment.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot remove completed assignment' });
    }

    await pool.query('DELETE FROM campaign_assignments WHERE id = $1', [assignmentId]);

    res.json({ message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('Remove assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all assignments for a campaign
router.get('/campaign/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Check if user has permission to view this campaign's assignments
    const campaign = await pool.query(
      'SELECT business_id FROM campaigns WHERE id = $1',
      [campaignId]
    );

    if (campaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (req.user.role === 'business' && campaign.rows[0].business_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        ca.*,
        u.first_name,
        u.last_name,
        u.email,
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
      ORDER BY ca.assigned_at DESC
    `, [campaignId]);

    res.json({ assignments: result.rows });
  } catch (error) {
    console.error('Get campaign assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all assignments for an influencer
router.get('/influencer/:influencerId', authenticateToken, async (req, res) => {
  try {
    const { influencerId } = req.params;

    // Check permissions
    if (req.user.role === 'influencer' && req.user.id !== influencerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        ca.*,
        c.title as campaign_title,
        c.description as campaign_description,
        c.budget,
        c.start_date,
        c.end_date,
        c.status as campaign_status,
        u.first_name as business_first_name,
        u.last_name as business_last_name,
        bp.company_name
      FROM campaign_assignments ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN users u ON c.business_id = u.id
      LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
      WHERE ca.influencer_id = $1
      ORDER BY ca.assigned_at DESC
    `, [influencerId]);

    res.json({ assignments: result.rows });
  } catch (error) {
    console.error('Get influencer assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update assignment payment amount (admin only)
router.patch('/:assignmentId/payment', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { paymentAmount } = req.body;

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const result = await pool.query(
      'UPDATE campaign_assignments SET payment_amount = $1 WHERE id = $2 RETURNING *',
      [paymentAmount, assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      message: 'Payment amount updated successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Update payment amount error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
