import axios, { AxiosInstance } from 'axios';
import { Platform, Ad, Campaign, AdPerformance } from '@adsphere/shared-utils';
import logger from '@adsphere/shared-utils/src/utils/logger';

export interface AmazonAdsConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  profileId: string;
  region: 'na' | 'eu' | 'fe';
}

export class AmazonAdsIntegration {
  private client: AxiosInstance;
  private config: AmazonAdsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: AmazonAdsConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: this.getApiBaseUrl(),
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private getApiBaseUrl(): string {
    const regionUrls = {
      na: 'https://advertising-api.amazon.com',
      eu: 'https://advertising-api-eu.amazon.com',
      fe: 'https://advertising-api-fe.amazon.com',
    };
    return regionUrls[this.config.region];
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['Amazon-Advertising-API-ClientId'] = this.config.clientId;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshAccessToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    await this.refreshAccessToken();
    return this.accessToken!;
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post('https://api.amazon.com/auth/o2/token', {
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
      
      logger.info('Amazon Ads access token refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh Amazon Ads access token:', error);
      throw new Error('Failed to authenticate with Amazon Ads API');
    }
  }

  // Campaign Management
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await this.client.get('/v2/sp/campaigns', {
        params: {
          profileId: this.config.profileId,
        },
      });

      return response.data.map((campaign: any) => ({
        id: campaign.campaignId,
        name: campaign.name,
        platform: Platform.AMAZON,
        status: this.mapAmazonStatus(campaign.state),
        budget: campaign.dailyBudget || campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        userId: '', // Will be set by the calling service
        createdAt: new Date(campaign.creationDate),
        updatedAt: new Date(campaign.lastUpdatedDate),
      }));
    } catch (error) {
      logger.error('Failed to fetch Amazon campaigns:', error);
      throw error;
    }
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    try {
      const amazonCampaignData = {
        name: campaignData.name,
        targetingType: 'auto',
        state: 'enabled',
        dailyBudget: campaignData.dailyBudget || campaignData.budget,
        startDate: campaignData.startDate?.toISOString().split('T')[0],
        endDate: campaignData.endDate?.toISOString().split('T')[0],
      };

      const response = await this.client.post('/v2/sp/campaigns', amazonCampaignData, {
        params: {
          profileId: this.config.profileId,
        },
      });

      const campaign = response.data;
      return {
        id: campaign.campaignId,
        name: campaign.name,
        platform: Platform.AMAZON,
        status: this.mapAmazonStatus(campaign.state),
        budget: campaign.dailyBudget || campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        userId: campaignData.userId || '',
        createdAt: new Date(campaign.creationDate),
        updatedAt: new Date(campaign.lastUpdatedDate),
      };
    } catch (error) {
      logger.error('Failed to create Amazon campaign:', error);
      throw error;
    }
  }

  async updateCampaign(campaignId: string, updateData: Partial<Campaign>): Promise<Campaign> {
    try {
      const amazonUpdateData: any = {};
      
      if (updateData.name) amazonUpdateData.name = updateData.name;
      if (updateData.dailyBudget) amazonUpdateData.dailyBudget = updateData.dailyBudget;
      if (updateData.status) amazonUpdateData.state = this.mapStatusToAmazon(updateData.status);
      if (updateData.endDate) amazonUpdateData.endDate = updateData.endDate.toISOString().split('T')[0];

      const response = await this.client.put(`/v2/sp/campaigns/${campaignId}`, amazonUpdateData, {
        params: {
          profileId: this.config.profileId,
        },
      });

      const campaign = response.data;
      return {
        id: campaign.campaignId,
        name: campaign.name,
        platform: Platform.AMAZON,
        status: this.mapAmazonStatus(campaign.state),
        budget: campaign.dailyBudget || campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        userId: updateData.userId || '',
        createdAt: new Date(campaign.creationDate),
        updatedAt: new Date(campaign.lastUpdatedDate),
      };
    } catch (error) {
      logger.error('Failed to update Amazon campaign:', error);
      throw error;
    }
  }

  // Ad Management
  async getAds(campaignId?: string): Promise<Ad[]> {
    try {
      const params: any = {
        profileId: this.config.profileId,
      };
      
      if (campaignId) {
        params.campaignIdFilter = campaignId;
      }

      const response = await this.client.get('/v2/sp/adGroups', { params });

      const ads = [];
      for (const adGroup of response.data) {
        const adGroupAds = await this.getAdGroupAds(adGroup.adGroupId);
        ads.push(...adGroupAds);
      }

      return ads;
    } catch (error) {
      logger.error('Failed to fetch Amazon ads:', error);
      throw error;
    }
  }

  private async getAdGroupAds(adGroupId: string): Promise<Ad[]> {
    try {
      const response = await this.client.get(`/v2/sp/adGroups/${adGroupId}/ads`, {
        params: {
          profileId: this.config.profileId,
        },
      });

      return response.data.map((ad: any) => ({
        id: ad.adId,
        campaignId: ad.campaignId,
        name: ad.name,
        type: this.mapAmazonAdType(ad.creativeType),
        content: {
          title: ad.name,
          landingUrl: ad.landingPageUrl,
          imageUrl: ad.creative?.imageUrl,
        },
        status: this.mapAmazonStatus(ad.state),
        budget: 0, // Budget is at campaign level
        performance: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0,
          ctr: 0,
          cpc: 0,
          cpm: 0,
          roas: 0,
          conversionRate: 0,
          lastUpdated: new Date(),
        },
        createdAt: new Date(ad.creationDate),
        updatedAt: new Date(ad.lastUpdatedDate),
      }));
    } catch (error) {
      logger.error('Failed to fetch Amazon ad group ads:', error);
      throw error;
    }
  }

  // Performance Data
  async getCampaignPerformance(campaignId: string, startDate: Date, endDate: Date): Promise<AdPerformance> {
    try {
      const response = await this.client.get('/v2/sp/campaigns/summary', {
        params: {
          profileId: this.config.profileId,
          campaignIdFilter: campaignId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });

      const data = response.data;
      return {
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        conversions: data.attributedConversions30d || 0,
        spend: data.cost || 0,
        revenue: data.attributedSales30d || 0,
        ctr: data.clicks && data.impressions ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks ? data.cost / data.clicks : 0,
        cpm: data.impressions ? (data.cost / data.impressions) * 1000 : 0,
        roas: data.cost ? data.attributedSales30d / data.cost : 0,
        conversionRate: data.clicks ? (data.attributedConversions30d / data.clicks) * 100 : 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch Amazon campaign performance:', error);
      throw error;
    }
  }

  async getAdPerformance(adId: string, startDate: Date, endDate: Date): Promise<AdPerformance> {
    try {
      const response = await this.client.get('/v2/sp/ads/summary', {
        params: {
          profileId: this.config.profileId,
          adIdFilter: adId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });

      const data = response.data;
      return {
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        conversions: data.attributedConversions30d || 0,
        spend: data.cost || 0,
        revenue: data.attributedSales30d || 0,
        ctr: data.clicks && data.impressions ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks ? data.cost / data.clicks : 0,
        cpm: data.impressions ? (data.cost / data.impressions) * 1000 : 0,
        roas: data.cost ? data.attributedSales30d / data.cost : 0,
        conversionRate: data.clicks ? (data.attributedConversions30d / data.clicks) * 100 : 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch Amazon ad performance:', error);
      throw error;
    }
  }

  // Helper methods
  private mapAmazonStatus(status: string): 'active' | 'paused' | 'archived' | 'draft' {
    switch (status.toLowerCase()) {
      case 'enabled':
        return 'active';
      case 'paused':
        return 'paused';
      case 'archived':
        return 'archived';
      default:
        return 'draft';
    }
  }

  private mapStatusToAmazon(status: 'active' | 'paused' | 'archived' | 'draft'): string {
    switch (status) {
      case 'active':
        return 'enabled';
      case 'paused':
        return 'paused';
      case 'archived':
        return 'archived';
      default:
        return 'paused';
    }
  }

  private mapAmazonAdType(type: string): string {
    switch (type.toLowerCase()) {
      case 'sp_product_ad':
        return 'Sponsored Product';
      case 'sp_brand_ad':
        return 'Sponsored Brand';
      case 'sp_display_ad':
        return 'Sponsored Display';
      default:
        return 'Sponsored Product';
    }
  }

  // Keyword Management
  async getKeywords(campaignId: string): Promise<any[]> {
    try {
      const response = await this.client.get('/v2/sp/keywords', {
        params: {
          profileId: this.config.profileId,
          campaignIdFilter: campaignId,
        },
      });

      return response.data.map((keyword: any) => ({
        id: keyword.keywordId,
        campaignId: keyword.campaignId,
        adGroupId: keyword.adGroupId,
        keywordText: keyword.keywordText,
        matchType: keyword.matchType,
        status: this.mapAmazonStatus(keyword.state),
        bid: keyword.bid,
        performance: {
          impressions: keyword.impressions || 0,
          clicks: keyword.clicks || 0,
          spend: keyword.cost || 0,
          conversions: keyword.attributedConversions30d || 0,
        },
      }));
    } catch (error) {
      logger.error('Failed to fetch Amazon keywords:', error);
      throw error;
    }
  }

  // Targeting Management
  async getTargeting(campaignId: string): Promise<any[]> {
    try {
      const response = await this.client.get('/v2/sp/targets', {
        params: {
          profileId: this.config.profileId,
          campaignIdFilter: campaignId,
        },
      });

      return response.data.map((target: any) => ({
        id: target.targetId,
        campaignId: target.campaignId,
        adGroupId: target.adGroupId,
        expression: target.expression,
        expressionType: target.expressionType,
        status: this.mapAmazonStatus(target.state),
        bid: target.bid,
        performance: {
          impressions: target.impressions || 0,
          clicks: target.clicks || 0,
          spend: target.cost || 0,
          conversions: target.attributedConversions30d || 0,
        },
      }));
    } catch (error) {
      logger.error('Failed to fetch Amazon targeting:', error);
      throw error;
    }
  }
}
