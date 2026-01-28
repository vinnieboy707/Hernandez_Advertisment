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
   * NOTE: These are example packages with realistic pricing. In production,
   * these should be fetched from actual radio station APIs or a CMS.
   * @returns {Promise<Array>} List of radio stations with packages
   */
  async getRadioStationPackages() {
    // Example advertising packages with realistic pricing
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
   * NOTE: Example packages. Replace with actual API integration in production.
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
   * NOTE: Example packages. Replace with actual API integration in production.
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
   * Get event and fair advertising packages
   * NOTE: Example packages. Replace with actual API integration in production.
   * @returns {Promise<Array>} Event and fair advertising options
   */
  async getEventAdvertisingPackages() {
    return [
      {
        package_type: 'event',
        provider_name: 'Local Events & Fairgrounds',
        packages: [
          {
            name: 'County Fair Booth - Standard',
            description: 'Standard 10x10 booth at county fair with basic setup',
            price: 1200,
            duration_days: 7,
            estimated_attendance: 50000
          },
          {
            name: 'County Fair Booth - Premium',
            description: 'Premium 20x20 booth with electricity and corner location',
            price: 2500,
            duration_days: 7,
            estimated_attendance: 50000
          },
          {
            name: 'Racetrack Sponsorship - Banner',
            description: 'Banner placement at local racetrack for entire season',
            price: 3000,
            duration_days: 180,
            estimated_reach: 75000
          },
          {
            name: 'Racetrack Sponsorship - Title',
            description: 'Title sponsorship for specific race event with branding',
            price: 5000,
            duration_days: 1,
            estimated_reach: 15000
          },
          {
            name: 'Multi-Fair Package',
            description: 'Booth at 3 regional fairs with setup included',
            price: 3500,
            duration_days: 30,
            estimated_attendance: 125000
          },
          {
            name: 'Festival Vendor Booth',
            description: 'Booth space at local festivals and community events',
            price: 800,
            duration_days: 3,
            estimated_attendance: 20000
          }
        ]
      }
    ];
  }

  /**
   * Get website and digital presence packages
   * NOTE: Example packages. Replace with actual API integration in production.
   * @returns {Promise<Array>} Website service packages
   */
  async getWebsitePackages() {
    return [
      {
        package_type: 'website',
        provider_name: 'Digital Presence Services',
        packages: [
          {
            name: 'Business Info Consistency Check',
            description: 'Verify and correct contact info, hours, and business details across all platforms',
            price: 199,
            duration_days: 30,
            includes: ['Contact verification', 'Hours validation', 'Multi-platform sync', 'Monthly updates']
          },
          {
            name: 'Basic Website Package',
            description: 'Simple 5-page website with contact form and business information',
            price: 1500,
            duration_days: 365,
            includes: ['5 pages', 'Mobile responsive', 'Contact form', 'Free hosting 1 year', 'Basic SEO']
          },
          {
            name: 'Advanced Website Package',
            description: 'Professional website with e-commerce, booking system, and custom features',
            price: 4500,
            duration_days: 365,
            includes: ['10+ pages', 'E-commerce/Booking', 'Custom design', 'Free hosting 1 year', 'Advanced SEO', 'Analytics']
          },
          {
            name: 'Website Update Service',
            description: 'Update existing website with new content, features, and modern design',
            price: 2000,
            duration_days: 30,
            includes: ['Content updates', 'Design refresh', 'Mobile optimization', 'Performance tuning', 'SEO improvements']
          },
          {
            name: 'Complete Digital Presence',
            description: 'Website + verified listings + social media + monthly management',
            price: 599,
            duration_days: 30,
            includes: ['Website maintenance', 'Multi-platform management', 'Photo updates on Google Maps', 'Social media posts', 'Review monitoring']
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
    const FacebookMarketingService = require('./facebookMarketingService');
    const GoogleAdSenseService = require('./googleAdSenseService');
    
    const facebookService = new FacebookMarketingService();
    const adsenseService = new GoogleAdSenseService();
    
    const radio = await this.getRadioStationPackages();
    const digital = await this.getDigitalAdvertisingPackages();
    const print = await this.getPrintAdvertisingPackages();
    const events = await this.getEventAdvertisingPackages();
    const website = await this.getWebsitePackages();
    const facebook = await facebookService.getFacebookAdPackages();
    const adsense = await adsenseService.getGoogleAdSensePackages();
    const combined = await adsenseService.getCombinedPackages();

    return {
      radio: radio,
      digital: digital,
      print: print,
      events: events,
      website: website,
      facebook: facebook,
      google_adsense: adsense,
      combined: combined,
      summary: {
        total_packages: radio[0].packages.length + 
                       digital[0].packages.length + 
                       print[0].packages.length +
                       events[0].packages.length +
                       website[0].packages.length +
                       facebook[0].packages.length +
                       adsense[0].packages.length +
                       combined[0].packages.length,
        types_available: ['radio', 'digital', 'print', 'events', 'website', 'facebook_ads', 'google_adsense', 'combined'],
        price_range: {
          min: 199,
          max: 7500
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
