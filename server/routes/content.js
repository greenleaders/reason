const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const { authenticateToken, requireInfluencer } = require('../middleware/auth');
const { validateRequest, contentSubmissionSchema } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, videos, and PDFs are allowed'));
    }
  }
});

// Submit content for a campaign
router.post('/submit', authenticateToken, requireInfluencer, upload.single('file'), async (req, res) => {
  try {
    const { assignmentId, contentType, caption, platform } = req.body;
    let contentUrl = req.body.contentUrl;

    // If file is uploaded, use the file path
    if (req.file) {
      contentUrl = `/uploads/${req.file.filename}`;
    }

    // Validate required fields
    if (!assignmentId || !contentType || !contentUrl || !platform) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if assignment exists and belongs to user
    const assignment = await pool.query(`
      SELECT ca.*, c.title as campaign_title
      FROM campaign_assignments ca
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.id = $1 AND ca.influencer_id = $2 AND ca.status = 'accepted'
    `, [assignmentId, req.user.id]);

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or not accepted' });
    }

    // Create content submission
    const result = await pool.query(`
      INSERT INTO content_submissions (assignment_id, content_type, content_url, caption, platform)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [assignmentId, contentType, contentUrl, caption, platform]);

    // Create notification for admin and business
    const campaign = assignment.rows[0];
    const businessId = await pool.query(
      'SELECT business_id FROM campaigns WHERE id = $1',
      [campaign.campaign_id]
    );

    // Notify admin
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      SELECT id, $1, $2, $3, $4
      FROM users WHERE role = 'admin'
    `, [
      'New Content Submission',
      `New content submitted for campaign: ${campaign.campaign_title}`,
      'content_submitted',
      result.rows[0].id
    ]);

    // Notify business
    if (businessId.rows.length > 0) {
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        businessId.rows[0].business_id,
        'New Content Submission',
        `New content submitted for campaign: ${campaign.campaign_title}`,
        'content_submitted',
        result.rows[0].id
      ]);
    }

    res.status(201).json({
      message: 'Content submitted successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Submit content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get content submissions for a campaign
router.get('/campaign/:campaignId', authenticateToken, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.query;

    // Check if user has permission to view this campaign's content
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

    let query = `
      SELECT 
        cs.*,
        u.first_name as influencer_first_name,
        u.last_name as influencer_last_name,
        ip.instagram_handle,
        ip.tiktok_handle
      FROM content_submissions cs
      JOIN campaign_assignments ca ON cs.assignment_id = ca.id
      JOIN users u ON ca.influencer_id = u.id
      LEFT JOIN influencer_profiles ip ON ca.influencer_id = ip.user_id
      WHERE ca.campaign_id = $1
    `;
    
    const params = [campaignId];
    let paramCount = 1;

    if (status) {
      query += ` AND cs.status = $${++paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY cs.submitted_at DESC';

    const result = await pool.query(query, params);

    res.json({ submissions: result.rows });
  } catch (error) {
    console.error('Get content submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get content submissions for an influencer
router.get('/influencer/:influencerId', authenticateToken, async (req, res) => {
  try {
    const { influencerId } = req.params;

    // Check permissions
    if (req.user.role === 'influencer' && req.user.id !== influencerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT 
        cs.*,
        c.title as campaign_title,
        c.business_id,
        u.first_name as business_first_name,
        u.last_name as business_last_name,
        bp.company_name
      FROM content_submissions cs
      JOIN campaign_assignments ca ON cs.assignment_id = ca.id
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN users u ON c.business_id = u.id
      LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
      WHERE ca.influencer_id = $1
      ORDER BY cs.submitted_at DESC
    `, [influencerId]);

    res.json({ submissions: result.rows });
  } catch (error) {
    console.error('Get influencer content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Review content (admin or business)
router.patch('/:submissionId/review', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback, revisionNotes } = req.body;

    if (!['approved', 'revision_requested', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if submission exists
    const submission = await pool.query(`
      SELECT cs.*, c.business_id
      FROM content_submissions cs
      JOIN campaign_assignments ca ON cs.assignment_id = ca.id
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE cs.id = $1
    `, [submissionId]);

    if (submission.rows.length === 0) {
      return res.status(404).json({ error: 'Content submission not found' });
    }

    // Check permissions
    if (req.user.role === 'business' && submission.rows[0].business_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      UPDATE content_submissions SET
        status = $1,
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = $2,
        feedback = $3,
        revision_notes = $4
      WHERE id = $5
      RETURNING *
    `, [status, req.user.id, feedback, revisionNotes, submissionId]);

    // Create notification for influencer
    const influencerId = await pool.query(
      'SELECT ca.influencer_id FROM campaign_assignments ca WHERE ca.id = $1',
      [submission.rows[0].assignment_id]
    );

    if (influencerId.rows.length > 0) {
      let notificationTitle, notificationMessage;
      
      switch (status) {
        case 'approved':
          notificationTitle = 'Content Approved';
          notificationMessage = 'Your content submission has been approved!';
          break;
        case 'revision_requested':
          notificationTitle = 'Content Revision Requested';
          notificationMessage = 'Your content submission needs revisions. Please check the feedback.';
          break;
        case 'rejected':
          notificationTitle = 'Content Rejected';
          notificationMessage = 'Your content submission has been rejected. Please check the feedback.';
          break;
      }

      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        influencerId.rows[0].influencer_id,
        notificationTitle,
        notificationMessage,
        'content_reviewed',
        submissionId
      ]);
    }

    res.json({
      message: 'Content review updated successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Review content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single content submission
router.get('/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const result = await pool.query(`
      SELECT 
        cs.*,
        u.first_name as influencer_first_name,
        u.last_name as influencer_last_name,
        c.title as campaign_title,
        c.business_id,
        bu.first_name as business_first_name,
        bu.last_name as business_last_name,
        bp.company_name
      FROM content_submissions cs
      JOIN campaign_assignments ca ON cs.assignment_id = ca.id
      JOIN users u ON ca.influencer_id = u.id
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN users bu ON c.business_id = bu.id
      LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
      WHERE cs.id = $1
    `, [submissionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content submission not found' });
    }

    const submission = result.rows[0];

    // Check permissions
    if (req.user.role === 'influencer' && submission.influencer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (req.user.role === 'business' && submission.business_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get content submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
