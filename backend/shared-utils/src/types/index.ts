// Core type definitions for AdSphere platform

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

export interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  status: CampaignStatus;
  budget: number;
  dailyBudget?: number;
  startDate: Date;
  endDate?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Platform {
  AMAZON = 'amazon',
  WALMART = 'walmart',
  EBAY = 'ebay',
  SHOPIFY = 'shopify'
}

export enum CampaignStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  DRAFT = 'draft'
}

export interface Ad {
  id: string;
  campaignId: string;
  name: string;
  type: AdType;
  content: AdContent;
  status: AdStatus;
  budget: number;
  performance: AdPerformance;
  createdAt: Date;
  updatedAt: Date;
}

export enum AdType {
  SPONSORED_PRODUCT = 'sponsored_product',
  SPONSORED_BRAND = 'sponsored_brand',
  SPONSORED_DISPLAY = 'sponsored_display',
  SEARCH_BRAND_AMPLIFIER = 'search_brand_amplifier'
}

export enum AdStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
  PENDING = 'pending'
}

export interface AdContent {
  title: string;
  description?: string;
  imageUrl?: string;
  landingUrl: string;
  keywords?: string[];
  targeting?: TargetingCriteria;
}

export interface TargetingCriteria {
  demographics?: {
    age?: string[];
    gender?: string[];
    income?: string[];
  };
  interests?: string[];
  behaviors?: string[];
  locations?: string[];
  devices?: string[];
}

export interface AdPerformance {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per mille
  roas: number; // Return on ad spend
  conversionRate: number;
  lastUpdated: Date;
}

export interface MarketplaceCredentials {
  id: string;
  userId: string;
  platform: Platform;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExportRequest {
  format: ExportFormat;
  data: any[];
  filename?: string;
  filters?: ExportFilters;
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json'
}

export interface ExportFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  platforms?: Platform[];
  campaigns?: string[];
  status?: CampaignStatus[];
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  CAMPAIGN_APPROVED = 'campaign_approved',
  CAMPAIGN_REJECTED = 'campaign_rejected',
  BUDGET_EXCEEDED = 'budget_exceeded',
  PERFORMANCE_ALERT = 'performance_alert',
  SYSTEM_UPDATE = 'system_update'
}

export interface AnalyticsData {
  totalSpend: number;
  totalRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageROAS: number;
  topPerformingCampaigns: Campaign[];
  topPerformingAds: Ad[];
  performanceByPlatform: Record<Platform, AdPerformance>;
  performanceOverTime: TimeSeriesData[];
}

export interface TimeSeriesData {
  date: Date;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}
