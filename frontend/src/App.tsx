import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConfigProvider } from 'antd';
import { store } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AdsManager from './pages/AdsManager';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 6,
            },
          }}
        >
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/ads-manager" element={<AdsManager />} />
                          <Route path="/campaigns" element={<Campaigns />} />
                          <Route path="/analytics" element={<Analytics />} />
                          <Route path="/settings" element={<Settings />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
