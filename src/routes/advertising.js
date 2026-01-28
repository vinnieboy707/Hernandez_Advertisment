const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const AdvertisingService = require('../services/advertisingService');

const advertisingService = new AdvertisingService();

/**
 * GET /api/advertising/packages - Get all advertising packages
 */
router.get('/packages', async (req, res) => {
  try {
    const packages = await advertisingService.getAdvertisingPackages(pool);
    res.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

/**
 * GET /api/advertising/radio - Get radio advertising packages
 */
router.get('/radio', async (req, res) => {
  try {
    const radioPackages = await advertisingService.getRadioStationPackages();
    res.json(radioPackages);
  } catch (error) {
    console.error('Error fetching radio packages:', error);
    res.status(500).json({ error: 'Failed to fetch radio packages' });
  }
});

/**
 * GET /api/advertising/digital - Get digital advertising packages
 */
router.get('/digital', async (req, res) => {
  try {
    const digitalPackages = await advertisingService.getDigitalAdvertisingPackages();
    res.json(digitalPackages);
  } catch (error) {
    console.error('Error fetching digital packages:', error);
    res.status(500).json({ error: 'Failed to fetch digital packages' });
  }
});

/**
 * GET /api/advertising/print - Get print advertising packages
 */
router.get('/print', async (req, res) => {
  try {
    const printPackages = await advertisingService.getPrintAdvertisingPackages();
    res.json(printPackages);
  } catch (error) {
    console.error('Error fetching print packages:', error);
    res.status(500).json({ error: 'Failed to fetch print packages' });
  }
});

/**
 * GET /api/advertising/events - Get event and fair advertising packages
 */
router.get('/events', async (req, res) => {
  try {
    const eventPackages = await advertisingService.getEventAdvertisingPackages();
    res.json(eventPackages);
  } catch (error) {
    console.error('Error fetching event packages:', error);
    res.status(500).json({ error: 'Failed to fetch event packages' });
  }
});

/**
 * GET /api/advertising/website - Get website and digital presence packages
 */
router.get('/website', async (req, res) => {
  try {
    const websitePackages = await advertisingService.getWebsitePackages();
    res.json(websitePackages);
  } catch (error) {
    console.error('Error fetching website packages:', error);
    res.status(500).json({ error: 'Failed to fetch website packages' });
  }
});

/**
 * GET /api/advertising/all - Get all advertising options
 */
router.get('/all', async (req, res) => {
  try {
    const allOptions = await advertisingService.getAllAdvertisingOptions();
    res.json(allOptions);
  } catch (error) {
    console.error('Error fetching all advertising options:', error);
    res.status(500).json({ error: 'Failed to fetch advertising options' });
  }
});

/**
 * POST /api/advertising/packages - Create new advertising package
 */
router.post('/packages', async (req, res) => {
  try {
    const {
      package_name,
      package_type,
      description,
      price,
      duration_days,
      features,
      provider_name,
      provider_contact
    } = req.body;

    if (!package_name || !package_type || !price) {
      return res.status(400).json({ 
        error: 'Package name, type, and price are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO advertising_packages 
       (package_name, package_type, description, price, duration_days, features, provider_name, provider_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        package_name,
        package_type,
        description,
        price,
        duration_days,
        JSON.stringify(features),
        provider_name,
        provider_contact
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

/**
 * POST /api/advertising/subscribe - Subscribe business to package
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { business_id, package_id, start_date } = req.body;

    if (!business_id || !package_id) {
      return res.status(400).json({ 
        error: 'Business ID and package ID are required' 
      });
    }

    const subscription = await advertisingService.createAdvertisingSubscription(
      pool,
      business_id,
      package_id,
      { startDate: start_date }
    );

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to create subscription' });
  }
});

/**
 * GET /api/advertising/business/:businessId - Get business advertising
 */
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    const advertising = await advertisingService.getBusinessAdvertising(
      pool,
      businessId
    );

    res.json(advertising);
  } catch (error) {
    console.error('Error fetching business advertising:', error);
    res.status(500).json({ error: 'Failed to fetch business advertising' });
  }
});

/**
 * PUT /api/advertising/subscription/:id - Update subscription status
 */
router.put('/subscription/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'expired', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be active, expired, or cancelled' 
      });
    }

    const result = await pool.query(
      `UPDATE business_advertising 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

module.exports = router;
