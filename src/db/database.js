const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Database initialization script
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Businesses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        sos_registration_number VARCHAR(100) UNIQUE,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(2),
        zip_code VARCHAR(10),
        business_type VARCHAR(100),
        validated BOOLEAN DEFAULT FALSE,
        sos_last_validated TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Business hours table
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_hours (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Holidays table
    await client.query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        holiday_name VARCHAR(255),
        holiday_date DATE NOT NULL,
        is_closed BOOLEAN DEFAULT TRUE,
        special_hours_open TIME,
        special_hours_close TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Platform sync table
    await client.query(`
      CREATE TABLE IF NOT EXISTS platform_sync (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        platform_name VARCHAR(100) NOT NULL, -- 'google', 'yellowpages', etc.
        platform_business_id VARCHAR(255),
        sync_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'synced', 'failed'
        last_synced TIMESTAMP,
        sync_errors TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(business_id, platform_name)
      )
    `);

    // Advertising packages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS advertising_packages (
        id SERIAL PRIMARY KEY,
        package_name VARCHAR(255) NOT NULL,
        package_type VARCHAR(100) NOT NULL, -- 'radio', 'digital', 'print', etc.
        description TEXT,
        price DECIMAL(10, 2),
        duration_days INTEGER,
        features JSONB,
        provider_name VARCHAR(255),
        provider_contact TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Business advertising subscriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS business_advertising (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        package_id INTEGER REFERENCES advertising_packages(id),
        start_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Facebook Pages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS facebook_pages (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        facebook_page_id VARCHAR(255) UNIQUE NOT NULL,
        page_name VARCHAR(255) NOT NULL,
        page_access_token TEXT,
        page_url TEXT,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Facebook Campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS facebook_campaigns (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        facebook_page_id INTEGER REFERENCES facebook_pages(id),
        campaign_id VARCHAR(255) UNIQUE NOT NULL,
        campaign_name VARCHAR(255) NOT NULL,
        objective VARCHAR(100),
        status VARCHAR(50) DEFAULT 'paused',
        budget_amount DECIMAL(10, 2),
        budget_type VARCHAR(50),
        targeting JSONB,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        impressions INTEGER DEFAULT 0,
        reach INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        spend DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Google AdSense Accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS google_adsense_accounts (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
        adsense_account_id VARCHAR(255) UNIQUE,
        publisher_id VARCHAR(255),
        website_url TEXT NOT NULL,
        account_status VARCHAR(50) DEFAULT 'pending',
        approval_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Google AdSense Ad Units table
    await client.query(`
      CREATE TABLE IF NOT EXISTS google_adsense_units (
        id SERIAL PRIMARY KEY,
        adsense_account_id INTEGER REFERENCES google_adsense_accounts(id) ON DELETE CASCADE,
        ad_unit_id VARCHAR(255) UNIQUE NOT NULL,
        ad_unit_name VARCHAR(255) NOT NULL,
        ad_type VARCHAR(100),
        ad_size VARCHAR(50),
        ad_code TEXT,
        status VARCHAR(50) DEFAULT 'active',
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        earnings DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_businesses_sos_number ON businesses(sos_registration_number);
      CREATE INDEX IF NOT EXISTS idx_businesses_state ON businesses(state);
      CREATE INDEX IF NOT EXISTS idx_platform_sync_business ON platform_sync(business_id);
      CREATE INDEX IF NOT EXISTS idx_business_hours_business ON business_hours(business_id);
      CREATE INDEX IF NOT EXISTS idx_facebook_pages_business ON facebook_pages(business_id);
      CREATE INDEX IF NOT EXISTS idx_facebook_campaigns_business ON facebook_campaigns(business_id);
      CREATE INDEX IF NOT EXISTS idx_adsense_accounts_business ON google_adsense_accounts(business_id);
      CREATE INDEX IF NOT EXISTS idx_adsense_units_account ON google_adsense_units(adsense_account_id);
    `);

    await client.query('COMMIT');
    console.log('Database initialized successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDatabase };
