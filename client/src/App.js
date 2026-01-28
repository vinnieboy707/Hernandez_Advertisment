import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configurable API URL - can be overridden via environment variable
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Configure axios defaults and error handling
axios.defaults.timeout = 30000; // 30 second timeout
axios.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Network error
      return Promise.reject(new Error('Network error: Unable to connect to the server'));
    }
    return Promise.reject(error);
  }
);

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [businesses, setBusinesses] = useState([]);
  const [advertisingOptions, setAdvertisingOptions] = useState(null);
  const [facebookPackages, setFacebookPackages] = useState([]);
  const [adsensePackages, setAdsensePackages] = useState([]);
  const [combinedPackages, setCombinedPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [newBusiness, setNewBusiness] = useState({
    business_name: '',
    sos_registration_number: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: 'CA',
    zip_code: '',
    business_type: ''
  });

  useEffect(() => {
    if (currentView === 'businesses') {
      fetchBusinesses();
    } else if (currentView === 'advertising') {
      fetchAdvertisingOptions();
    } else if (currentView === 'facebook') {
      fetchFacebookPackages();
    } else if (currentView === 'adsense') {
      fetchAdSensePackages();
    } else if (currentView === 'combined') {
      fetchCombinedPackages();
    }
  }, [currentView]);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/businesses`);
      setBusinesses(response.data);
    } catch (err) {
      setError('Failed to fetch businesses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvertisingOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/advertising/all`);
      setAdvertisingOptions(response.data);
    } catch (err) {
      setError('Failed to fetch advertising options: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacebookPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/facebook/packages`);
      setFacebookPackages(response.data);
    } catch (err) {
      setError('Failed to fetch Facebook packages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdSensePackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/google-adsense/packages`);
      setAdsensePackages(response.data);
    } catch (err) {
      setError('Failed to fetch AdSense packages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCombinedPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/google-adsense/combined-packages`);
      setCombinedPackages(response.data);
    } catch (err) {
      setError('Failed to fetch combined packages: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBusiness = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_URL}/businesses`, newBusiness);
      setSuccess(`Business created successfully! ${response.data.validation.valid ? 'Validated with Secretary of State.' : 'Manual validation required.'}`);
      setNewBusiness({
        business_name: '',
        sos_registration_number: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        city: '',
        state: 'CA',
        zip_code: '',
        business_type: ''
      });
      fetchBusinesses();
    } catch (err) {
      setError('Failed to create business: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleValidateBusiness = async (businessId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/businesses/${businessId}/validate`);
      setSuccess('Business validation updated!');
      fetchBusinesses();
    } catch (err) {
      setError('Failed to validate business: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBusiness = async (businessId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/businesses/${businessId}/sync`);
      setSuccess('Business synced to all platforms!');
      fetchBusinesses();
    } catch (err) {
      setError('Failed to sync business: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHome = () => (
    <div className="card">
      <h2>Welcome to Hernandez Advertising Platform</h2>
      <div style={{ lineHeight: '1.8', color: '#555' }}>
        <h3>Features:</h3>
        <ul style={{ fontSize: '1.1em' }}>
          <li>✅ <strong>Secretary of State Integration:</strong> Automatically validate business registration and contact information</li>
          <li>✅ <strong>Multi-Platform Sync:</strong> Sync business information across Google Business Profile, Yellow Pages, and more</li>
          <li>✅ <strong>Business Hours Management:</strong> Set and manage open hours and scheduled holidays</li>
          <li>✅ <strong>Facebook Marketing:</strong> Create pages and run targeted ad campaigns with full demographic/geographic control</li>
          <li>✅ <strong>Google AdSense:</strong> Setup and manage AdSense for website monetization</li>
          <li>✅ <strong>Traditional Advertising:</strong> Radio, digital, print, events, and website packages</li>
          <li>✅ <strong>Real-Time Data:</strong> No mock data - all information is real and validated</li>
          <li>✅ <strong>Easy Deployment:</strong> Deploy with Docker in minutes</li>
        </ul>

        <h3>Getting Started:</h3>
        <ol style={{ fontSize: '1.1em' }}>
          <li>Navigate to <strong>Businesses</strong> to add your business information</li>
          <li>Validate your business with the Secretary of State</li>
          <li>Sync your information across all platforms</li>
          <li>Browse <strong>Facebook Ads</strong> or <strong>Google AdSense</strong> packages</li>
          <li>Check out <strong>Combined Packages</strong> for complete solutions</li>
        </ol>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f4ff', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Quick Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>{businesses.length}</div>
              <div style={{ color: '#666' }}>Total Businesses</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>30+</div>
              <div style={{ color: '#666' }}>Advertising Packages</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>3</div>
              <div style={{ color: '#666' }}>Platform Integrations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinesses = () => (
    <>
      <div className="card">
        <h2>Add New Business</h2>
        <form onSubmit={handleCreateBusiness}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                required
                value={newBusiness.business_name}
                onChange={(e) => setNewBusiness({ ...newBusiness, business_name: e.target.value })}
                placeholder="Enter business name"
              />
            </div>
            <div className="form-group">
              <label>SOS Registration Number *</label>
              <input
                type="text"
                required
                value={newBusiness.sos_registration_number}
                onChange={(e) => setNewBusiness({ ...newBusiness, sos_registration_number: e.target.value })}
                placeholder="e.g., C1234567"
              />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={newBusiness.contact_email}
                onChange={(e) => setNewBusiness({ ...newBusiness, contact_email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={newBusiness.contact_phone}
                onChange={(e) => setNewBusiness({ ...newBusiness, contact_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={newBusiness.address}
                onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                placeholder="123 Main St"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={newBusiness.city}
                onChange={(e) => setNewBusiness({ ...newBusiness, city: e.target.value })}
                placeholder="Los Angeles"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <select
                value={newBusiness.state}
                onChange={(e) => setNewBusiness({ ...newBusiness, state: e.target.value })}
              >
                <option value="CA">California</option>
                <option value="NY">New York</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="IL">Illinois</option>
              </select>
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                value={newBusiness.zip_code}
                onChange={(e) => setNewBusiness({ ...newBusiness, zip_code: e.target.value })}
                placeholder="90001"
              />
            </div>
            <div className="form-group">
              <label>Business Type</label>
              <input
                type="text"
                value={newBusiness.business_type}
                onChange={(e) => setNewBusiness({ ...newBusiness, business_type: e.target.value })}
                placeholder="e.g., Restaurant, Retail"
              />
            </div>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Business'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Your Businesses ({businesses.length})</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : businesses.length === 0 ? (
          <p>No businesses yet. Add your first business above!</p>
        ) : (
          <div className="business-list">
            {businesses.map((business) => (
              <div key={business.id} className="business-item">
                <h3>{business.business_name}</h3>
                <div className="info">
                  <strong>Registration:</strong> {business.sos_registration_number}
                  <span className={`status-badge ${business.validated ? 'status-validated' : 'status-unvalidated'}`}>
                    {business.validated ? 'Validated' : 'Unvalidated'}
                  </span>
                </div>
                {business.contact_email && (
                  <div className="info">📧 {business.contact_email}</div>
                )}
                {business.contact_phone && (
                  <div className="info">📞 {business.contact_phone}</div>
                )}
                {business.address && (
                  <div className="info">📍 {business.address}, {business.city}, {business.state} {business.zip_code}</div>
                )}
                <div className="actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleValidateBusiness(business.id)}
                    disabled={loading}
                  >
                    Validate
                  </button>
                  <button
                    className="btn"
                    onClick={() => handleSyncBusiness(business.id)}
                    disabled={loading}
                  >
                    Sync
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderAdvertising = () => (
    <>
      {loading ? (
        <div className="loading">Loading advertising options...</div>
      ) : advertisingOptions ? (
        <>
          <div className="card">
            <h2>📻 Radio Advertising Packages</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Reach local audiences with targeted radio advertising. Our packages include prime-time slots and rotating spots.
            </p>
            {advertisingOptions.radio.map((provider, idx) => (
              <div key={idx}>
                <h3 style={{ color: '#667eea' }}>{provider.provider_name}</h3>
                <div className="package-grid">
                  {provider.packages.map((pkg, pkgIdx) => (
                    <div key={pkgIdx} className="package-card">
                      <h3>{pkg.name}</h3>
                      <div className="price">${pkg.price}</div>
                      <div className="description">{pkg.description}</div>
                      <div className="details">
                        <div>📅 Duration: {pkg.duration_days} days</div>
                        <div>📊 Reach: ~{(pkg.estimated_reach || 0).toLocaleString()} listeners</div>
                        {pkg.spots_per_day && <div>🎯 {pkg.spots_per_day} spots/day</div>}
                        {pkg.spots_per_week && <div>🎯 {pkg.spots_per_week} spots/week</div>}
                      </div>
                      <button className="btn">Select Package</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>💻 Digital Advertising Packages</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Expand your online presence with targeted digital advertising across social media, search engines, and display networks.
            </p>
            {advertisingOptions.digital.map((provider, idx) => (
              <div key={idx}>
                <h3 style={{ color: '#667eea' }}>{provider.provider_name}</h3>
                <div className="package-grid">
                  {provider.packages.map((pkg, pkgIdx) => (
                    <div key={pkgIdx} className="package-card">
                      <h3>{pkg.name}</h3>
                      <div className="price">${pkg.price}</div>
                      <div className="description">{pkg.description}</div>
                      <div className="details">
                        <div>📅 Duration: {pkg.duration_days} days</div>
                        {pkg.estimated_impressions && <div>👁️ ~{(pkg.estimated_impressions || 0).toLocaleString()} impressions</div>}
                        {pkg.estimated_clicks && <div>🖱️ ~{(pkg.estimated_clicks || 0).toLocaleString()} clicks</div>}
                        {pkg.estimated_views && <div>📺 ~{(pkg.estimated_views || 0).toLocaleString()} views</div>}
                      </div>
                      <button className="btn">Select Package</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>📰 Print Advertising Packages</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Traditional print advertising remains effective for local reach. Choose from newspapers, magazines, and direct mail campaigns.
            </p>
            {advertisingOptions.print.map((provider, idx) => (
              <div key={idx}>
                <h3 style={{ color: '#667eea' }}>{provider.provider_name}</h3>
                <div className="package-grid">
                  {provider.packages.map((pkg, pkgIdx) => (
                    <div key={pkgIdx} className="package-card">
                      <h3>{pkg.name}</h3>
                      <div className="price">${pkg.price}</div>
                      <div className="description">{pkg.description}</div>
                      <div className="details">
                        <div>📅 Duration: {pkg.duration_days} days</div>
                        {pkg.circulation && <div>📮 Circulation: {(pkg.circulation || 0).toLocaleString()}</div>}
                        {pkg.mail_count && <div>✉️ Mail count: {(pkg.mail_count || 0).toLocaleString()}</div>}
                      </div>
                      <button className="btn">Select Package</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );

  const renderFacebookPackages = () => (
    <>
      <div className="card">
        <h2>👍 Facebook Marketing Packages</h2>
        <p style={{ fontSize: '1.1em', color: '#666', marginBottom: '30px' }}>
          Create Facebook pages and run targeted ad campaigns with full demographic and geographic targeting capabilities.
        </p>
      </div>

      {loading ? (
        <div className="card">Loading Facebook packages...</div>
      ) : facebookPackages.length > 0 ? (
        <div className="packages-grid">
          {facebookPackages.map((provider, idx) => (
            <div key={idx} className="provider-section">
              <h3 style={{ color: '#1877f2', marginBottom: '20px' }}>
                {provider.provider_name}
              </h3>
              <div className="packages-list">
                {provider.packages.map((pkg, pkgIdx) => (
                  <div key={pkgIdx} className="package-card facebook-package">
                    <div className="package-header">
                      <h4>{pkg.name}</h4>
                      <div className="price">${pkg.price.toLocaleString()}/mo</div>
                    </div>
                    <div className="description">{pkg.description}</div>
                    <div className="details">
                      <div>📅 Duration: {pkg.duration_days} days</div>
                      <div>🎯 Targeting: {pkg.features.demographic_targeting}</div>
                      {pkg.features.geographic_radius && (
                        <div>📍 Geographic Reach: {pkg.features.geographic_radius}</div>
                      )}
                      {pkg.features.geographic_targeting && (
                        <div>🌍 Geographic: {pkg.features.geographic_targeting}</div>
                      )}
                      <div>👥 Estimated Reach: {(pkg.features.estimated_reach || 0).toLocaleString()}</div>
                      <div>💵 Daily Budget: ${pkg.features.daily_budget}</div>
                      {pkg.features.page_creation && <div>✅ Includes Facebook Page Creation</div>}
                      {pkg.features.interest_targeting && <div>✅ Interest Targeting</div>}
                      {pkg.features.behavior_targeting && <div>✅ Behavior Targeting</div>}
                      {pkg.features.lookalike_audiences && <div>✅ Lookalike Audiences</div>}
                      {pkg.features.custom_audiences && <div>✅ Custom Audiences</div>}
                      {pkg.features.a_b_testing && <div>✅ A/B Testing</div>}
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                      <strong>Ad Placements:</strong> {Array.isArray(pkg.features.ad_placements) 
                        ? pkg.features.ad_placements.join(', ') 
                        : pkg.features.ad_placements}
                    </div>
                    <button className="btn btn-facebook">Select Package</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  const renderAdSensePackages = () => (
    <>
      <div className="card">
        <h2>💰 Google AdSense Packages</h2>
        <p style={{ fontSize: '1.1em', color: '#666', marginBottom: '30px' }}>
          Setup and manage Google AdSense for website monetization with multiple ad formats and placement optimization.
        </p>
      </div>

      {loading ? (
        <div className="card">Loading AdSense packages...</div>
      ) : adsensePackages.length > 0 ? (
        <div className="packages-grid">
          {adsensePackages.map((provider, idx) => (
            <div key={idx} className="provider-section">
              <h3 style={{ color: '#4285f4', marginBottom: '20px' }}>
                {provider.provider_name}
              </h3>
              <div className="packages-list">
                {provider.packages.map((pkg, pkgIdx) => (
                  <div key={pkgIdx} className="package-card adsense-package">
                    <div className="package-header">
                      <h4>{pkg.name}</h4>
                      <div className="price">${pkg.price.toLocaleString()}</div>
                    </div>
                    <div className="description">{pkg.description}</div>
                    <div className="details">
                      <div>📅 Duration: {pkg.duration_days} days</div>
                      <div>📊 Ad Units: {pkg.features.ad_units}</div>
                      <div>💰 Est. Monthly Revenue: ${pkg.features.estimated_monthly_revenue}</div>
                      {pkg.features.account_setup && <div>✅ Account Setup Included</div>}
                      {pkg.features.responsive_design && <div>✅ Responsive Design</div>}
                      {pkg.features.placement_optimization && <div>✅ Placement Optimization</div>}
                      {pkg.features.a_b_testing && <div>✅ A/B Testing</div>}
                      {pkg.features.custom_ad_sizes && <div>✅ Custom Ad Sizes</div>}
                      {pkg.features.auto_ads && <div>✅ Auto Ads</div>}
                      {pkg.features.revenue_optimization && <div>✅ Revenue Optimization</div>}
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                      <strong>Ad Types:</strong> {Array.isArray(pkg.features.ad_types) 
                        ? pkg.features.ad_types.join(', ') 
                        : pkg.features.ad_types}
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                      <strong>Support:</strong> {pkg.features.support_level}
                    </div>
                    <button className="btn btn-adsense">Select Package</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  const renderCombinedPackages = () => (
    <>
      <div className="card">
        <h2>🚀 Combined Advertising Packages</h2>
        <p style={{ fontSize: '1.1em', color: '#666', marginBottom: '30px' }}>
          Get the best of both worlds! Facebook Ads for customer acquisition combined with Google AdSense for website monetization - all managed through one unified platform.
        </p>
        <div style={{ backgroundColor: '#f0f4ff', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <strong>💡 Why Choose Combined Packages?</strong>
          <ul style={{ marginTop: '10px', lineHeight: '1.8' }}>
            <li>Unified dashboard for all your advertising needs</li>
            <li>Better pricing than purchasing separately</li>
            <li>Comprehensive reporting across both platforms</li>
            <li>Dedicated account management</li>
            <li>ROI optimization across all channels</li>
          </ul>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading combined packages...</div>
      ) : combinedPackages.length > 0 ? (
        <div className="packages-grid">
          {combinedPackages.map((provider, idx) => (
            <div key={idx} className="provider-section">
              <h3 style={{ color: '#7c3aed', marginBottom: '20px' }}>
                {provider.provider_name}
              </h3>
              <div className="packages-list">
                {provider.packages.map((pkg, pkgIdx) => (
                  <div key={pkgIdx} className="package-card combined-package">
                    <div className="package-header">
                      <h4>{pkg.name}</h4>
                      <div className="price">${pkg.price.toLocaleString()}</div>
                    </div>
                    <div className="description">{pkg.description}</div>
                    <div className="details">
                      <div>📅 Duration: {pkg.duration_days} days</div>
                      <div style={{ fontWeight: 'bold', marginTop: '15px', color: '#1877f2' }}>Facebook Features:</div>
                      {pkg.features.facebook_page && <div>✅ Facebook Page Creation</div>}
                      <div>🎯 Ad Targeting: {pkg.features.facebook_ads}</div>
                      <div>💵 FB Daily Budget: ${pkg.features.facebook_budget}</div>
                      <div>👥 FB Reach: {(pkg.features.estimated_fb_reach || 0).toLocaleString()}</div>
                      {pkg.features.custom_audiences && <div>✅ Custom Audiences</div>}
                      {pkg.features.lookalike_audiences && <div>✅ Lookalike Audiences</div>}
                      
                      <div style={{ fontWeight: 'bold', marginTop: '15px', color: '#4285f4' }}>AdSense Features:</div>
                      {pkg.features.adsense_setup && <div>✅ AdSense Setup</div>}
                      <div>📊 Ad Units: {pkg.features.adsense_ad_units}</div>
                      <div>💰 Est. AdSense Revenue: ${pkg.features.estimated_adsense_revenue}</div>
                      
                      <div style={{ fontWeight: 'bold', marginTop: '15px', color: '#7c3aed' }}>Platform Features:</div>
                      {pkg.features.unified_dashboard && <div>✅ Unified Dashboard</div>}
                      {pkg.features.monthly_reports && <div>✅ Monthly Reports</div>}
                      {pkg.features.weekly_reports && <div>✅ Weekly Reports</div>}
                      {pkg.features.daily_reports && <div>✅ Daily Reports</div>}
                      {pkg.features.dedicated_support && <div>✅ Dedicated Support</div>}
                      {pkg.features.dedicated_account_manager && <div>✅ Dedicated Account Manager</div>}
                      {pkg.features.roi_optimization && <div>✅ ROI Optimization</div>}
                      {pkg.features.competitor_analysis && <div>✅ Competitor Analysis</div>}
                    </div>
                    <button className="btn btn-combined">Select Package</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Hernandez Advertising Platform</h1>
        <p>Easy to deploy, easy to use advertising platform with official business validation</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="nav">
        <button
          className={currentView === 'home' ? 'active' : ''}
          onClick={() => setCurrentView('home')}
        >
          🏠 Home
        </button>
        <button
          className={currentView === 'businesses' ? 'active' : ''}
          onClick={() => setCurrentView('businesses')}
        >
          🏢 Businesses
        </button>
        <button
          className={currentView === 'advertising' ? 'active' : ''}
          onClick={() => setCurrentView('advertising')}
        >
          📢 Traditional Ads
        </button>
        <button
          className={currentView === 'facebook' ? 'active' : ''}
          onClick={() => setCurrentView('facebook')}
        >
          👍 Facebook Ads
        </button>
        <button
          className={currentView === 'adsense' ? 'active' : ''}
          onClick={() => setCurrentView('adsense')}
        >
          💰 Google AdSense
        </button>
        <button
          className={currentView === 'combined' ? 'active' : ''}
          onClick={() => setCurrentView('combined')}
        >
          🚀 Combined Packages
        </button>
      </div>

      {currentView === 'home' && renderHome()}
      {currentView === 'businesses' && renderBusinesses()}
      {currentView === 'advertising' && renderAdvertising()}
      {currentView === 'facebook' && renderFacebookPackages()}
      {currentView === 'adsense' && renderAdSensePackages()}
      {currentView === 'combined' && renderCombinedPackages()}
    </div>
  );
}

export default App;
