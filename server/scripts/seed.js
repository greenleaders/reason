const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminResult = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['admin@example.com', adminPassword, 'admin', 'Admin', 'User', true]);

    let adminId = adminResult.rows[0]?.id;
    if (!adminId) {
      const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@example.com']);
      adminId = existingAdmin.rows[0].id;
    }

    // Create sample business users
    const businessPassword = await bcrypt.hash('business123', 12);
    const business1 = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['business1@example.com', businessPassword, 'business', 'John', 'Smith', true]);

    const business2 = await pool.query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, ['business2@example.com', businessPassword, 'business', 'Sarah', 'Johnson', true]);

    // Create business profiles
    if (business1.rows[0]) {
      await pool.query(`
        INSERT INTO business_profiles (user_id, company_name, industry, website, description, company_size)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        business1.rows[0].id,
        'TechCorp Solutions',
        'Technology',
        'https://techcorp.com',
        'Leading technology solutions provider',
        '50-200 employees'
      ]);
    }

    if (business2.rows[0]) {
      await pool.query(`
        INSERT INTO business_profiles (user_id, company_name, industry, website, description, company_size)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id) DO NOTHING
      `, [
        business2.rows[0].id,
        'Fashion Forward',
        'Fashion',
        'https://fashionforward.com',
        'Trendy fashion brand for young adults',
        '10-50 employees'
      ]);
    }

    // Create sample influencer users
    const influencerPassword = await bcrypt.hash('influencer123', 12);
    const influencers = [
      {
        email: 'influencer1@example.com',
        firstName: 'Emma',
        lastName: 'Wilson',
        bio: 'Fitness enthusiast and lifestyle blogger',
        niche: 'Fitness',
        followerCount: 50000,
        engagementRate: 4.5,
        instagramHandle: 'emma_fitness',
        location: 'Los Angeles, CA'
      },
      {
        email: 'influencer2@example.com',
        firstName: 'Alex',
        lastName: 'Chen',
        bio: 'Tech reviewer and gadget enthusiast',
        niche: 'Technology',
        followerCount: 75000,
        engagementRate: 6.2,
        instagramHandle: 'alex_tech',
        location: 'San Francisco, CA'
      },
      {
        email: 'influencer3@example.com',
        firstName: 'Maya',
        lastName: 'Patel',
        bio: 'Fashion and beauty content creator',
        niche: 'Fashion',
        followerCount: 120000,
        engagementRate: 5.8,
        instagramHandle: 'maya_style',
        location: 'New York, NY'
      }
    ];

    for (const influencer of influencers) {
      const userResult = await pool.query(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `, [influencer.email, influencerPassword, 'influencer', influencer.firstName, influencer.lastName, true]);

      if (userResult.rows[0]) {
        await pool.query(`
          INSERT INTO influencer_profiles (
            user_id, bio, niche, follower_count, engagement_rate, 
            instagram_handle, location, rates, languages
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (user_id) DO NOTHING
        `, [
          userResult.rows[0].id,
          influencer.bio,
          influencer.niche,
          influencer.followerCount,
          influencer.engagementRate,
          influencer.instagramHandle,
          influencer.location,
          JSON.stringify({
            post: 500,
            story: 200,
            video: 1000,
            reel: 800
          }),
          ['English', 'Spanish']
        ]);
      }
    }

    // Create sample campaigns
    const business1Id = business1.rows[0]?.id;
    const business2Id = business2.rows[0]?.id;

    if (business1Id) {
      await pool.query(`
        INSERT INTO campaigns (
          business_id, title, description, budget, currency, start_date, end_date,
          status, deliverables, target_audience, content_guidelines, max_influencers
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING
      `, [
        business1Id,
        'Tech Product Launch Campaign',
        'Promote our new AI-powered smartphone with innovative features',
        10000,
        'USD',
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        'active',
        JSON.stringify(['Instagram post', 'Instagram story', 'YouTube review']),
        JSON.stringify({
          ageRange: '25-45',
          interests: 'Technology, Innovation',
          location: 'United States',
          demographics: 'Tech-savvy professionals'
        }),
        'Focus on the innovative AI features and user experience',
        3
      ]);
    }

    if (business2Id) {
      await pool.query(`
        INSERT INTO campaigns (
          business_id, title, description, budget, currency, start_date, end_date,
          status, deliverables, target_audience, content_guidelines, max_influencers
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING
      `, [
        business2Id,
        'Summer Fashion Collection',
        'Showcase our new summer collection with vibrant colors and trendy designs',
        5000,
        'USD',
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        'pending_approval',
        JSON.stringify(['Instagram post', 'Instagram reel', 'TikTok video']),
        JSON.stringify({
          ageRange: '18-35',
          interests: 'Fashion, Lifestyle',
          location: 'United States',
          demographics: 'Fashion-conscious young adults'
        }),
        'Highlight the vibrant colors and trendy designs, use summer vibes',
        2
      ]);
    }

    console.log('Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Business 1: business1@example.com / business123');
    console.log('Business 2: business2@example.com / business123');
    console.log('Influencer 1: influencer1@example.com / influencer123');
    console.log('Influencer 2: influencer2@example.com / influencer123');
    console.log('Influencer 3: influencer3@example.com / influencer123');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
