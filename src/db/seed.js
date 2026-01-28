const { pool } = require('../db/database');

/**
 * Seed sample data for testing and demonstration
 */
async function seedData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding sample data...');

    // Insert sample advertising packages
    console.log('Adding advertising packages...');

    // Radio packages
    const radioPackages = [
      ['Morning Drive Time - Premium', 'radio', '30-second spots during morning commute (6-9 AM), high listener engagement', 500, 30, '{"spots_per_day": 2, "estimated_reach": 50000}', 'Local Radio Network', 'contact@localradio.com'],
      ['Afternoon Drive Time', 'radio', '30-second spots during afternoon commute (3-6 PM)', 450, 30, '{"spots_per_day": 2, "estimated_reach": 45000}', 'Local Radio Network', 'contact@localradio.com'],
      ['Weekend Package', 'radio', '30-second spots on weekends, great for retail and services', 300, 30, '{"spots_per_week": 6, "estimated_reach": 30000}', 'Local Radio Network', 'contact@localradio.com'],
      ['All-Day Rotation', 'radio', 'Spots rotated throughout the day for maximum exposure', 800, 30, '{"spots_per_day": 4, "estimated_reach": 75000}', 'Local Radio Network', 'contact@localradio.com'],
      ['Bundle - 3 Month Campaign', 'radio', 'Discounted 3-month campaign with morning and afternoon spots', 2400, 90, '{"spots_per_day": 3, "estimated_reach": 150000}', 'Local Radio Network', 'contact@localradio.com']
    ];

    let insertedCount = 0;
    for (const pkg of radioPackages) {
      try {
        const result = await client.query(
          `INSERT INTO advertising_packages 
           (package_name, package_type, description, price, duration_days, features, provider_name, provider_contact)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          pkg
        );
        if (result.rows.length > 0) {
          insertedCount++;
        }
      } catch (error) {
        console.error(`Failed to insert radio package "${pkg[0]}":`, error.message);
        throw error;
      }
    }
    console.log(`✅ Added ${insertedCount} radio packages (${radioPackages.length - insertedCount} already existed)`);

    // Digital packages
    const digitalPackages = [
      ['Social Media Boost', 'digital', 'Targeted ads on Facebook, Instagram, and LinkedIn', 350, 30, '{"estimated_impressions": 100000}', 'Online Advertising Network', 'digital@oabn.com'],
      ['Search Engine Marketing', 'digital', 'Google Ads campaign targeting local searches', 500, 30, '{"estimated_clicks": 1000}', 'Online Advertising Network', 'digital@oabn.com'],
      ['Display Advertising', 'digital', 'Banner ads on local news and business websites', 400, 30, '{"estimated_impressions": 75000}', 'Online Advertising Network', 'digital@oabn.com'],
      ['Video Advertising', 'digital', 'YouTube and streaming platform video ads', 600, 30, '{"estimated_views": 50000}', 'Online Advertising Network', 'digital@oabn.com']
    ];

    insertedCount = 0;
    for (const pkg of digitalPackages) {
      try {
        const result = await client.query(
          `INSERT INTO advertising_packages 
           (package_name, package_type, description, price, duration_days, features, provider_name, provider_contact)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          pkg
        );
        if (result.rows.length > 0) {
          insertedCount++;
        }
      } catch (error) {
        console.error(`Failed to insert digital package "${pkg[0]}":`, error.message);
        throw error;
      }
    }
    console.log(`✅ Added ${insertedCount} digital packages (${digitalPackages.length - insertedCount} already existed)`);

    // Print packages
    const printPackages = [
      ['Local Newspaper Full Page', 'print', 'Full page ad in weekly local newspaper', 750, 7, '{"circulation": 25000}', 'Local Print Media', 'print@localmedia.com'],
      ['Local Newspaper Half Page', 'print', 'Half page ad in weekly local newspaper', 400, 7, '{"circulation": 25000}', 'Local Print Media', 'print@localmedia.com'],
      ['Community Magazine', 'print', 'Featured ad in monthly community magazine', 600, 30, '{"circulation": 15000}', 'Local Print Media', 'print@localmedia.com'],
      ['Direct Mail Campaign', 'print', 'Postcard or flyer mailed to local addresses', 800, 1, '{"mail_count": 10000}', 'Local Print Media', 'print@localmedia.com']
    ];

    insertedCount = 0;
    for (const pkg of printPackages) {
      try {
        const result = await client.query(
          `INSERT INTO advertising_packages 
           (package_name, package_type, description, price, duration_days, features, provider_name, provider_contact)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT DO NOTHING
           RETURNING id`,
          pkg
        );
        if (result.rows.length > 0) {
          insertedCount++;
        }
      } catch (error) {
        console.error(`Failed to insert print package "${pkg[0]}":`, error.message);
        throw error;
      }
    }
    console.log(`✅ Added ${insertedCount} print packages (${printPackages.length - insertedCount} already existed)`);

    // Insert sample businesses (optional)
    console.log('Adding sample businesses...');

    const sampleBusinesses = [
      ['Demo Restaurant', 'C1234567', 'info@demorestaurant.com', '(555) 123-4567', '123 Main St', 'Los Angeles', 'CA', '90001', 'Restaurant', false],
      ['Demo Retail Store', 'C7654321', 'contact@demoretail.com', '(555) 987-6543', '456 Oak Ave', 'Los Angeles', 'CA', '90002', 'Retail', false],
      ['Demo Services LLC', 'C1122334', 'hello@demoservices.com', '(555) 456-7890', '789 Pine St', 'Los Angeles', 'CA', '90003', 'Services', false]
    ];

    insertedCount = 0;
    for (const business of sampleBusinesses) {
      try {
        const result = await client.query(
          `INSERT INTO businesses 
           (business_name, sos_registration_number, contact_email, contact_phone, address, city, state, zip_code, business_type, validated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (sos_registration_number) DO NOTHING
           RETURNING id`,
          business
        );
        if (result.rows.length > 0) {
          insertedCount++;
        }
      } catch (error) {
        console.error(`Failed to insert business "${business[0]}":`, error.message);
        throw error;
      }
    }
    console.log(`✅ Added ${insertedCount} sample businesses (${sampleBusinesses.length - insertedCount} already existed)`);

    await client.query('COMMIT');
    console.log('✅ Sample data seeded successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeding
seedData()
  .then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed data:', error);
    process.exit(1);
  });
