import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,  
  SafeAreaView, 
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Platform
} from 'react-native';
import { apiService, Campaign, HealthResponse } from './services/api';

// Screen Components
import HomeScreen from './screens/HomeScreen';
import CampaignsScreen from './screens/CampaignsScreen';
import AmazonScreen from './screens/AmazonScreen';
import WalmartScreen from './screens/WalmartScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check API health on app start
  const checkHealth = async () => {
    try {
      const healthData = await apiService.getHealth();
      setHealth(healthData);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        success: false,
        data: { amazon: false, walmart: false, mockData: false },
        message: 'API Connection Failed',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    checkHealth();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to AdSphere...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <NavigationContainer>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚀 AdSphere Mobile</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>
        
        {health && (
          <View style={styles.healthBar}>
            <Text style={styles.healthText}>
              {health.message}
            </Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusBadge, health.data.amazon && styles.statusSuccess]}>
                Amazon: {health.data.amazon ? '✅' : '📊'}
              </Text>
              <Text style={[styles.statusBadge, health.data.walmart && styles.statusSuccess]}>
                Walmart: {health.data.walmart ? '✅' : '📊'}
              </Text>
            </View>
          </View>
        )}

        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarStyle: styles.tabBar,
            headerStyle: styles.headerStyle,
            headerTintColor: '#007AFF',
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: '🏠 Dashboard',
              tabBarLabel: 'Dashboard'
            }} 
          />
          <Tab.Screen 
            name="Campaigns" 
            component={CampaignsScreen} 
            options={{ 
              title: '📊 All Campaigns',
              tabBarLabel: 'All'
            }} 
          />
          <Tab.Screen 
            name="Amazon" 
            component={AmazonScreen} 
            options={{ 
              title: '🛒 Amazon',
              tabBarLabel: 'Amazon'
            }} 
          />
          <Tab.Screen 
            name="Walmart" 
            component={WalmartScreen} 
            options={{ 
              title: '🏪 Walmart',
              tabBarLabel: 'Walmart'
            }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  refreshText: {
    fontSize: 16,
  },
  healthBar: {
    backgroundColor: '#E8F4FD',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  healthText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    fontSize: 12,
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FFF',
    color: '#8E8E93',
  },
  statusSuccess: {
    backgroundColor: '#E8F5E8',
    color: '#34C759',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 8,
    paddingTop: 8,
    height: 80,
  },
  headerStyle: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
});
