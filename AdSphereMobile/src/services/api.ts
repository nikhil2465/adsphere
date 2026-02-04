import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8003/api/data';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for our data
export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  sales?: number;
  orders?: number;
  conversions?: number;
  acos?: number;
  roas?: number;
}

export interface Keyword {
  keywordId: string;
  keywordText: string;
  matchType: string;
  bid: number;
  metrics: CampaignMetrics;
}

export interface AdGroup {
  adGroupId: string;
  name: string;
  defaultBid?: number;
  bid?: number;
  status: string;
  keywords: Keyword[];
}

export interface Campaign {
  campaignId: string;
  name: string;
  type: string;
  status: string;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  metrics: CampaignMetrics;
  adGroups: AdGroup[];
}

export interface HealthResponse {
  success: boolean;
  data: {
    amazon: boolean;
    walmart: boolean;
    mockData: boolean;
  };
  message: string;
  timestamp: string;
}

export interface CampaignsResponse {
  success: boolean;
  data: Campaign[];
  count: number;
  platform: string;
  source?: string;
  sources?: string[];
  timestamp: string;
}

// API Functions
export const apiService = {
  // Health check
  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Get all campaigns (both platforms)
  async getAllCampaigns(): Promise<CampaignsResponse> {
    try {
      const response = await api.get('/campaigns');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all campaigns:', error);
      throw error;
    }
  },

  // Get Amazon campaigns
  async getAmazonCampaigns(): Promise<CampaignsResponse> {
    try {
      const response = await api.get('/campaigns/amazon');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Amazon campaigns:', error);
      throw error;
    }
  },

  // Get Walmart campaigns
  async getWalmartCampaigns(): Promise<CampaignsResponse> {
    try {
      const response = await api.get('/campaigns/walmart');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Walmart campaigns:', error);
      throw error;
    }
  },
};

export default apiService;
