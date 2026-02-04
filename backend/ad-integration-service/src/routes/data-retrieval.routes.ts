import express from 'express';
import { DataRetrievalService, DataRetrievalConfig } from '../services/data-retrieval.service';
import { Platform } from '@adsphere/shared-utils';
import logger from '@adsphere/shared-utils/src/utils/logger';

const router = express.Router();

// Initialize data retrieval service with configuration
const getDataRetrievalService = (): DataRetrievalService => {
  const config: DataRetrievalConfig = {};

  // Amazon configuration
  if (process.env.AMAZON_CLIENT_ID && process.env.AMAZON_CLIENT_SECRET) {
    config.amazon = {
      clientId: process.env.AMAZON_CLIENT_ID,
      clientSecret: process.env.AMAZON_CLIENT_SECRET,
      refreshToken: process.env.AMAZON_REFRESH_TOKEN || '',
      profileId: process.env.AMAZON_PROFILE_ID || '',
      region: (process.env.AMAZON_REGION as 'na' | 'eu' | 'fe') || 'na',
    };
  }

  // Walmart configuration
  if (process.env.WALMART_CLIENT_ID && process.env.WALMART_CLIENT_SECRET) {
    config.walmart = {
      clientId: process.env.WALMART_CLIENT_ID,
      clientSecret: process.env.WALMART_CLIENT_SECRET,
      channelId: process.env.WALMART_CHANNEL_ID || '',
      environment: (process.env.WALMART_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };
  }

  return new DataRetrievalService(config);
};

// Middleware for error handling
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         platform:
 *           type: string
 *           enum: [AMAZON, WALMART]
 *         status:
 *           type: string
 *           enum: [active, paused, archived, draft]
 *         budget:
 *           type: number
 *         dailyBudget:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *     
 *     Ad:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         campaignId:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, paused, archived, draft]
 *         content:
 *           type: object
 *         performance:
 *           type: object
 *     
 *     AdPerformance:
 *       type: object
 *       properties:
 *         impressions:
 *           type: number
 *         clicks:
 *           type: number
 *         conversions:
 *           type: number
 *         spend:
 *           type: number
 *         revenue:
 *           type: number
 *         ctr:
 *           type: number
 *         cpc:
 *           type: number
 *         cpm:
 *           type: number
 *         roas:
 *           type: number
 *         conversionRate:
 *           type: number
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/data/campaigns:
 *   get:
 *     summary: Get all campaigns from all configured platforms
 *     tags: [Data Retrieval]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of campaigns from all platforms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/campaigns', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const dataService = getDataRetrievalService();
    const campaigns = await dataService.getAllCampaigns();
    
    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    logger.error('Error fetching all campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve campaigns',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

/**
 * @swagger
 * /api/data/campaigns/{platform}:
 *   get:
 *     summary: Get campaigns from a specific platform
 *     tags: [Data Retrieval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [AMAZON, WALMART]
 *     responses:
 *       200:
 *         description: List of campaigns from the specified platform
 *       400:
 *         description: Invalid platform or platform not configured
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/campaigns/:platform', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { platform } = req.params;
    
    if (!Object.values(Platform).includes(platform as Platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
        message: 'Platform must be AMAZON or WALMART',
      });
    }

    const dataService = getDataRetrievalService();
    const campaigns = await dataService.getCampaignsByPlatform(platform as Platform);
    
    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
      platform,
    });
  } catch (error) {
    logger.error(`Error fetching ${req.params.platform} campaigns:`, error);
    
    if (error instanceof Error && error.message.includes('not configured')) {
      return res.status(400).json({
        success: false,
        error: 'Platform not configured',
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve campaigns',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

/**
 * @swagger
 * /api/data/ads:
 *   get:
 *     summary: Get all ads from all configured platforms
 *     tags: [Data Retrieval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Filter ads by campaign ID (optional)
 *     responses:
 *       200:
 *         description: List of ads from all platforms
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/ads', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { campaignId } = req.query;
    const dataService = getDataRetrievalService();
    const ads = await dataService.getAllAds(campaignId as string);
    
    res.json({
      success: true,
      data: ads,
      count: ads.length,
      filtered: campaignId ? `by campaign ${campaignId}` : 'all ads',
    });
  } catch (error) {
    logger.error('Error fetching all ads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve ads',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

/**
 * @swagger
 * /api/data/ads/{platform}:
 *   get:
 *     summary: Get ads from a specific platform
 *     tags: [Data Retrieval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [AMAZON, WALMART]
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Filter ads by campaign ID (optional)
 *     responses:
 *       200:
 *         description: List of ads from the specified platform
 *       400:
 *         description: Invalid platform or platform not configured
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/ads/:platform', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { platform } = req.params;
    const { campaignId } = req.query;
    
    if (!Object.values(Platform).includes(platform as Platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
        message: 'Platform must be AMAZON or WALMART',
      });
    }

    const dataService = getDataRetrievalService();
    const ads = await dataService.getAdsByPlatform(platform as Platform, campaignId as string);
    
    res.json({
      success: true,
      data: ads,
      count: ads.length,
      platform,
      filtered: campaignId ? `by campaign ${campaignId}` : 'all ads',
    });
  } catch (error) {
    logger.error(`Error fetching ${req.params.platform} ads:`, error);
    
    if (error instanceof Error && error.message.includes('not configured')) {
      return res.status(400).json({
        success: false,
        error: 'Platform not configured',
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve ads',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

/**
 * @swagger
 * /api/data/performance/campaign/{platform}/{campaignId}:
 *   get:
 *     summary: Get campaign performance data
 *     tags: [Data Retrieval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [AMAZON, WALMART]
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Campaign performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdPerformance'
 *       400:
 *         description: Invalid parameters or platform not configured
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/performance/campaign/:platform/:campaignId', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const { platform, campaignId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!Object.values(Platform).includes(platform as Platform)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
        message: 'Platform must be AMAZON or WALMART',
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing parameters',
        message: 'startDate and endDate are required',
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
        message: 'Dates must be in YYYY-MM-DD format',
      });
    }

    const dataService = getDataRetrievalService();
    const performance = await dataService.getCampaignPerformance(platform as Platform, campaignId, start, end);
    
    res.json({
      success: true,
      data: performance,
      campaignId,
      platform,
      period: { startDate, endDate },
    });
  } catch (error) {
    logger.error(`Error fetching ${req.params.platform} campaign performance:`, error);
    
    if (error instanceof Error && error.message.includes('not configured')) {
      return res.status(400).json({
        success: false,
        error: 'Platform not configured',
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve campaign performance',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

/**
 * @swagger
 * /api/data/health:
 *   get:
 *     summary: Check connection status to all configured platforms
 *     tags: [Data Retrieval]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Connection status for each platform
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     amazon:
 *                       type: boolean
 *                     walmart:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/health', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const dataService = getDataRetrievalService();
    const status = await dataService.checkConnections();
    
    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error checking platform connections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check connections',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}));

export default router;
