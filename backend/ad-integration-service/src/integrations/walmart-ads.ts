import axios, { AxiosInstance } from 'axios';
import { Platform, Ad, Campaign, AdPerformance } from '@adsphere/shared-utils';
import logger from '@adsphere/shared-utils/src/utils/logger';

export interface WalmartAdsConfig {
  clientId: string;
  clientSecret: string;
  channelId: string;
  environment: 'sandbox' | 'production';
}

export class WalmartAdsIntegration {
  private client: AxiosInstance;
  private config: WalmartAdsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: WalmartAdsConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: this.getApiBaseUrl(),
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private getApiBaseUrl(): string {
    const urls = {
      sandbox: 'https://sandbox.api.walmart.com/v3',
      production: 'https://api.walmart.com/v3',
    };
    return urls[this.config.environment];
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['WM_SEC.KEY_VERSION'] = '1';
        config.headers['WM_CONSUMER.ID'] = this.config.clientId;
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
      const response = await axios.post('https://marketplace.walmartapis.com/v3/token', {
        grant_type: 'client_credentials',
      }, {
        headers: {
          'WM_SVC.NAME': 'Walmart Marketplace',
          'WM_QOS.CORRELATION_ID': this.generateCorrelationId(),
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);
      
      logger.info('Walmart Ads access token refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh Walmart Ads access token:', error);
      throw new Error('Failed to authenticate with Walmart Ads API');
    }
  }

  private generateCorrelationId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2);
  }

  // Campaign Management
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const response = await this.client.get('/campaigns', {
        params: {
          channelType: 'SPONSORED_PRODUCTS',
        },
      });

      return response.data.elements?.map((campaign: any) => ({
        id: campaign.campaignId,
        name: campaign.name,
        platform: Platform.WALMART,
        status: this.mapWalmartStatus(campaign.status),
        budget: campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        userId: '', // Will be set by the calling service
        createdAt: new Date(campaign.createdDate),
        updatedAt: new Date(campaign.lastModifiedDate),
      })) || [];
    } catch (error) {
      logger.error('Failed to fetch Walmart campaigns:', error);
      throw error;
    }
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    try {
      const walmartCampaignData = {
        name: campaignData.name,
        channelType: 'SPONSORED_PRODUCTS',
        status: 'ENABLED',
        budget: campaignData.budget,
        dailyBudget: campaignData.dailyBudget,
        startDate: campaignData.startDate?.toISOString(),
        endDate: campaignData.endDate?.toISOString(),
        targetingType: 'AUTO',
      };

      const response = await this.client.post('/campaigns', walmartCampaignData);

      const campaign = response.data;
      return {
        id: campaign.campaignId,
        name: campaign.name,
        platform: Platform.WALMART,
        status: this.mapWalmartStatus(campaign.status),
        budget: campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        userId: campaignData.userId || '',
        createdAt: new Date(campaign.createdDate),
        updatedAt: new Date(campaign.lastModifiedDate),
      };
    } catch (error) {
      logger.error('Failed to create Walmart campaign:', error);
      throw error;
    }
  }

  async updateCampaign(campaignId: string, updateData: Partial<Campaign>): Promise<Campaign> {
    try {
      const walmartUpdateData: any = {};
      
      if (updateData.name) walmartUpdateData.name = updateData.name;
      if (updateData.dailyBudget) walmartUpdateData.dailyBudget = updateData.dailyBudget;
      if (updateData.status) walmartUpdateData.status = this.mapStatusToWalmart(updateData.status);
      if (updateData.endDate) walmartUpdateData.endDate = updateData.endDate.toISOString();

      const response = await this.client.put(`/campaigns/${campaignId}`, walmartUpdateData);

      const campaign = response.data;
      return {
        id: campaign.campaignId,
        name: campaign.name,
        platform: Platform.WALMART,
        status: this.mapWalmartStatus(campaign.status),
        budget: campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        userId: updateData.userId || '',
        createdAt: new Date(campaign.createdDate),
        updatedAt: new Date(campaign.lastModifiedDate),
      };
    } catch (error) {
      logger.error('Failed to update Walmart campaign:', error);
      throw error;
    }
  }

  // Ad Management
  async getAds(campaignId?: string): Promise<Ad[]> {
    try {
      const params: any = {
        channelType: 'SPONSORED_PRODUCTS',
      };
      
      if (campaignId) {
        params.campaignIdFilter = campaignId;
      }

      const response = await this.client.get('/ad-groups', { params });

      const ads = [];
      for (const adGroup of response.data.elements || []) {
        const adGroupAds = await this.getAdGroupAds(adGroup.adGroupId);
        ads.push(...adGroupAds);
      }

      return ads;
    } catch (error) {
      logger.error('Failed to fetch Walmart ads:', error);
      throw error;
    }
  }

  private async getAdGroupAds(adGroupId: string): Promise<Ad[]> {
    try {
      const response = await this.client.get(`/ad-groups/${adGroupId}/ads`);

      return response.data.elements?.map((ad: any) => ({
        id: ad.adId,
        campaignId: ad.campaignId,
        name: ad.name,
        type: this.mapWalmartAdType(ad.adType),
        content: {
          title: ad.name,
          landingUrl: ad.landingPageUrl,
          imageUrl: ad.creative?.imageUrl,
        },
        status: this.mapWalmartStatus(ad.status),
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
        createdAt: new Date(ad.createdDate),
        updatedAt: new Date(ad.lastModifiedDate),
      })) || [];
    } catch (error) {
      logger.error('Failed to fetch Walmart ad group ads:', error);
      throw error;
    }
  }

  // Performance Data
  async getCampaignPerformance(campaignId: string, startDate: Date, endDate: Date): Promise<AdPerformance> {
    try {
      const response = await this.client.get(`/campaigns/${campaignId}/performance`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          granularity: 'DAILY',
        },
      });

      const data = response.data.elements?.[0] || {};
      return {
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        conversions: data.conversions || 0,
        spend: data.spend || 0,
        revenue: data.sales || 0,
        ctr: data.clicks && data.impressions ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks ? data.spend / data.clicks : 0,
        cpm: data.impressions ? (data.spend / data.impressions) * 1000 : 0,
        roas: data.spend ? data.sales / data.spend : 0,
        conversionRate: data.clicks ? (data.conversions / data.clicks) * 100 : 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch Walmart campaign performance:', error);
      throw error;
    }
  }

  async getAdPerformance(adId: string, startDate: Date, endDate: Date): Promise<AdPerformance> {
    try {
      const response = await this.client.get(`/ads/${adId}/performance`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          granularity: 'DAILY',
        },
      });

      const data = response.data.elements?.[0] || {};
      return {
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        conversions: data.conversions || 0,
        spend: data.spend || 0,
        revenue: data.sales || 0,
        ctr: data.clicks && data.impressions ? (data.clicks / data.impressions) * 100 : 0,
        cpc: data.clicks ? data.spend / data.clicks : 0,
        cpm: data.impressions ? (data.spend / data.impressions) * 1000 : 0,
        roas: data.spend ? data.sales / data.spend : 0,
        conversionRate: data.clicks ? (data.conversions / data.clicks) * 100 : 0,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch Walmart ad performance:', error);
      throw error;
    }
  }

  // Helper methods
  private mapWalmartStatus(status: string): 'active' | 'paused' | 'archived' | 'draft' {
    switch (status.toUpperCase()) {
      case 'ENABLED':
        return 'active';
      case 'PAUSED':
        return 'paused';
      case 'ARCHIVED':
        return 'archived';
      default:
        return 'draft';
    }
  }

  private mapStatusToWalmart(status: 'active' | 'paused' | 'archived' | 'draft'): string {
    switch (status) {
      case 'active':
        return 'ENABLED';
      case 'paused':
        return 'PAUSED';
      case 'archived':
        return 'ARCHIVED';
      default:
        return 'PAUSED';
    }
  }

  private mapWalmartAdType(type: string): string {
    switch (type.toUpperCase()) {
      case 'SPONSORED_PRODUCT':
        return 'Sponsored Product';
      case 'SPONSORED_BRAND':
        return 'Sponsored Brand';
      case 'SEARCH_BRAND_AMPLIFIER':
        return 'Search Brand Amplifier';
      default:
        return 'Sponsored Product';
    }
  }

  // Keyword Management
  async getKeywords(campaignId: string): Promise<any[]> {
    try {
      const response = await this.client.get('/keywords', {
        params: {
          campaignIdFilter: campaignId,
        },
      });

      return response.data.elements?.map((keyword: any) => ({
        id: keyword.keywordId,
        campaignId: keyword.campaignId,
        adGroupId: keyword.adGroupId,
        keywordText: keyword.keywordText,
        matchType: keyword.matchType,
        status: this.mapWalmartStatus(keyword.status),
        bid: keyword.bid,
        performance: {
          impressions: keyword.impressions || 0,
          clicks: keyword.clicks || 0,
          spend: keyword.spend || 0,
          conversions: keyword.conversions || 0,
        },
      })) || [];
    } catch (error) {
      logger.error('Failed to fetch Walmart keywords:', error);
      throw error;
    }
  }

  // Targeting Management
  async getTargeting(campaignId: string): Promise<any[]> {
    try {
      const response = await this.client.get('/targeting', {
        params: {
          campaignIdFilter: campaignId,
        },
      });

      return response.data.elements?.map((target: any) => ({
        id: target.targetId,
        campaignId: target.campaignId,
        adGroupId: target.adGroupId,
        expression: target.expression,
        expressionType: target.expressionType,
        status: this.mapWalmartStatus(target.status),
        bid: target.bid,
        performance: {
          impressions: target.impressions || 0,
          clicks: target.clicks || 0,
          spend: target.spend || 0,
          conversions: target.conversions || 0,
        },
      })) || [];
    } catch (error) {
      logger.error('Failed to fetch Walmart targeting:', error);
      throw error;
    }
  }

  // Search Brand Amplifier (Walmart specific)
  async getSBACampaigns(): Promise<Campaign[]> {
    try {
      const response = await this.client.get('/sba-campaigns');

      return response.data.elements?.map((campaign: any) => ({
        id: campaign.campaignId,
        name: campaign.name,
        platform: Platform.WALMART,
        status: this.mapWalmartStatus(campaign.status),
        budget: campaign.budget,
        dailyBudget: campaign.dailyBudget,
        startDate: new Date(campaign.startDate),
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        userId: '',
        createdAt: new Date(campaign.createdDate),
        updatedAt: new Date(campaign.lastModifiedDate),
      })) || [];
    } catch (error) {
      logger.error('Failed to fetch Walmart SBA campaigns:', error);
      throw error;
    }
  }

  // Budget Management
  async updateBudget(campaignId: string, budget: number): Promise<void> {
    try {
      await this.client.put(`/campaigns/${campaignId}/budget`, {
        budget: budget,
      });
      
      logger.info(`Updated budget for Walmart campaign ${campaignId} to ${budget}`);
    } catch (error) {
      logger.error('Failed to update Walmart campaign budget:', error);
      throw error;
    }
  }

  // Bid Management
  async updateKeywordBid(keywordId: string, bid: number): Promise<void> {
    try {
      await this.client.put(`/keywords/${keywordId}/bid`, {
        bid: bid,
      });
      
      logger.info(`Updated bid for Walmart keyword ${keywordId} to ${bid}`);
    } catch (error) {
      logger.error('Failed to update Walmart keyword bid:', error);
      throw error;
    }
  }
}
