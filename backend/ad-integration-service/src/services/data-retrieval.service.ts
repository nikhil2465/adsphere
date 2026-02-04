import { AmazonAdsIntegration } from '../integrations/amazon-ads';
import { WalmartAdsIntegration } from '../integrations/walmart-ads';
import { Platform, Campaign, Ad, AdPerformance } from '@adsphere/shared-utils';
import logger from '@adsphere/shared-utils/src/utils/logger';

export interface DataRetrievalConfig {
  amazon?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    profileId: string;
    region: 'na' | 'eu' | 'fe';
  };
  walmart?: {
    clientId: string;
    clientSecret: string;
    channelId: string;
    environment: 'sandbox' | 'production';
  };
}

export class DataRetrievalService {
  private amazonIntegration?: AmazonAdsIntegration;
  private walmartIntegration?: WalmartAdsIntegration;

  constructor(config: DataRetrievalConfig) {
    if (config.amazon) {
      this.amazonIntegration = new AmazonAdsIntegration(config.amazon);
      logger.info('Amazon Ads integration initialized for data retrieval');
    }

    if (config.walmart) {
      this.walmartIntegration = new WalmartAdsIntegration(config.walmart);
      logger.info('Walmart Ads integration initialized for data retrieval');
    }
  }

  // Campaign Data Retrieval
  async getAllCampaigns(): Promise<Campaign[]> {
    const campaigns: Campaign[] = [];

    try {
      if (this.amazonIntegration) {
        const amazonCampaigns = await this.amazonIntegration.getCampaigns();
        campaigns.push(...amazonCampaigns);
        logger.info(`Retrieved ${amazonCampaigns.length} Amazon campaigns`);
      }

      if (this.walmartIntegration) {
        const walmartCampaigns = await this.walmartIntegration.getCampaigns();
        campaigns.push(...walmartCampaigns);
        logger.info(`Retrieved ${walmartCampaigns.length} Walmart campaigns`);
      }
    } catch (error) {
      logger.error('Error retrieving campaigns:', error);
      throw error;
    }

    return campaigns;
  }

  async getCampaignsByPlatform(platform: Platform): Promise<Campaign[]> {
    switch (platform) {
      case Platform.AMAZON:
        if (!this.amazonIntegration) {
          throw new Error('Amazon integration not configured');
        }
        return await this.amazonIntegration.getCampaigns();

      case Platform.WALMART:
        if (!this.walmartIntegration) {
          throw new Error('Walmart integration not configured');
        }
        return await this.walmartIntegration.getCampaigns();

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Ad Data Retrieval
  async getAllAds(campaignId?: string): Promise<Ad[]> {
    const ads: Ad[] = [];

    try {
      if (this.amazonIntegration) {
        const amazonAds = await this.amazonIntegration.getAds(campaignId);
        ads.push(...amazonAds);
        logger.info(`Retrieved ${amazonAds.length} Amazon ads`);
      }

      if (this.walmartIntegration) {
        const walmartAds = await this.walmartIntegration.getAds(campaignId);
        ads.push(...walmartAds);
        logger.info(`Retrieved ${walmartAds.length} Walmart ads`);
      }
    } catch (error) {
      logger.error('Error retrieving ads:', error);
      throw error;
    }

    return ads;
  }

  async getAdsByPlatform(platform: Platform, campaignId?: string): Promise<Ad[]> {
    switch (platform) {
      case Platform.AMAZON:
        if (!this.amazonIntegration) {
          throw new Error('Amazon integration not configured');
        }
        return await this.amazonIntegration.getAds(campaignId);

      case Platform.WALMART:
        if (!this.walmartIntegration) {
          throw new Error('Walmart integration not configured');
        }
        return await this.walmartIntegration.getAds(campaignId);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Performance Data Retrieval
  async getCampaignPerformance(
    platform: Platform,
    campaignId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdPerformance> {
    switch (platform) {
      case Platform.AMAZON:
        if (!this.amazonIntegration) {
          throw new Error('Amazon integration not configured');
        }
        return await this.amazonIntegration.getCampaignPerformance(campaignId, startDate, endDate);

      case Platform.WALMART:
        if (!this.walmartIntegration) {
          throw new Error('Walmart integration not configured');
        }
        return await this.walmartIntegration.getCampaignPerformance(campaignId, startDate, endDate);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async getAdPerformance(
    platform: Platform,
    adId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AdPerformance> {
    switch (platform) {
      case Platform.AMAZON:
        if (!this.amazonIntegration) {
          throw new Error('Amazon integration not configured');
        }
        return await this.amazonIntegration.getAdPerformance(adId, startDate, endDate);

      case Platform.WALMART:
        if (!this.walmartIntegration) {
          throw new Error('Walmart integration not configured');
        }
        return await this.walmartIntegration.getAdPerformance(adId, startDate, endDate);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Keyword and Targeting Data Retrieval
  async getKeywords(platform: Platform, campaignId: string): Promise<any[]> {
    switch (platform) {
      case Platform.AMAZON:
        if (!this.amazonIntegration) {
          throw new Error('Amazon integration not configured');
        }
        return await this.amazonIntegration.getKeywords(campaignId);

      case Platform.WALMART:
        if (!this.walmartIntegration) {
          throw new Error('Walmart integration not configured');
        }
        return await this.walmartIntegration.getKeywords(campaignId);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async getTargeting(platform: Platform, campaignId: string): Promise<any[]> {
    switch (platform) {
      case Platform.AMAZON:
        if (!this.amazonIntegration) {
          throw new Error('Amazon integration not configured');
        }
        return await this.amazonIntegration.getTargeting(campaignId);

      case Platform.WALMART:
        if (!this.walmartIntegration) {
          throw new Error('Walmart integration not configured');
        }
        return await this.walmartIntegration.getTargeting(campaignId);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Health Check
  async checkConnections(): Promise<{ amazon: boolean; walmart: boolean }> {
    const status = {
      amazon: false,
      walmart: false,
    };

    try {
      if (this.amazonIntegration) {
        await this.amazonIntegration.getCampaigns();
        status.amazon = true;
      }
    } catch (error) {
      logger.error('Amazon connection check failed:', error);
    }

    try {
      if (this.walmartIntegration) {
        await this.walmartIntegration.getCampaigns();
        status.walmart = true;
      }
    } catch (error) {
      logger.error('Walmart connection check failed:', error);
    }

    return status;
  }
}
