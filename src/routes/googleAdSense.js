const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const GoogleAdSenseService = require('../services/googleAdSenseService');

const adsenseService = new GoogleAdSenseService();

/**
 * POST /api/google-adsense/accounts - Create AdSense account
 */
router.post('/accounts', async (req, res) => {
  try {
    const {
      business_id,
      business_name,
      website_url,
      contact_email,
      phone
    } = req.body;

    // Validate business exists
    const businessCheck = await pool.query(
      'SELECT id FROM businesses WHERE id = $1',
      [business_id]
    );

    if (businessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if account already exists
    const existingAccount = await pool.query(
      'SELECT id FROM google_adsense_accounts WHERE business_id = $1',
      [business_id]
    );

    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ error: 'AdSense account already exists for this business' });
    }

    // Create account
    const result = await adsenseService.createAdSenseAccount({
      business_name,
      website_url,
      business_id,
      contact_email,
      phone
    });

    // Store account in database
    const dbResult = await pool.query(
      `INSERT INTO google_adsense_accounts 
       (business_id, website_url, account_status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [business_id, website_url, result.account_status]
    );

    res.status(201).json({
      message: result.message,
      account: dbResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating AdSense account:', error);
    res.status(500).json({ error: 'Failed to create AdSense account' });
  }
});

/**
 * GET /api/google-adsense/accounts/:business_id - Get AdSense account for a business
 */
router.get('/accounts/:business_id', async (req, res) => {
  try {
    const { business_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM google_adsense_accounts WHERE business_id = $1',
      [business_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'AdSense account not found' });
    }

    res.json({ account: result.rows[0] });
  } catch (error) {
    console.error('Error fetching AdSense account:', error);
    res.status(500).json({ error: 'Failed to fetch AdSense account' });
  }
});

/**
 * POST /api/google-adsense/ad-units - Create an ad unit
 */
router.post('/ad-units', async (req, res) => {
  try {
    const {
      business_id,
      account_id,
      name,
      ad_type,
      size,
      placement_location
    } = req.body;

    // Get AdSense account
    const accountResult = await pool.query(
      'SELECT * FROM google_adsense_accounts WHERE id = $1 AND business_id = $2',
      [account_id, business_id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'AdSense account not found' });
    }

    const account = accountResult.rows[0];

    // Create ad unit
    const result = await adsenseService.createAdUnit({
      account_id: account.adsense_account_id,
      business_id,
      name,
      ad_type,
      size,
      placement_location
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Store ad unit in database
    const dbResult = await pool.query(
      `INSERT INTO google_adsense_units 
       (adsense_account_id, ad_unit_id, ad_unit_name, ad_type, ad_size, ad_code, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [account_id, result.ad_unit_id, name, ad_type, size, result.ad_code, 'active']
    );

    res.status(201).json({
      message: 'Ad unit created successfully',
      ad_unit: dbResult.rows[0]
    });
  } catch (error) {
    console.error('Error creating ad unit:', error);
    res.status(500).json({ error: 'Failed to create ad unit' });
  }
});

/**
 * GET /api/google-adsense/ad-units/:account_id - Get ad units for an account
 */
router.get('/ad-units/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM google_adsense_units WHERE adsense_account_id = $1 ORDER BY created_at DESC',
      [account_id]
    );

    res.json({ ad_units: result.rows });
  } catch (error) {
    console.error('Error fetching ad units:', error);
    res.status(500).json({ error: 'Failed to fetch ad units' });
  }
});

/**
 * GET /api/google-adsense/reports/:account_id - Get performance report
 */
router.get('/reports/:account_id', async (req, res) => {
  try {
    const { account_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    // Get account
    const accountResult = await pool.query(
      'SELECT * FROM google_adsense_accounts WHERE id = $1',
      [account_id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const account = accountResult.rows[0];

    // Get performance report
    const report = await adsenseService.getPerformanceReport(
      account.adsense_account_id,
      { start_date, end_date }
    );

    if (!report.success) {
      return res.status(400).json({ error: report.error });
    }

    res.json({
      account: account,
      report: report.report,
      date_range: { start_date, end_date }
    });
  } catch (error) {
    console.error('Error fetching performance report:', error);
    res.status(500).json({ error: 'Failed to fetch performance report' });
  }
});

/**
 * GET /api/google-adsense/packages - Get Google AdSense packages
 */
router.get('/packages', async (req, res) => {
  try {
    const packages = await adsenseService.getGoogleAdSensePackages();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching AdSense packages:', error);
    res.status(500).json({ error: 'Failed to fetch AdSense packages' });
  }
});

/**
 * GET /api/google-adsense/combined-packages - Get combined Facebook + AdSense packages
 */
router.get('/combined-packages', async (req, res) => {
  try {
    const packages = await adsenseService.getCombinedPackages();
    res.json(packages);
  } catch (error) {
    console.error('Error fetching combined packages:', error);
    res.status(500).json({ error: 'Failed to fetch combined packages' });
  }
});

module.exports = router;
