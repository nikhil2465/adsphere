import { Campaign } from '../services/api';

export const exportToCSV = (campaigns: Campaign[], filename?: string) => {
  if (!campaigns || campaigns.length === 0) {
    alert('No data available to export');
    return;
  }

  // CSV Headers
  const headers = [
    'Campaign ID',
    'Campaign Name',
    'Campaign Type',
    'Status',
    'Daily Budget',
    'Impressions',
    'Clicks',
    'Spend',
    'ROAS',
    'Start Date',
    'End Date'
  ];

  // Convert campaign data to CSV rows
  const csvRows = campaigns.map(campaign => [
    campaign.campaignId,
    `"${campaign.name}"`,
    campaign.type,
    campaign.status,
    campaign.dailyBudget?.toString() || '0',
    campaign.metrics?.impressions?.toString() || '0',
    campaign.metrics?.clicks?.toString() || '0',
    campaign.metrics?.spend?.toString() || '0',
    campaign.metrics?.roas?.toString() || '0',
    campaign.startDate || 'N/A',
    campaign.endDate || 'N/A'
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultFilename = `adsphere-campaigns-${timestamp}.csv`;
    link.setAttribute('download', filename || defaultFilename);
    
    // Trigger download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Exported ${campaigns.length} campaigns to CSV`);
  } else {
    alert('CSV export is not supported in this browser');
  }
};

export const exportAllDataToCSV = async (
  allCampaigns: Campaign[],
  amazonCampaigns: Campaign[],
  walmartCampaigns: Campaign[]
) => {
  // Create combined data with platform identification
  const combinedCampaigns = [
    ...allCampaigns.map(c => ({ ...c, dataSource: 'All Campaigns' })),
    ...amazonCampaigns.map(c => ({ ...c, dataSource: 'Amazon Only' })),
    ...walmartCampaigns.map(c => ({ ...c, dataSource: 'Walmart Only' }))
  ];

  // Enhanced headers for combined export
  const headers = [
    'Campaign ID',
    'Campaign Name',
    'Campaign Type',
    'Status',
    'Daily Budget',
    'Impressions',
    'Clicks',
    'Spend',
    'ROAS',
    'Start Date',
    'End Date',
    'Data Source'
  ];

  const csvRows = combinedCampaigns.map(campaign => [
    campaign.campaignId,
    `"${campaign.name}"`,
    campaign.type,
    campaign.status,
    campaign.dailyBudget?.toString() || '0',
    campaign.metrics?.impressions?.toString() || '0',
    campaign.metrics?.clicks?.toString() || '0',
    campaign.metrics?.spend?.toString() || '0',
    campaign.metrics?.roas?.toString() || '0',
    campaign.startDate || 'N/A',
    campaign.endDate || 'N/A',
    campaign.dataSource || 'Unknown'
  ]);

  const csvContent = [headers, ...csvRows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('download', `adsphere-complete-data-${timestamp}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Exported complete data: ${combinedCampaigns.length} total campaigns`);
  }
};
