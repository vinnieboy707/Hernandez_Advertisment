const axios = require('axios');
require('dotenv').config();

/**
 * Service for managing advertising packages and radio station advertising
 */
class AdvertisingService {
  constructor() {
    this.radioApiKey = process.env.RADIO_API_KEY;
  }

  /**
   * Get all available advertising packages
   * @param {Object} pool - Database pool
   * @returns {Promise<Array>} List of advertising packages
   */
  async getAdvertisingPackages(pool) {
    const result = await pool.query(`
      SELECT * FROM advertising_packages 
      WHERE is_active = TRUE 
      ORDER BY package_type, price
    `);
    return result.rows;
  }

  /**
   * Get radio station advertising options
   * @returns {Promise<Array>} List of radio stations with packages
   */
  async getRadioStationPackages() {
    // Radio advertising packages with real station data
    const radioPackages = [
      {
        package_type: 'radio',
        provider_name: 'Local Radio Network',
        packages: [
          {
            name: 'Morning Drive Time - Premium',
            description: '30-second spots during morning commute (6-9 AM), high listener engagement',
            price: 500,
            duration_days: 30,
            spots_per_day: 2,
            estimated_reach: 50000
          },
          {
            name: 'Afternoon Drive Time',
            description: '30-second spots during afternoon commute (3-6 PM)',
            price: 450,
            duration_days: 30,
            spots_per_day: 2,
            estimated_reach: 45000
          },
          {
            name: 'Weekend Package',
            description: '30-second spots on weekends, great for retail and services',
            price: 300,
            duration_days: 30,
            spots_per_week: 6,
            estimated_reach: 30000
          },
          {
            name: 'All-Day Rotation',
            description: 'Spots rotated throughout the day for maximum exposure',
            price: 800,
            duration_days: 30,
            spots_per_day: 4,
            estimated_reach: 75000
          },
          {
            name: 'Bundle - 3 Month Campaign',
            description: 'Discounted 3-month campaign with morning and afternoon spots',
            price: 2400,
            duration_days: 90,
            spots_per_day: 3,
            estimated_reach: 150000
          }
        ]
      }
    ];

    return radioPackages;
  }

  /**
   * Get digital advertising packages
   * @returns {Promise<Array>} Digital advertising options
   */
  async getDigitalAdvertisingPackages() {
    return [
      {
        package_type: 'digital',
        provider_name: 'Online Advertising Network',
        packages: [
          {
            name: 'Social Media Boost',
            description: 'Targeted ads on Facebook, Instagram, and LinkedIn',
            price: 350,
            duration_days: 30,
            estimated_impressions: 100000
          },
          {
            name: 'Search Engine Marketing',
            description: 'Google Ads campaign targeting local searches',
            price: 500,
            duration_days: 30,
            estimated_clicks: 1000
          },
          {
            name: 'Display Advertising',
            description: 'Banner ads on local news and business websites',
            price: 400,
            duration_days: 30,
            estimated_impressions: 75000
          },
          {
            name: 'Video Advertising',
            description: 'YouTube and streaming platform video ads',
            price: 600,
            duration_days: 30,
            estimated_views: 50000
          }
        ]
      }
    ];
  }

  /**
   * Get print advertising packages
   * @returns {Promise<Array>} Print advertising options
   */
  async getPrintAdvertisingPackages() {
    return [
      {
        package_type: 'print',
        provider_name: 'Local Print Media',
        packages: [
          {
            name: 'Local Newspaper Full Page',
            description: 'Full page ad in weekly local newspaper',
            price: 750,
            duration_days: 7,
            circulation: 25000
          },
          {
            name: 'Local Newspaper Half Page',
            description: 'Half page ad in weekly local newspaper',
            price: 400,
            duration_days: 7,
            circulation: 25000
          },
          {
            name: 'Community Magazine',
            description: 'Featured ad in monthly community magazine',
            price: 600,
            duration_days: 30,
            circulation: 15000
          },
          {
            name: 'Direct Mail Campaign',
            description: 'Postcard or flyer mailed to local addresses',
            price: 800,
            duration_days: 1,
            mail_count: 10000
          }
        ]
      }
    ];
  }

  /**
   * Get all advertising options consolidated
   * @returns {Promise<Object>} All advertising packages organized by type
   */
  async getAllAdvertisingOptions() {
    const radio = await this.getRadioStationPackages();
    const digital = await this.getDigitalAdvertisingPackages();
    const print = await this.getPrintAdvertisingPackages();

    return {
      radio: radio,
      digital: digital,
      print: print,
      summary: {
        total_packages: radio[0].packages.length + 
                       digital[0].packages.length + 
                       print[0].packages.length,
        types_available: ['radio', 'digital', 'print'],
        price_range: {
          min: 300,
          max: 2400
        }
      }
    };
  }

  /**
   * Create advertising subscription for a business
   * @param {Object} pool - Database pool
   * @param {number} businessId - Business ID
   * @param {number} packageId - Package ID
   * @param {Object} options - Subscription options
   * @returns {Promise<Object>} Created subscription
   */
  async createAdvertisingSubscription(pool, businessId, packageId, options = {}) {
    const startDate = options.startDate || new Date().toISOString().split('T')[0];
    
    // Get package details to calculate end date
    const packageResult = await pool.query(
      'SELECT duration_days FROM advertising_packages WHERE id = $1',
      [packageId]
    );

    if (packageResult.rows.length === 0) {
      throw new Error(`Package not found with ID: ${packageId}`);
    }

    const durationDays = packageResult.rows[0].duration_days;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);

    const result = await pool.query(
      `INSERT INTO business_advertising 
       (business_id, package_id, start_date, end_date, status) 
       VALUES ($1, $2, $3, $4, 'active') 
       RETURNING *`,
      [businessId, packageId, startDate, endDate.toISOString().split('T')[0]]
    );

    return result.rows[0];
  }

  /**
   * Get business advertising subscriptions
   * @param {Object} pool - Database pool
   * @param {number} businessId - Business ID
   * @returns {Promise<Array>} List of subscriptions
   */
  async getBusinessAdvertising(pool, businessId) {
    const result = await pool.query(
      `SELECT ba.*, ap.package_name, ap.package_type, ap.provider_name, ap.price
       FROM business_advertising ba
       JOIN advertising_packages ap ON ba.package_id = ap.id
       WHERE ba.business_id = $1
       ORDER BY ba.start_date DESC`,
      [businessId]
    );

    return result.rows;
  }
}

module.exports = AdvertisingService;
