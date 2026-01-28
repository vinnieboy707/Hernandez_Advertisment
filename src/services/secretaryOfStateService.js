const axios = require('axios');
require('dotenv').config();

/**
 * Service for validating business information with Secretary of State
 * This is a generic implementation that can be adapted for different states
 */
class SecretaryOfStateService {
  constructor() {
    this.apiKey = process.env.SOS_API_KEY;
    this.state = process.env.SOS_STATE || 'CA';
    
    // State-specific API endpoints
    this.endpoints = {
      'CA': 'https://businesssearch.sos.ca.gov/api',
      'NY': 'https://appext20.dos.ny.gov/corp_public/api',
      'TX': 'https://mycpa.cpa.state.tx.us/coa/api',
      // Add more states as needed
    };
  }

  /**
   * Validate business registration with Secretary of State
   * @param {string} registrationNumber - Business registration/entity number
   * @param {string} businessName - Business name for verification
   * @returns {Promise<Object>} Validation result
   */
  async validateBusiness(registrationNumber, businessName) {
    try {
      // Note: This is a template. Actual implementation depends on the state's API
      // Most Secretary of State offices have different API structures
      
      const endpoint = this.endpoints[this.state];
      
      if (!endpoint) {
        throw new Error(`API endpoint not configured for state: ${this.state}`);
      }

      // Example API call structure (adapt based on actual state API)
      const response = await axios.get(`${endpoint}/businesses/${registrationNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const businessData = response.data;

      // Validate that the business name matches
      const isValid = businessData && 
                     businessData.status === 'ACTIVE' &&
                     businessData.name &&
                     this.normalizeBusinessName(businessData.name) === this.normalizeBusinessName(businessName);

      return {
        valid: isValid,
        registrationNumber: registrationNumber,
        officialName: businessData.name,
        status: businessData.status,
        registrationDate: businessData.registrationDate,
        address: businessData.address,
        agentName: businessData.agentName,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error validating with Secretary of State:', error.message);
      
      // If API is not available or not configured, return a warning
      return {
        valid: false,
        error: error.message,
        warning: 'Unable to validate with Secretary of State. Please verify manually.',
        registrationNumber: registrationNumber,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Search for businesses by name
   * @param {string} businessName - Business name to search
   * @returns {Promise<Array>} List of matching businesses
   */
  async searchBusinesses(businessName) {
    try {
      const endpoint = this.endpoints[this.state];
      
      if (!endpoint) {
        throw new Error(`API endpoint not configured for state: ${this.state}`);
      }

      const response = await axios.get(`${endpoint}/businesses/search`, {
        params: {
          name: businessName
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return response.data.results || [];
    } catch (error) {
      console.error('Error searching businesses:', error.message);
      return [];
    }
  }

  /**
   * Normalize business name for comparison
   * @param {string} name - Business name
   * @returns {string} Normalized name
   */
  normalizeBusinessName(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get business details including contact information
   * @param {string} registrationNumber - Business registration number
   * @returns {Promise<Object>} Business details
   */
  async getBusinessDetails(registrationNumber) {
    try {
      const endpoint = this.endpoints[this.state];
      
      if (!endpoint) {
        throw new Error(`API endpoint not configured for state: ${this.state}`);
      }

      const response = await axios.get(`${endpoint}/businesses/${registrationNumber}/details`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('Error getting business details:', error.message);
      throw error;
    }
  }
}

module.exports = SecretaryOfStateService;
