import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [businesses, setBusinesses] = useState([]);
  const [advertisingOptions, setAdvertisingOptions] = useState(null);
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
          <li>✅ <strong>Advertising Packages:</strong> Access radio stations, digital, and print advertising options</li>
          <li>✅ <strong>Real-Time Data:</strong> No mock data - all information is real and validated</li>
          <li>✅ <strong>Easy Deployment:</strong> Deploy with Docker in minutes</li>
        </ul>

        <h3>Getting Started:</h3>
        <ol style={{ fontSize: '1.1em' }}>
          <li>Navigate to <strong>Businesses</strong> to add your business information</li>
          <li>Validate your business with the Secretary of State</li>
          <li>Sync your information across all platforms</li>
          <li>Browse <strong>Advertising Options</strong> to grow your business</li>
        </ol>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f4ff', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Quick Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>{businesses.length}</div>
              <div style={{ color: '#666' }}>Total Businesses</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#667eea' }}>15+</div>
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
          📢 Advertising Options
        </button>
      </div>

      {currentView === 'home' && renderHome()}
      {currentView === 'businesses' && renderBusinesses()}
      {currentView === 'advertising' && renderAdvertising()}
    </div>
  );
}

export default App;
