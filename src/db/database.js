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

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_businesses_sos_number ON businesses(sos_registration_number);
      CREATE INDEX IF NOT EXISTS idx_businesses_state ON businesses(state);
      CREATE INDEX IF NOT EXISTS idx_platform_sync_business ON platform_sync(business_id);
      CREATE INDEX IF NOT EXISTS idx_business_hours_business ON business_hours(business_id);
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
