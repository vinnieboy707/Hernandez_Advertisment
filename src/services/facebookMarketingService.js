const axios = require('axios');
require('dotenv').config();

/**
 * Service for Facebook Page creation and Ads management
 * Integrates with Facebook Marketing API for comprehensive advertising
 */
class FacebookMarketingService {
  constructor() {
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    this.appId = process.env.FACEBOOK_APP_ID;
    this.appSecret = process.env.FACEBOOK_APP_SECRET;
    this.apiVersion = process.env.FACEBOOK_API_VERSION || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Create a Facebook Page for a business
   * @param {Object} pageData - Page information
   * @returns {Promise<Object>} Created page data
   */
  async createFacebookPage(pageData) {
    try {
      const {
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
      } = pageData;

      // Facebook Pages API endpoint
      // Note: Requires user access token with pages_manage_metadata permission
      const response = await axios.post(
        `${this.baseUrl}/me/accounts`,
        {
          name,
          about,
          category_id,
          location: {
            city,
            state,
            street,
            zip
          },
          phone,
          website,
          access_token: this.accessToken
        }
      );

      return {
        success: true,
        page_id: response.data.id,
        page_name: name,
        access_token: response.data.access_token,
        business_id
      };
    } catch (error) {
      console.error('Error creating Facebook page:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Create a Facebook Ad Campaign with demographic and geographic targeting
   * @param {Object} campaignData - Campaign configuration
   * @returns {Promise<Object>} Campaign creation result
   */
  async createAdCampaign(campaignData) {
    try {
      const {
        business_id,
        ad_account_id,
        campaign_name,
        objective, // REACH, TRAFFIC, ENGAGEMENT, CONVERSIONS, etc.
        budget_amount,
        budget_type, // daily or lifetime
        targeting,
        creative,
        start_time,
        end_time
      } = campaignData;

      // Step 1: Create Campaign
      const campaignResponse = await axios.post(
        `${this.baseUrl}/act_${ad_account_id}/campaigns`,
        {
          name: campaign_name,
          objective: objective || 'REACH',
          status: 'PAUSED', // Start paused for review
          special_ad_categories: [],
          access_token: this.accessToken
        }
      );

      const campaign_id = campaignResponse.data.id;

      // Step 2: Create Ad Set with targeting
      const adSetResponse = await axios.post(
        `${this.baseUrl}/act_${ad_account_id}/adsets`,
        {
          name: `${campaign_name} - Ad Set`,
          campaign_id,
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'REACH',
          bid_amount: budget_amount,
          daily_budget: budget_type === 'daily' ? budget_amount : undefined,
          lifetime_budget: budget_type === 'lifetime' ? budget_amount : undefined,
          start_time,
          end_time,
          targeting: this.buildTargeting(targeting),
          status: 'PAUSED',
          access_token: this.accessToken
        }
      );

      const adset_id = adSetResponse.data.id;

      // Step 3: Create Ad with creative
      const adResponse = await axios.post(
        `${this.baseUrl}/act_${ad_account_id}/ads`,
        {
          name: `${campaign_name} - Ad`,
          adset_id,
          creative: creative,
          status: 'PAUSED',
          access_token: this.accessToken
        }
      );

      return {
        success: true,
        campaign_id,
        adset_id,
        ad_id: adResponse.data.id,
        business_id,
        status: 'paused'
      };
    } catch (error) {
      console.error('Error creating ad campaign:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Build Facebook targeting object with demographic and geographic options
   * @param {Object} targeting - Targeting parameters
   * @returns {Object} Facebook API targeting object
   */
  buildTargeting(targeting) {
    const {
      age_min = 18,
      age_max = 65,
      genders = [1, 2], // 1=male, 2=female
      geo_locations = {},
      interests = [],
      behaviors = [],
      demographics = [],
      locale = ['en_US']
    } = targeting;

    return {
      age_min,
      age_max,
      genders,
      geo_locations: {
        countries: geo_locations.countries || ['US'],
        cities: geo_locations.cities || [],
        regions: geo_locations.regions || [],
        zips: geo_locations.zips || [],
        location_types: ['home', 'recent']
      },
      flexible_spec: [
        {
          interests: interests.map(id => ({ id, name: id })),
          behaviors: behaviors.map(id => ({ id, name: id })),
          ...demographics
        }
      ],
      locales: locale,
      publisher_platforms: ['facebook', 'instagram', 'audience_network'],
      facebook_positions: ['feed', 'instant_article', 'marketplace', 'video_feeds', 'story'],
      instagram_positions: ['stream', 'story'],
      audience_network_positions: ['classic', 'instream_video']
    };
  }

  /**
   * Get campaign performance metrics
   * @param {string} campaign_id - Facebook campaign ID
   * @returns {Promise<Object>} Campaign insights
   */
  async getCampaignInsights(campaign_id) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${campaign_id}/insights`,
        {
          params: {
            fields: 'impressions,reach,clicks,spend,cpm,cpc,ctr,actions',
            access_token: this.accessToken
          }
        }
      );

      return {
        success: true,
        insights: response.data.data[0] || {}
      };
    } catch (error) {
      console.error('Error fetching campaign insights:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Update campaign status (pause, resume, stop)
   * @param {string} campaign_id - Campaign ID
   * @param {string} status - ACTIVE, PAUSED, or DELETED
   * @returns {Promise<Object>} Update result
   */
  async updateCampaignStatus(campaign_id, status) {
    try {
      await axios.post(
        `${this.baseUrl}/${campaign_id}`,
        {
          status: status.toUpperCase(),
          access_token: this.accessToken
        }
      );

      return {
        success: true,
        campaign_id,
        status
      };
    } catch (error) {
      console.error('Error updating campaign status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Get Facebook Ad packages with demographic and geographic targeting
   * @returns {Promise<Array>} Facebook advertising packages
   */
  async getFacebookAdPackages() {
    return [
      {
        package_type: 'facebook_ads',
        provider_name: 'Facebook Marketing',
        packages: [
          {
            name: 'Facebook Local Awareness - Basic',
            description: 'Reach local customers within 10 miles with basic demographic targeting',
            price: 500,
            duration_days: 30,
            features: {
              page_creation: true,
              geographic_radius: '10 miles',
              demographic_targeting: 'basic',
              estimated_reach: 5000,
              ad_placements: ['Facebook Feed', 'Instagram Feed'],
              daily_budget: 15
            }
          },
          {
            name: 'Facebook Advanced Targeting',
            description: 'Full demographic, interest, and behavior targeting with 25-mile reach',
            price: 1200,
            duration_days: 30,
            features: {
              page_creation: true,
              geographic_radius: '25 miles',
              demographic_targeting: 'advanced',
              interest_targeting: true,
              behavior_targeting: true,
              estimated_reach: 15000,
              ad_placements: ['Facebook Feed', 'Instagram Feed', 'Stories', 'Marketplace'],
              daily_budget: 40
            }
          },
          {
            name: 'Facebook Regional Campaign',
            description: 'Target entire metro area or multiple cities with comprehensive targeting',
            price: 2500,
            duration_days: 30,
            features: {
              page_creation: true,
              geographic_targeting: 'regional',
              demographic_targeting: 'advanced',
              interest_targeting: true,
              behavior_targeting: true,
              lookalike_audiences: true,
              estimated_reach: 50000,
              ad_placements: ['All Facebook/Instagram placements'],
              daily_budget: 80
            }
          },
          {
            name: 'Facebook National Campaign',
            description: 'Nationwide reach with full demographic and psychographic targeting',
            price: 5000,
            duration_days: 30,
            features: {
              page_creation: true,
              geographic_targeting: 'national',
              demographic_targeting: 'advanced',
              interest_targeting: true,
              behavior_targeting: true,
              lookalike_audiences: true,
              custom_audiences: true,
              estimated_reach: 200000,
              ad_placements: ['All Facebook/Instagram/Audience Network'],
              daily_budget: 165,
              a_b_testing: true
            }
          }
        ]
      }
    ];
  }
}

module.exports = FacebookMarketingService;
