import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { apiService, Campaign } from '../services/api';

const AmazonScreen = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAmazonCampaigns = async () => {
    try {
      const data = await apiService.getAmazonCampaigns();
      setCampaigns(data.data);
    } catch (error) {
      console.error('Failed to load Amazon campaigns:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAmazonCampaigns();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAmazonCampaigns();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Loading Amazon campaigns...</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Amazon Campaigns</Text>
        <Text style={styles.count}>{campaigns.length} campaigns</Text>
      </View>
      
      {campaigns.map((campaign) => (
        <View key={campaign.campaignId} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <Text style={[
              styles.status,
              campaign.status === 'ENABLED' ? styles.active : styles.paused
            ]}>
              {campaign.status}
            </Text>
          </View>
          
          <Text style={styles.type}>{campaign.type}</Text>
          <Text style={styles.budget}>Daily Budget: ${campaign.dailyBudget}</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{campaign.metrics.impressions.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Impressions</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{campaign.metrics.clicks}</Text>
              <Text style={styles.metricLabel}>Clicks</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>${campaign.metrics.spend.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Spend</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricNumber}>{campaign.metrics.roas}</Text>
              <Text style={styles.metricLabel}>ROAS</Text>
            </View>
          </View>
          
          {campaign.metrics.sales && (
            <Text style={styles.sales}>Sales: ${campaign.metrics.sales.toFixed(2)}</Text>
          )}
          
          <Text style={styles.date}>
            {campaign.startDate} to {campaign.endDate}
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
  header: { 
    backgroundColor: '#FF9500', 
    padding: 20, 
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  count: { fontSize: 16, color: '#FFF', opacity: 0.9 },
  card: { 
    backgroundColor: '#FFFFFF', 
    margin: 16, 
    padding: 16, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  campaignName: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  status: { fontSize: 12, padding: 4, borderRadius: 4, color: '#FFF' },
  active: { backgroundColor: '#34C759' },
  paused: { backgroundColor: '#FF9500' },
  type: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  budget: { fontSize: 14, color: '#FF9500', fontWeight: '600', marginBottom: 12 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricItem: { alignItems: 'center', flex: 1 },
  metricNumber: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  metricLabel: { fontSize: 12, color: '#8E8E93' },
  sales: { fontSize: 14, color: '#34C759', fontWeight: '600', marginBottom: 8 },
  date: { fontSize: 12, color: '#8E8E93' },
});

export default AmazonScreen;
