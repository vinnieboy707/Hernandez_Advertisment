const axios = require('axios');
require('dotenv').config();

/**
 * Service for syncing business information across multiple platforms
 */
class PlatformSyncService {
  constructor() {
    this.platforms = {
      google: new GoogleBusinessSync(),
      yellowpages: new YellowPagesSync(),
    };
  }

  /**
   * Sync business to a specific platform
   * @param {string} platform - Platform name ('google', 'yellowpages', etc.)
   * @param {Object} businessData - Business information to sync
   * @returns {Promise<Object>} Sync result
   */
  async syncToPlatform(platform, businessData) {
    const syncService = this.platforms[platform.toLowerCase()];
    
    if (!syncService) {
      throw new Error(`Platform ${platform} is not supported`);
    }

    try {
      const result = await syncService.sync(businessData);
      return {
        success: true,
        platform: platform,
        platformBusinessId: result.id,
        syncedAt: new Date().toISOString(),
        message: result.message
      };
    } catch (error) {
      return {
        success: false,
        platform: platform,
        error: error.message,
        syncedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Sync business to all platforms (in parallel with partial success)
   * @param {Object} businessData - Business information
   * @returns {Promise<Array>} Results from all platforms
   */
  async syncToAllPlatforms(businessData) {
    const platforms = Object.keys(this.platforms);
    const syncPromises = platforms.map((platform) =>
      this.syncToPlatform(platform, businessData)
    );

    // Use allSettled to allow partial success
    const settledResults = await Promise.allSettled(syncPromises);

    return settledResults.map((result, index) => {
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
  }

  /**
   * Validate business information across platforms
   * @param {string} businessName - Business name
   * @param {string} address - Business address
   * @returns {Promise<Object>} Validation results from all platforms
   */
  async validateAcrossPlatforms(businessName, address) {
    const validationResults = {};

    for (const [platformName, service] of Object.entries(this.platforms)) {
      try {
        validationResults[platformName] = await service.validate(businessName, address);
      } catch (error) {
        validationResults[platformName] = {
          valid: false,
          error: error.message
        };
      }
    }

    return validationResults;
  }
}

/**
 * Google Business Profile sync service
 */
class GoogleBusinessSync {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
    this.baseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1';
  }

  async sync(businessData) {
    try {
      // Google Business Profile API structure
      const location = {
        name: businessData.business_name,
        primaryPhone: businessData.contact_phone,
        address: {
          addressLines: [businessData.address],
          locality: businessData.city,
          administrativeArea: businessData.state,
          postalCode: businessData.zip_code
        },
        regularHours: this.formatHours(businessData.hours),
        specialHours: this.formatHolidays(businessData.holidays)
      };

      // Note: In production, use OAuth 2.0 service account authentication
      // This is a simplified example. See Google Business Profile API docs
      const response = await axios.post(
        `${this.baseUrl}/accounts/${this.accountId}/locations`,
        location,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.name,
        message: 'Successfully synced to Google Business Profile'
      };
    } catch (error) {
      console.error('Google sync error:', error.message);
      throw new Error(`Google sync failed: ${error.message}`);
    }
  }

  async validate(businessName, address) {
    // Validate business exists on Google
    try {
      const response = await axios.get(
        `${this.baseUrl}/accounts/${this.accountId}/locations`,
        {
          params: { filter: businessName },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        valid: response.data.locations && response.data.locations.length > 0,
        details: response.data.locations?.[0]
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  formatHours(hours) {
    // Convert business hours to Google format
    if (!hours) return null;
    
    return {
      periods: hours.map(h => ({
        openDay: h.day_of_week,
        openTime: h.open_time,
        closeDay: h.day_of_week,
        closeTime: h.close_time
      }))
    };
  }

  formatHolidays(holidays) {
    // Convert holidays to Google special hours format
    if (!holidays) return null;

    return holidays.map(h => ({
      specialHourPeriod: {
        startDate: h.holiday_date,
        endDate: h.holiday_date,
        isClosed: h.is_closed
      }
    }));
  }
}

/**
 * Yellow Pages sync service
 * NOTE: This is an example integration. The Yellow Pages API endpoint shown here
 * is a placeholder. In production, configure YELLOWPAGES_API_BASE_URL environment
 * variable to point to the actual Yellow Pages API or an internal proxy service.
 */
class YellowPagesSync {
  constructor() {
    this.apiKey = process.env.YELLOWPAGES_API_KEY;
    // Example placeholder base URL; override via environment for real integration
    this.baseUrl = process.env.YELLOWPAGES_API_BASE_URL || 'https://api.yellowpages.com/v1';
  }

  async sync(businessData) {
    try {
      const listing = {
        name: businessData.business_name,
        phone: businessData.contact_phone,
        email: businessData.contact_email,
        address: {
          street: businessData.address,
          city: businessData.city,
          state: businessData.state,
          zip: businessData.zip_code
        },
        hours: businessData.hours,
        categories: [businessData.business_type]
      };

      const response = await axios.post(
        `${this.baseUrl}/listings`,
        listing,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.listingId,
        message: 'Successfully synced to Yellow Pages'
      };
    } catch (error) {
      console.error('Yellow Pages sync error:', error.message);
      throw new Error(`Yellow Pages sync failed: ${error.message}`);
    }
  }

  async validate(businessName, address) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/listings/search`,
        {
          params: { name: businessName, address: address },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        valid: response.data.results && response.data.results.length > 0,
        details: response.data.results?.[0]
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = PlatformSyncService;
