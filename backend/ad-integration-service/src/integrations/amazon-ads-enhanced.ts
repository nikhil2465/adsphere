import axios, { AxiosInstance } from 'axios';
import { Platform, Campaign, AdPerformance } from '@adsphere/shared-utils';
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
  private cache: Map<string, any> = new Map();
  private rateLimiter: Map<string, number[]> = new Map();

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
          // Token expired, refresh and retry
          await this.refreshToken();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://api.amazon.com/auth/o2/token', 
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
      
      logger.info('Amazon access token refreshed successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to refresh Amazon token:', error);
      throw new Error('Amazon authentication failed');
    }
  }

  private async refreshToken(): Promise<void> {
    // Force token refresh
    this.accessToken = null;
    this.tokenExpiry = null;
    await this.getAccessToken();
  }

  async getCampaigns(profileId?: string): Promise<Campaign[]> {
    const cacheKey = `amazon-campaigns-${profileId || 'default'}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minutes
        return cached.data;
      }
    }
    
    // Rate limiting check
    if (!this.checkRateLimit('amazon')) {
      throw new Error('Amazon API rate limit exceeded');
    }
    
    try {
      const response = await this.client.get('/v2/sp/campaigns', {
        params: {
          profileId: profileId || this.config.profileId,
          stateFilter: 'ENABLED,PAUSED',
          count: 100
        }
      });
      
      const campaigns = this.transformAmazonCampaigns(response.data);
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: campaigns,
        timestamp: Date.now()
      });
      
      logger.info(`Fetched ${campaigns.length} Amazon campaigns`);
      return campaigns;
    } catch (error) {
      logger.error('Amazon campaigns fetch failed:', error);
      throw this.handleApiError(error);
    }
  }

  async getPerformanceData(campaignId: string, startDate: Date, endDate: Date): Promise<AdPerformance[]> {
    const cacheKey = `amazon-performance-${campaignId}-${startDate.toISOString()}-${endDate.toISOString()}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }
    
    try {
      const response = await this.client.get('/v2/sp/campaigns/summary', {
        params: {
          campaignId,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          granularity: 'DAILY'
        }
      });
      
      const performance = this.transformAmazonPerformance(response.data);
      
      this.cache.set(cacheKey, {
        data: performance,
        timestamp: Date.now()
      });
      
      logger.info(`Fetched Amazon performance data for campaign ${campaignId}`);
      return performance;
    } catch (error) {
      logger.error('Amazon performance fetch failed:', error);
      throw this.handleApiError(error);
    }
  }

  private transformAmazonCampaigns(apiData: any[]): Campaign[] {
    return apiData.map(campaign => ({
      campaignId: campaign.campaignId,
      name: campaign.name,
      type: campaign.targetingType,
      status: campaign.state,
      dailyBudget: campaign.dailyBudget,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      platform: 'amazon',
      metrics: {
        impressions: campaign.impressions || 0,
        clicks: campaign.clicks || 0,
        spend: campaign.cost || 0,
        sales: campaign.sales || 0,
        orders: campaign.orders || 0,
        acos: campaign.acos || 0,
        roas: campaign.roas || 0
      }
    }));
  }

  private transformAmazonPerformance(apiData: any): AdPerformance[] {
    return apiData.map(day => ({
      date: day.date,
      impressions: day.impressions || 0,
      clicks: day.clicks || 0,
      spend: day.spend || 0,
      sales: day.sales || 0,
      orders: day.orders || 0,
      roas: day.roas || 0
    }));
  }

  private checkRateLimit(platform: string): boolean {
    const now = Date.now();
    const requests = this.rateLimiter.get(platform) || [];
    const recentRequests = requests.filter(time => now - time < 60000); // Last minute
    
    if (recentRequests.length >= 100) { // Amazon rate limit
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimiter.set(platform, recentRequests);
    return true;
  }

  private handleApiError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 401:
          return new Error('Amazon authentication failed');
        case 403:
          return new Error('Amazon access forbidden');
        case 429:
          return new Error('Amazon rate limit exceeded');
        case 500:
          return new Error('Amazon server error');
        default:
          return new Error(`Amazon API error: ${message}`);
      }
    }
    
    return new Error('Amazon API connection failed');
  }
}
