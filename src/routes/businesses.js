const express = require('express');
const router = express.Router();
const { pool } = require('../db/database');
const SecretaryOfStateService = require('../services/secretaryOfStateService');
const PlatformSyncService = require('../services/platformSyncService');

const sosService = new SecretaryOfStateService();
const platformSync = new PlatformSyncService();

/**
 * GET /api/businesses - Get all businesses
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM businesses ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

/**
 * GET /api/businesses/:id - Get a specific business
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const businessResult = await pool.query(
      'SELECT * FROM businesses WHERE id = $1',
      [id]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const business = businessResult.rows[0];

    // Get business hours
    const hoursResult = await pool.query(
      'SELECT * FROM business_hours WHERE business_id = $1 ORDER BY day_of_week',
      [id]
    );

    // Get holidays
    const holidaysResult = await pool.query(
      'SELECT * FROM holidays WHERE business_id = $1 ORDER BY holiday_date',
      [id]
    );

    // Get platform sync status
    const platformsResult = await pool.query(
      'SELECT * FROM platform_sync WHERE business_id = $1',
      [id]
    );

    res.json({
      ...business,
      hours: hoursResult.rows,
      holidays: holidaysResult.rows,
      platforms: platformsResult.rows
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

/**
 * POST /api/businesses - Create a new business
 */
