// Mock Amazon and Walmart advertising data for testing
const mockAmazonData = {
  account: {
    advertiserId: "AMZ-ADV-80001",
    accountName: "Demo Amazon Advertiser",
    currency: "USD",
    timezone: "America/Los_Angeles",
    marketplace: "US"
  },
  campaigns: [
    {
      campaignId: "AMZ-CAMP-2001",
      name: "Amazon Campaign 1",
      type: "SPONSORED_DISPLAY",
      status: "ENABLED",
      dailyBudget: 820,
      startDate: "2026-02-01",
      endDate: "2026-03-01",
      metrics: {
        impressions: 154703,
        clicks: 1122,
        spend: 1398.77,
        sales: 5758.19,
        orders: 302,
        acos: 35.23,
        roas: 4.61
      },
      adGroups: [
        {
          adGroupId: "AMZ-AG-11",
          name: "AdGroup 1",
          defaultBid: 2.89,
          status: "ENABLED",
          keywords: [
            {
              keywordId: "AMZ-KW-111",
              keywordText: "amazon keyword 1",
              matchType: "PHRASE",
              bid: 1.09,
              metrics: {
                impressions: 21159,
                clicks: 402,
                spend: 281.92,
                sales: 107.97,
                orders: 44,
                acos: 24.23
              }
            },
            {
              keywordId: "AMZ-KW-112",
              keywordText: "amazon keyword 2",
              matchType: "PHRASE",
              bid: 1.37,
              metrics: {
                impressions: 2177,
                clicks: 375,
                spend: 92.17,
                sales: 533.15,
                orders: 6,
                acos: 17.91
              }
            },
            {
              keywordId: "AMZ-KW-113",
              keywordText: "amazon keyword 3",
              matchType: "BROAD",
              bid: 2.34,
              metrics: {
                impressions: 26481,
                clicks: 284,
                spend: 251.81,
                sales: 806.25,
                orders: 59,
                acos: 9.59
              }
            },
            {
              keywordId: "AMZ-KW-114",
              keywordText: "amazon keyword 4",
              matchType: "PHRASE",
              bid: 1.85,
              metrics: {
                impressions: 28382,
                clicks: 753,
                spend: 283.89,
                sales: 1056.95,
                orders: 34,
                acos: 17.42
              }
            },
            {
              keywordId: "AMZ-KW-115",
              keywordText: "amazon keyword 5",
              matchType: "BROAD",
              bid: 2.25,
              metrics: {
                impressions: 1532,
                clicks: 370,
                spend: 256.13,
                sales: 367.29,
                orders: 34,
                acos: 21.48
              }
            }
          ]
        }
      ]
    },
    {
      campaignId: "AMZ-CAMP-2002",
      name: "Amazon Campaign 2",
      type: "SPONSORED_BRANDS",
      status: "ENABLED",
      dailyBudget: 758,
      startDate: "2026-02-01",
      endDate: "2026-03-01",
      metrics: {
        impressions: 186675,
        clicks: 1883,
        spend: 1609.12,
        sales: 1551.94,
        orders: 164,
        acos: 36.83,
        roas: 4.57
      },
      adGroups: [
        {
          adGroupId: "AMZ-AG-21",
          name: "AdGroup 1",
          defaultBid: 1.96,
          status: "ENABLED",
          keywords: [
            {
              keywordId: "AMZ-KW-211",
              keywordText: "amazon keyword 1",
              matchType: "PHRASE",
              bid: 1.22,
              metrics: {
                impressions: 19552,
                clicks: 117,
                spend: 37.79,
                sales: 1002.5,
                orders: 36,
                acos: 34.44
              }
            }
          ]
        }
      ]
    }
  ]
};

const mockWalmartData = {
  account: {
    advertiserId: "WM-ADV-90001",
    accountName: "Demo Walmart Advertiser",
    currency: "USD",
    timezone: "America/New_York"
  },
  campaigns: [
    {
      campaignId: "WM-CAMP-1001",
      name: "Campaign 1",
      type: "SPONSORED_PRODUCTS",
      status: "ACTIVE",
      dailyBudget: 180,
      startDate: "2026-02-01",
      endDate: "2026-03-01",
      metrics: {
        impressions: 111077,
        clicks: 4893,
        spend: 1048.07,
        conversions: 128,
        roas: 3.02
      },
      adGroups: [
        {
          adGroupId: "WM-AG-11",
          name: "AdGroup 1",
          bid: 0.71,
          status: "ACTIVE",
          keywords: [
            {
              keywordId: "WM-KW-111",
              keyword: "sample keyword 1",
              matchType: "PHRASE",
              bid: 0.92,
              metrics: {
                impressions: 8088,
                clicks: 312,
                spend: 193.45,
                conversions: 3
              }
            },
            {
              keywordId: "WM-KW-112",
              keyword: "sample keyword 2",
              matchType: "PHRASE",
              bid: 0.37,
              metrics: {
                impressions: 12274,
                clicks: 496,
                spend: 115.36,
                conversions: 20
              }
            }
          ]
        }
      ]
    },
    {
      campaignId: "WM-CAMP-1002",
      name: "Campaign 2",
      type: "SPONSORED_BRANDS",
      status: "ACTIVE",
      dailyBudget: 411,
      startDate: "2026-02-01",
      endDate: "2026-03-01",
      metrics: {
        impressions: 96871,
        clicks: 4160,
        spend: 288.37,
        conversions: 247,
        roas: 3.11
      },
      adGroups: [
        {
          adGroupId: "WM-AG-21",
          name: "AdGroup 1",
          bid: 0.34,
          status: "ACTIVE",
          keywords: [
            {
              keywordId: "WM-KW-211",
              keyword: "sample keyword 1",
              matchType: "BROAD",
              bid: 0.85,
              metrics: {
                impressions: 5613,
                clicks: 391,
                spend: 62.29,
                conversions: 18
              }
            }
          ]
        }
      ]
    }
  ]
};

// Helper functions to get data by platform
const getMockDataByPlatform = (platform) => {
  switch (platform.toUpperCase()) {
    case 'AMAZON':
      return mockAmazonData;
    case 'WALMART':
      return mockWalmartData;
    default:
      return { amazon: mockAmazonData, walmart: mockWalmartData };
  }
};

// Export both data sets and helper function
module.exports = {
  mockAmazonData,
  mockWalmartData,
  getMockDataByPlatform
};
