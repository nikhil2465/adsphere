import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { apiService, Campaign, HealthResponse } from '../services/api';
import { exportAllDataToCSV } from '../utils/csvExport';

const HomeScreen = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [amazonCampaigns, setAmazonCampaigns] = useState<Campaign[]>([]);
  const [walmartCampaigns, setWalmartCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [healthData, campaignsData, amazonData, walmartData] = await Promise.all([
        apiService.getHealth(),
        apiService.getAllCampaigns(),
        apiService.getAmazonCampaigns(),
        apiService.getWalmartCampaigns(),
      ]);
      setHealth(healthData);
      setCampaigns(campaignsData.data);
      setAmazonCampaigns(amazonData.data);
      setWalmartCampaigns(walmartData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDownloadAllData = async () => {
    try {
      await exportAllDataToCSV(campaigns, amazonCampaigns, walmartCampaigns);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download data. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏥 System Status</Text>
        {health && (
          <>
            <Text style={styles.message}>{health.message}</Text>
            <Text style={styles.statusText}>
              Amazon: {health.data.amazon ? '✅ Connected' : '📊 Mock Data'}
            </Text>
            <Text style={styles.statusText}>
              Walmart: {health.data.walmart ? '✅ Connected' : '📊 Mock Data'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Summary</Text>
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={handleDownloadAllData}
          >
            <Text style={styles.downloadButtonText}>📥 Download</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.statText}>Campaigns: {campaigns.length}</Text>
        <Text style={styles.statText}>
          Total Impressions: {campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0).toLocaleString()}
        </Text>
        <Text style={styles.statText}>
          Total Spend: ${campaigns.reduce((sum, c) => sum + c.metrics.spend, 0).toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#8E8E93' },
  card: { backgroundColor: '#FFFFFF', margin: 16, padding: 16, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  downloadButton: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  downloadButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  message: { fontSize: 14, color: '#007AFF', marginBottom: 8 },
  statusText: { fontSize: 14, color: '#333', marginBottom: 4 },
  statText: { fontSize: 14, color: '#333', marginBottom: 4 },
});

export default HomeScreen;