router.post('/', async (req, res) => {
  try {
    const {
      business_name,
      sos_registration_number,
      contact_email,
      contact_phone,
      address,
      city,
      state,
      zip_code,
      business_type
    } = req.body;

    // Validate required fields
    if (!business_name || !sos_registration_number) {
      return res.status(400).json({ 
        error: 'Business name and SOS registration number are required' 
      });
    }

    // Validate with Secretary of State
    const validation = await sosService.validateBusiness(
      sos_registration_number, 
      business_name
    );

    // Insert business
    const result = await pool.query(
      `INSERT INTO businesses 
       (business_name, sos_registration_number, contact_email, contact_phone, 
        address, city, state, zip_code, business_type, validated, sos_last_validated) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        business_name,
        sos_registration_number,
        contact_email,
        contact_phone,
        address,
        city,
        state,
        zip_code,
        business_type,
        validation.valid,
        new Date()
      ]
    );

    const business = result.rows[0];

    res.status(201).json({
      business,
      validation: validation
    });
  } catch (error) {
    console.error('Error creating business:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ 
        error: 'Business with this registration number already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create business' });
  }
});

/**
 * PUT /api/businesses/:id - Update a business
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Whitelist of allowed field names to prevent unauthorized field updates
    const allowedFields = [
      'business_name',
      'sos_registration_number',
      'contact_email',
      'contact_phone',
      'address',
      'city',
      'state',
      'zip_code',
      'business_type',
      'validated'
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query with validated field names
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      } else if (key !== 'id') {
        return res.status(400).json({ error: `Invalid field: ${key}` });
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE businesses 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

/**
 * POST /api/businesses/:id/validate - Re-validate business with SOS
 */
router.post('/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;

    const businessResult = await pool.query(
      'SELECT * FROM businesses WHERE id = $1',
      [id]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const business = businessResult.rows[0];

    // Validate with Secretary of State
    const validation = await sosService.validateBusiness(
      business.sos_registration_number,
      business.business_name
    );

    // Update validation status
    await pool.query(
      `UPDATE businesses 
       SET validated = $1, sos_last_validated = $2 
       WHERE id = $3`,
      [validation.valid, new Date(), id]
    );

    res.json(validation);
  } catch (error) {
    console.error('Error validating business:', error);
    res.status(500).json({ error: 'Failed to validate business' });
  }
});

/**
 * POST /api/businesses/:id/sync - Sync business to platforms
 */
router.post('/:id/sync', async (req, res) => {
  try {
    const { id } = req.params;
    const { platforms } = req.body; // Optional: specific platforms to sync

    const businessResult = await pool.query(
      'SELECT * FROM businesses WHERE id = $1',
      [id]
    );

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const business = businessResult.rows[0];

    // Get hours and holidays
    const hoursResult = await pool.query(
      'SELECT * FROM business_hours WHERE business_id = $1',
      [id]
    );

    const holidaysResult = await pool.query(
      'SELECT * FROM holidays WHERE business_id = $1',
      [id]
    );

    const businessData = {
      ...business,
      hours: hoursResult.rows,
      holidays: holidaysResult.rows
    };

    // Sync to platforms (allow partial success)
    let syncResults;
    if (platforms && Array.isArray(platforms)) {
      // Parallel sync to specific platforms, allowing partial success
      const settledResults = await Promise.allSettled(
        platforms.map(platform => platformSync.syncToPlatform(platform, businessData))
      );

      // Normalize settled results into consistent structure
      syncResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        const reason = result.reason || {};
        const platformName = platforms[index] || 'unknown';

        return {
          platform: platformName,
          platformBusinessId: null,
          success: false,
          error: reason && reason.message ? reason.message : String(reason)
        };
      });
    } else {
      // Sync to all platforms with partial success support
      const allPlatforms = ['google', 'yellowpages'];
      const settledResults = await Promise.allSettled(
        allPlatforms.map(platform => platformSync.syncToPlatform(platform, businessData))
      );

      syncResults = settledResults.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        const reason = result.reason || {};
        const platformName = allPlatforms[index] || 'unknown';

        return {
          platform: platformName,
          platformBusinessId: null,
          success: false,
          error: reason && reason.message ? reason.message : String(reason)
        };
      });
    }

    // Update platform_sync table
    for (const result of syncResults) {
      await pool.query(
        `INSERT INTO platform_sync 
         (business_id, platform_name, platform_business_id, sync_status, last_synced, sync_errors)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (business_id, platform_name) 
         DO UPDATE SET 
           platform_business_id = EXCLUDED.platform_business_id,
           sync_status = EXCLUDED.sync_status,
           last_synced = EXCLUDED.last_synced,
           sync_errors = EXCLUDED.sync_errors`,
        [
          id,
          result.platform,
          result.platformBusinessId || null,
          result.success ? 'synced' : 'failed',
          new Date(),
          result.error || null
        ]
      );
    }

    res.json({
      message: 'Sync completed',
      results: syncResults
    });
  } catch (error) {
    console.error('Error syncing business:', error);
    res.status(500).json({ error: 'Failed to sync business' });
  }
});

/**
 * POST /api/businesses/:id/hours - Add/update business hours
 */
router.post('/:id/hours', async (req, res) => {
  try {
    const { id } = req.params;
    const { hours } = req.body; // Array of hours objects

    if (!Array.isArray(hours)) {
      return res.status(400).json({ error: 'Hours must be an array' });
    }

    // Delete existing hours
    await pool.query('DELETE FROM business_hours WHERE business_id = $1', [id]);

    // Insert new hours
    const insertedHours = [];
    for (const hour of hours) {
      const result = await pool.query(
        `INSERT INTO business_hours 
         (business_id, day_of_week, open_time, close_time, is_closed)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          id,
          hour.day_of_week,
          hour.open_time || null,
          hour.close_time || null,
          hour.is_closed || false
        ]
      );
      insertedHours.push(result.rows[0]);
    }

    res.json(insertedHours);
  } catch (error) {
    console.error('Error updating hours:', error);
    res.status(500).json({ error: 'Failed to update hours' });
  }
});

/**
 * POST /api/businesses/:id/holidays - Add holiday
 */
router.post('/:id/holidays', async (req, res) => {
  try {
    const { id } = req.params;
    const { holiday_name, holiday_date, is_closed, special_hours_open, special_hours_close } = req.body;

    const result = await pool.query(
      `INSERT INTO holidays 
       (business_id, holiday_name, holiday_date, is_closed, special_hours_open, special_hours_close)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, holiday_name, holiday_date, is_closed, special_hours_open, special_hours_close]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ error: 'Failed to add holiday' });
  }
});

/**
 * DELETE /api/businesses/:id - Delete a business
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM businesses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

module.exports = router;
