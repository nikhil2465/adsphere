import { db } from './connection';
import logger from '../utils/logger';

const migrations = [
  // Users table
  `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      company VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Marketplace credentials table
  `
    CREATE TABLE IF NOT EXISTS marketplace_credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      client_id VARCHAR(255) NOT NULL,
      client_secret VARCHAR(255) NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform)
    );
  `,

  // Campaigns table
  `
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      platform VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'draft',
      budget DECIMAL(10,2) NOT NULL,
      daily_budget DECIMAL(10,2),
      start_date DATE NOT NULL,
      end_date DATE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      marketplace_campaign_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Ads table
  `
    CREATE TABLE IF NOT EXISTS ads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      landing_url VARCHAR(500) NOT NULL,
      keywords TEXT[],
      status VARCHAR(20) DEFAULT 'draft',
      budget DECIMAL(10,2) NOT NULL,
      marketplace_ad_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Ad performance table
  `
    CREATE TABLE IF NOT EXISTS ad_performance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      spend DECIMAL(10,2) DEFAULT 0,
      revenue DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ad_id, date)
    );
  `,

  // Notifications table
  `
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSONB,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Indexes for better performance
  `
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
    CREATE INDEX IF NOT EXISTS idx_ads_campaign_id ON ads(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_ad_performance_ad_id ON ad_performance(ad_id);
    CREATE INDEX IF NOT EXISTS idx_ad_performance_date ON ad_performance(date);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_marketplace_credentials_user_id ON marketplace_credentials(user_id);
  `,
];

export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');
    
    for (let i = 0; i < migrations.length; i++) {
      await db.query(migrations[i]);
      logger.info(`Migration ${i + 1}/${migrations.length} completed`);
    }
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}
