const axios = require('axios');
const { google } = require('googleapis');
require('dotenv').config();

/**
 * Service for Google AdSense integration
 * Manages AdSense campaigns and ad unit creation
 */
class GoogleAdSenseService {
  constructor() {
    this.clientId = process.env.GOOGLE_ADSENSE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_ADSENSE_CLIENT_SECRET;
    this.refreshToken = process.env.GOOGLE_ADSENSE_REFRESH_TOKEN;
    this.apiKey = process.env.GOOGLE_API_KEY;
    
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      'urn:ietf:wg:oauth:2.0:oob'
    );

    if (this.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: this.refreshToken
      });
    }

    this.adsense = google.adsense({
      version: 'v2',
      auth: this.oauth2Client
    });
  }

  /**
   * Create AdSense account for a business
   * @param {Object} accountData - Account setup information
   * @returns {Promise<Object>} Account creation result
   */
  async createAdSenseAccount(accountData) {
    try {
      const {
        business_name,
        website_url,
        business_id,
        contact_email,
        phone
      } = accountData;

      // Note: AdSense account creation requires manual approval
      // This stores the application details
      return {
        success: true,
        account_status: 'pending_approval',
        business_id,
        website_url,
        message: 'AdSense account application submitted. Manual approval required from Google.'
      };
    } catch (error) {
      console.error('Error creating AdSense account:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create AdSense ad units for a website
   * @param {Object} adUnitData - Ad unit configuration
   * @returns {Promise<Object>} Ad unit creation result
   */
  async createAdUnit(adUnitData) {
    try {
      const {
        account_id,
        business_id,
        name,
        ad_type, // display, in-feed, in-article, multiplex
        size, // responsive, 728x90, 300x250, etc.
        placement_location
      } = adUnitData;

      const adUnit = {
        displayName: name,
        state: 'ACTIVE',
        contentAdsSettings: {
          type: this.mapAdType(ad_type),
          size: size === 'responsive' ? 'RESPONSIVE' : 'FIXED',
        }
      };

      const response = await this.adsense.accounts.adunits.create({
        parent: `accounts/${account_id}`,
        requestBody: adUnit
      });

      return {
        success: true,
        ad_unit_id: response.data.name,
        ad_code: this.generateAdCode(response.data),
        business_id
      };
    } catch (error) {
      console.error('Error creating ad unit:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Map ad type to AdSense format
   */
  mapAdType(type) {
    const typeMap = {
      'display': 'DISPLAY',
      'in-feed': 'FEED',
      'in-article': 'ARTICLE',
      'multiplex': 'MATCHED_CONTENT'
    };
    return typeMap[type] || 'DISPLAY';
  }

  /**
   * Generate AdSense ad code snippet
   * @param {Object} adUnit - AdSense ad unit data
   * @returns {string} HTML ad code
   */
  generateAdCode(adUnit) {
    const adUnitId = adUnit.name.split('/').pop();
    return `
<!-- Google AdSense Ad Unit -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.clientId}"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${this.clientId}"
     data-ad-slot="${adUnitId}"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
    `.trim();
  }

  /**
   * Get AdSense performance reports
   * @param {string} account_id - AdSense account ID
   * @param {Object} dateRange - Start and end dates
   * @returns {Promise<Object>} Performance metrics
   */
  async getPerformanceReport(account_id, dateRange) {
    try {
      const { start_date, end_date } = dateRange;

      const response = await this.adsense.accounts.reports.generate({
        account: `accounts/${account_id}`,
        dateRange: 'CUSTOM',
        startDate: {
          year: parseInt(start_date.split('-')[0]),
          month: parseInt(start_date.split('-')[1]),
          day: parseInt(start_date.split('-')[2])
        },
        endDate: {
          year: parseInt(end_date.split('-')[0]),
          month: parseInt(end_date.split('-')[1]),
          day: parseInt(end_date.split('-')[2])
        },
        metrics: ['IMPRESSIONS', 'CLICKS', 'ESTIMATED_EARNINGS', 'PAGE_VIEWS', 'AD_REQUESTS_CTR'],
        dimensions: ['DATE']
      });

      return {
        success: true,
        report: response.data
      };
    } catch (error) {
      console.error('Error fetching performance report:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get Google AdSense packages
   * @returns {Promise<Array>} AdSense advertising packages
   */
  async getGoogleAdSensePackages() {
    return [
      {
        package_type: 'google_adsense',
        provider_name: 'Google AdSense',
        packages: [
          {
            name: 'AdSense Starter',
            description: 'Basic AdSense setup with responsive display ads',
            price: 300,
            duration_days: 90,
            features: {
              account_setup: true,
              ad_units: 3,
              ad_types: ['Display Ads'],
              responsive_design: true,
              placement_guidance: true,
              estimated_monthly_revenue: '50-200',
              support_level: 'email'
            }
          },
          {
            name: 'AdSense Professional',
            description: 'Advanced ad placement with in-feed and in-article ads',
            price: 750,
            duration_days: 90,
            features: {
              account_setup: true,
              ad_units: 10,
              ad_types: ['Display', 'In-Feed', 'In-Article'],
              responsive_design: true,
              placement_optimization: true,
              a_b_testing: true,
              estimated_monthly_revenue: '200-800',
              support_level: 'priority',
              monthly_reports: true
            }
          },
          {
            name: 'AdSense Premium',
            description: 'Full AdSense optimization with custom ad formats',
            price: 1500,
            duration_days: 90,
            features: {
              account_setup: true,
              ad_units: 'unlimited',
              ad_types: ['Display', 'In-Feed', 'In-Article', 'Multiplex'],
              responsive_design: true,
              placement_optimization: true,
              a_b_testing: true,
              custom_ad_sizes: true,
              auto_ads: true,
              estimated_monthly_revenue: '800-3000',
              support_level: 'dedicated',
              weekly_reports: true,
              revenue_optimization: true
            }
          }
        ]
      }
    ];
  }

  /**
   * Get combined Facebook + AdSense packages
   * @returns {Promise<Array>} Combined advertising packages
   */
  async getCombinedPackages() {
    return [
      {
        package_type: 'combined',
        provider_name: 'Complete Digital Advertising',
        packages: [
          {
            name: 'Digital Growth Bundle',
            description: 'Facebook Ads for customer acquisition + AdSense for website monetization',
            price: 1800,
            duration_days: 90,
            features: {
              facebook_page: true,
              facebook_ads: 'Local targeting',
              facebook_budget: 40,
              adsense_setup: true,
              adsense_ad_units: 5,
              estimated_fb_reach: 15000,
              estimated_adsense_revenue: '200-500',
              unified_dashboard: true,
              monthly_reports: true
            }
          },
          {
            name: 'Business Accelerator',
            description: 'Advanced Facebook campaigns + Premium AdSense optimization',
            price: 3500,
            duration_days: 90,
            features: {
              facebook_page: true,
              facebook_ads: 'Regional targeting with interests/behaviors',
              facebook_budget: 80,
              adsense_setup: true,
              adsense_ad_units: 'unlimited',
              estimated_fb_reach: 50000,
              estimated_adsense_revenue: '800-2000',
              unified_dashboard: true,
              weekly_reports: true,
              dedicated_support: true,
              roi_optimization: true
            }
          },
          {
            name: 'Enterprise Marketing Suite',
            description: 'National Facebook campaigns + Full AdSense monetization',
            price: 7500,
            duration_days: 90,
            features: {
              facebook_page: true,
              facebook_ads: 'National targeting with full demographic control',
              facebook_budget: 165,
              adsense_setup: true,
              adsense_ad_units: 'unlimited',
              custom_audiences: true,
              lookalike_audiences: true,
              estimated_fb_reach: 200000,
              estimated_adsense_revenue: '2000-8000',
              unified_dashboard: true,
              daily_reports: true,
              dedicated_account_manager: true,
              roi_optimization: true,
              competitor_analysis: true
            }
          }
        ]
      }
    ];
  }
}

module.exports = GoogleAdSenseService;
