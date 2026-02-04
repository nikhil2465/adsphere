import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { apiService, Campaign } from '../services/api';

const CampaignsScreen = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCampaigns = async () => {
    try {
      const data = await apiService.getAllCampaigns();
      setCampaigns(data.data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCampaigns();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading campaigns...</Text>
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
      <Text style={styles.title}>All Campaigns</Text>
      <Text style={styles.subtitle}>{campaigns.length} campaigns found</Text>
      
      {campaigns.map((campaign) => (
        <View key={campaign.campaignId} style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <Text style={[
              styles.status,
              campaign.status === 'ENABLED' || campaign.status === 'ACTIVE' ? styles.active : styles.paused
            ]}>
              {campaign.status}
            </Text>
          </View>
          
          <Text style={styles.type}>{campaign.type}</Text>
          <Text style={styles.budget}>Budget: ${campaign.dailyBudget}/day</Text>
          
          <View style={styles.metrics}>
            <Text style={styles.metric}>📊 {campaign.metrics.impressions.toLocaleString()} impressions</Text>
            <Text style={styles.metric}>👆 {campaign.metrics.clicks} clicks</Text>
            <Text style={styles.metric}>💰 ${campaign.metrics.spend.toFixed(2)} spend</Text>
            {campaign.metrics.sales && (
              <Text style={styles.metric}>💵 ${campaign.metrics.sales.toFixed(2)} sales</Text>
            )}
            {campaign.metrics.roas && (
              <Text style={styles.metric}>📈 ROAS: {campaign.metrics.roas}</Text>
            )}
          </View>
          
          <Text style={styles.date}>
            {campaign.startDate} - {campaign.endDate}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#8E8E93' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 16, color: '#000' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginLeft: 16, marginBottom: 8 },
  card: { backgroundColor: '#FFFFFF', margin: 16, padding: 16, borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  campaignName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  status: { fontSize: 12, padding: 4, borderRadius: 4, color: '#FFF' },
  active: { backgroundColor: '#34C759' },
  paused: { backgroundColor: '#FF9500' },
  type: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  budget: { fontSize: 14, color: '#007AFF', marginBottom: 8 },
  metrics: { marginBottom: 8 },
  metric: { fontSize: 13, color: '#333', marginBottom: 2 },
  date: { fontSize: 12, color: '#8E8E93' },
});

export default CampaignsScreen;
