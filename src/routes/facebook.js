const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const FacebookMarketingService = require('../services/facebookMarketingService');

const facebookService = new FacebookMarketingService();

/**
 * POST /api/facebook/pages - Create a Facebook Page
 */
router.post('/pages', async (req, res) => {
  try {
    const {
      business_id,
      name,
      about,
      category_id,
      city,
      state,
      street,
      zip,
      phone,
      website
    } = req.body;

    // Validate business exists
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1',
      [business_id]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Create Facebook page
    const result = await facebookService.createFacebookPage({
      name,
      about,
      category_id,
      city,
      state,
      street,
      zip,
      phone,
      website,
      business_id
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Store page in database
    const dbResult = await pool.query(
      `INSERT INTO facebook_pages 
       (business_id, facebook_page_id, page_name, page_access_token, category, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [business_id, result.page_id, result.page_name, result.access_token, category_id, 'active']
    );

    res.status(201).json({
      message: 'Facebook page created successfully',
      page: dbResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating Facebook page:', error);
    res.status(500).json({ error: 'Failed to create Facebook page' });
  }
});

/**
 * GET /api/facebook/pages/:business_id - Get Facebook pages for a business
 */
router.get('/pages/:business_id', async (req, res) => {
  try {
    const { business_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM facebook_pages WHERE business_id = $1',
      [business_id]
    );

    res.json({ pages: result.rows });
  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    res.status(500).json({ error: 'Failed to fetch Facebook pages' });
  }
});

/**
 * POST /api/facebook/campaigns - Create a Facebook Ad Campaign
 */
router.post('/campaigns', async (req, res) => {
  try {
    const {
      business_id,
      ad_account_id,
      campaign_name,
      objective,
      budget_amount,
      budget_type,
      targeting,
      creative,
      start_time,
      end_time
    } = req.body;

    // Validate business exists
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1',
      [business_id]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Create campaign
    const result = await facebookService.createAdCampaign({
      business_id,
      ad_account_id,
      campaign_name,
      objective,
      budget_amount,
      budget_type,
      targeting,
      creative,
      start_time,
      end_time
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Store campaign in database
    const dbResult = await pool.query(
      `INSERT INTO facebook_campaigns 
       (business_id, campaign_id, campaign_name, objective, status, budget_amount, budget_type, targeting, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        business_id,
        result.campaign_id,
        campaign_name,
        objective,
        'paused',
        budget_amount,
        budget_type,
        JSON.stringify(targeting),
        start_time,
        end_time
      ]
    );

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: dbResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * GET /api/facebook/campaigns/:business_id - Get campaigns for a business
 */
router.get('/campaigns/:business_id', async (req, res) => {
  try {
    const { business_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM facebook_campaigns WHERE business_id = $1 ORDER BY created_at DESC',
      [business_id]
    );

    res.json({ campaigns: result.rows });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/facebook/campaigns/:campaign_id/insights - Get campaign performance
 */
router.get('/campaigns/:campaign_id/insights', async (req, res) => {
  try {
    const { campaign_id } = req.params;

    // Get campaign from DB
    const campaignResult = await pool.query(
      'SELECT * FROM facebook_campaigns WHERE campaign_id = $1',
      [campaign_id]
    );

    if (campaignResult.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get insights from Facebook
    const insights = await facebookService.getCampaignInsights(campaign_id);

    if (!insights.success) {
      return res.status(400).json({ error: insights.error });
    }

    // Update database with latest metrics
    if (insights.insights.impressions) {
      await pool.query(
        `UPDATE facebook_campaigns 
         SET impressions = $1, reach = $2, clicks = $3, spend = $4, updated_at = CURRENT_TIMESTAMP
         WHERE campaign_id = $5`,
        [
          insights.insights.impressions || 0,
          insights.insights.reach || 0,
          insights.insights.clicks || 0,
          insights.insights.spend || 0,
          campaign_id
        ]
      );
    }

    res.json({
      campaign: campaignResult.rows[0],
      insights: insights.insights
    });
  } catch (error) {
    console.error('Error fetching campaign insights:', error);
    res.status(500).json({ error: 'Failed to fetch campaign insights' });
  }
});

/**
 * PUT /api/facebook/campaigns/:campaign_id/status - Update campaign status
 */
router.put('/campaigns/:campaign_id/status', async (req, res) => {
  try {
    const { campaign_id } = req.params;
    const { status } = req.body;

    if (!['active', 'paused', 'deleted'].includes(status.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update status on Facebook
    const result = await facebookService.updateCampaignStatus(campaign_id, status);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Update database
    await pool.query(
      'UPDATE facebook_campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE campaign_id = $2',
      [status.toLowerCase(), campaign_id]
    );

    res.json({ message: 'Campaign status updated', campaign_id, status });
  } catch (error) {
    console.error('Error updating campaign status:', error);
    res.status(500).json({ error: 'Failed to update campaign status' });
  }
});

/**
 * GET /api/facebook/packages - Get Facebook advertising packages
 */
router.get('/packages', async (req, res) => {
  try {
    const packages = await facebookService.getFacebookAdPackages();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching Facebook packages:', error);
    res.status(500).json({ error: 'Failed to fetch Facebook packages' });
  }
});

module.exports = router;
