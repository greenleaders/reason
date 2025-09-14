const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create payment intent for campaign assignment
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { assignmentId, amount, currency = 'usd' } = req.body;

    if (!assignmentId || !amount) {
      return res.status(400).json({ error: 'Assignment ID and amount are required' });
    }

    // Verify assignment exists and get details
    const assignment = await pool.query(`
      SELECT 
        ca.*,
        c.title as campaign_title,
        c.business_id,
        u.first_name as business_name,
        bp.company_name
      FROM campaign_assignments ca
      JOIN campaigns c ON ca.campaign_id = c.id
      JOIN users u ON c.business_id = u.id
      LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
      WHERE ca.id = $1
    `, [assignmentId]);

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignmentData = assignment.rows[0];

    // Calculate platform fee (e.g., 10%)
    const platformFeeRate = 0.10;
    const platformFee = Math.round(amount * platformFeeRate * 100) / 100;
    const influencerAmount = amount - platformFee;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        assignmentId: assignmentId,
        platformFee: platformFee.toString(),
        influencerAmount: influencerAmount.toString()
      },
      description: `Payment for campaign: ${assignmentData.campaign_title}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store payment record
    await pool.query(`
      INSERT INTO payments (assignment_id, amount, platform_fee, influencer_amount, currency, stripe_payment_intent_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    `, [assignmentId, amount, platformFee, influencerAmount, currency, paymentIntent.id]);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and update assignment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update payment record
    const paymentResult = await pool.query(`
      UPDATE payments 
      SET status = 'completed', processed_at = CURRENT_TIMESTAMP
      WHERE stripe_payment_intent_id = $1
      RETURNING *
    `, [paymentIntentId]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const payment = paymentResult.rows[0];

    // Update assignment payment status
    await pool.query(`
      UPDATE campaign_assignments 
      SET payment_status = 'paid'
      WHERE id = $1
    `, [payment.assignment_id]);

    // Create notification for influencer
    const assignment = await pool.query(`
      SELECT ca.influencer_id, c.title as campaign_title
      FROM campaign_assignments ca
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.id = $1
    `, [payment.assignment_id]);

    if (assignment.rows.length > 0) {
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        assignment.rows[0].influencer_id,
        'Payment Received',
        `Payment of $${payment.influencer_amount} received for campaign: ${assignment.rows[0].campaign_title}`,
        'payment_received',
        payment.assignment_id
      ]);
    }

    res.json({
      message: 'Payment confirmed successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        influencerAmount: payment.influencer_amount,
        platformFee: payment.platform_fee,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payment history for user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    let query = '';
    let params = [];

    if (req.user.role === 'admin') {
      // Admin can see all payments
      query = `
        SELECT 
          p.*,
          ca.campaign_id,
          c.title as campaign_title,
          u.first_name as influencer_first_name,
          u.last_name as influencer_last_name,
          bu.first_name as business_first_name,
          bu.last_name as business_last_name,
          bp.company_name
        FROM payments p
        JOIN campaign_assignments ca ON p.assignment_id = ca.id
        JOIN campaigns c ON ca.campaign_id = c.id
        JOIN users u ON ca.influencer_id = u.id
        JOIN users bu ON c.business_id = bu.id
        LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
        ORDER BY p.created_at DESC
      `;
    } else if (req.user.role === 'business') {
      // Business can see payments for their campaigns
      query = `
        SELECT 
          p.*,
          ca.campaign_id,
          c.title as campaign_title,
          u.first_name as influencer_first_name,
          u.last_name as influencer_last_name
        FROM payments p
        JOIN campaign_assignments ca ON p.assignment_id = ca.id
        JOIN campaigns c ON ca.campaign_id = c.id
        JOIN users u ON ca.influencer_id = u.id
        WHERE c.business_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    } else if (req.user.role === 'influencer') {
      // Influencer can see their own payments
      query = `
        SELECT 
          p.*,
          ca.campaign_id,
          c.title as campaign_title,
          bu.first_name as business_first_name,
          bu.last_name as business_last_name,
          bp.company_name
        FROM payments p
        JOIN campaign_assignments ca ON p.assignment_id = ca.id
        JOIN campaigns c ON ca.campaign_id = c.id
        JOIN users bu ON c.business_id = bu.id
        LEFT JOIN business_profiles bp ON c.business_id = bp.user_id
        WHERE ca.influencer_id = $1
        ORDER BY p.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);

    res.json({ payments: result.rows });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// Get payment statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        SUM(platform_fee) as total_platform_fee,
        SUM(influencer_amount) as total_influencer_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
      FROM payments
    `);

    const monthlyStats = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount,
        SUM(platform_fee) as platform_fee
      FROM payments
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({
      overall: stats.rows[0],
      monthly: monthlyStats.rows
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Failed to get payment statistics' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      
      // Update payment status in database
      await pool.query(`
        UPDATE payments 
        SET status = 'completed', processed_at = CURRENT_TIMESTAMP
        WHERE stripe_payment_intent_id = $1
      `, [paymentIntent.id]);
      
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);
      
      // Update payment status in database
      await pool.query(`
        UPDATE payments 
        SET status = 'failed'
        WHERE stripe_payment_intent_id = $1
      `, [failedPayment.id]);
      
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
