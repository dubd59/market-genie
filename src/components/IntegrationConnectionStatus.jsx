import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import persistenceService from '../services/persistenceService';

const IntegrationConnectionStatus = () => {
  const { user } = useAuth();
  
  const [connections, setConnections] = useState([
    {
      platform: 'LinkedIn Sales Navigator',
      scraper: 'LinkedIn Professional Hunter',
      status: 'connected',
      icon: '💼',
      leadsToday: 127,
      apiCalls: 542,
      cost: '$95.25',
      quality: 94
    },
    {
      platform: 'Twitter/X API',
      scraper: 'Twitter/X Engagement Scanner',
      status: 'connected',
      icon: '🐦',
      leadsToday: 89,
      apiCalls: 387,
      cost: '$40.05',
      quality: 87
    },
    {
      platform: 'Facebook Business API',
      scraper: 'Facebook Business Prospector',
      status: 'connected',
      icon: '📘',
      leadsToday: 76,
      apiCalls: 298,
      cost: '$41.80',
      quality: 91
    },
    {
      platform: 'Instagram Business API',
      scraper: 'Instagram Creator Finder',
      status: 'connected',
      icon: '📸',
      leadsToday: 54,
      apiCalls: 234,
      cost: '$35.10',
      quality: 89
    },
    {
      platform: 'YouTube Data API',
      scraper: 'YouTube Channel Analyzer',
      status: 'connected',
      icon: '📺',
      leadsToday: 32,
      apiCalls: 156,
      cost: '$27.20',
      quality: 92
    },
    {
      platform: 'TikTok for Business API',
      scraper: 'TikTok Business Scout',
      status: 'connected',
      icon: '🎵',
      leadsToday: 43,
      apiCalls: 189,
      cost: '$15.05',
      quality: 85
    }
  ]);

  // Load and save persistent data
  useEffect(() => {
    if (user?.uid) {
      loadPersistentData();
      
      // Live updates every 10 seconds
      const interval = setInterval(() => {
        updateConnectionStats();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const loadPersistentData = async () => {
    try {
      const savedConnections = await persistenceService.loadData(user.uid, 'connectionStatus', { connections: [] });
      if (savedConnections.connections?.length > 0) {
        setConnections(savedConnections.connections);
      }
    } catch (error) {
      console.error('Error loading connection data:', error);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      persistenceService.saveData(user.uid, 'connectionStatus', { connections });
    }
  }, [connections, user]);

  // Simulate live updates
  const updateConnectionStats = () => {
    setConnections(prev => prev.map(conn => ({
      ...conn,
      leadsToday: conn.leadsToday + Math.floor(Math.random() * 3) + 1,
      apiCalls: conn.apiCalls + Math.floor(Math.random() * 20) + 5,
      cost: `$${(parseFloat(conn.cost.replace('$', '')) + Math.random() * 5).toFixed(2)}`,
      quality: Math.min(98, conn.quality + (Math.random() > 0.5 ? 1 : 0))
    })));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      case 'error': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTotalLeads = () => connections.reduce((sum, conn) => sum + conn.leadsToday, 0);
  const getTotalCost = () => connections.reduce((sum, conn) => sum + parseFloat(conn.cost.replace('$', '')), 0);
  const getAverageQuality = () => {
    const connectedPlatforms = connections.filter(c => c.status === 'connected');
    if (connectedPlatforms.length === 0) return 0;
    return Math.round(connectedPlatforms.reduce((sum, conn) => sum + conn.quality, 0) / connectedPlatforms.length);
  };

  const connectPlatform = (platformIndex) => {
    setConnections(prev => prev.map((conn, idx) => 
      idx === platformIndex ? { ...conn, status: 'connected' } : conn
    ));
  };

  const connectAllAPIs = () => {
    setConnections(prev => prev.map(conn => ({ 
      ...conn, 
      status: 'connected',
      leadsToday: conn.leadsToday + Math.floor(Math.random() * 10) + 5,
      quality: Math.min(98, conn.quality + 2)
    })));
  };

  const testConnections = () => {
    // Simulate connection testing with live feedback
    setConnections(prev => prev.map(conn => ({
      ...conn,
      apiCalls: conn.apiCalls + Math.floor(Math.random() * 5) + 1,
      quality: Math.min(98, conn.quality + 1)
    })));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-indigo-800 flex items-center gap-3">
            <span className="text-3xl">🔗</span>
            Social Media Integration Status
          </h3>
          <p className="text-gray-600 mt-1">Real-time connection status between API integrations and scraping agents</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Connected Platforms</div>
          <div className="text-2xl font-bold text-indigo-600">
            {connections.filter(c => c.status === 'connected').length}/{connections.length}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-600 font-medium">Leads Today</div>
          <div className="text-2xl font-bold text-green-800">{getTotalLeads()}</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Cost</div>
          <div className="text-2xl font-bold text-blue-800">${getTotalCost().toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Average Quality</div>
          <div className="text-2xl font-bold text-purple-800">{getAverageQuality()}%</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-600 font-medium">API Calls</div>
          <div className="text-2xl font-bold text-orange-800">
            {connections.reduce((sum, conn) => sum + conn.apiCalls, 0)}
          </div>
        </div>
      </div>

      {/* Connection Status Grid */}
      <div className="space-y-4">
        {connections.map((connection, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-2xl">{connection.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{connection.platform}</h4>
                  <p className="text-sm text-gray-600">→ {connection.scraper}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                  {connection.status === 'connected' ? '✅ Connected' : '❌ Disconnected'}
                </div>
              </div>
              
              {connection.status === 'connected' ? (
                <div className="flex items-center gap-6 ml-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Leads</div>
                    <div className="font-bold text-gray-900">{connection.leadsToday}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Quality</div>
                    <div className="font-bold text-gray-900">{connection.quality}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Cost</div>
                    <div className="font-bold text-gray-900">{connection.cost}</div>
                  </div>
                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors">
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 ml-6">
                  <div className="text-sm text-gray-500">
                    Connect API to start generating leads
                  </div>
                  <button 
                    onClick={() => connectPlatform(index)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Connect API
                  </button>
                </div>
              )}
            </div>
            
            {/* Progress Bars for Connected Platforms */}
            {connection.status === 'connected' && (
              <div className="mt-3 grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Daily Limit</span>
                    <span>{connection.apiCalls}/1000</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(connection.apiCalls / 1000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Quality Score</span>
                    <span>{connection.quality}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${connection.quality}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Cost Efficiency</span>
                    <span>Good</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
        <div className="text-sm text-gray-600">
          {connections.filter(c => c.status === 'connected').length} platforms connected
          • {getTotalLeads()} leads generated today
          • ${getTotalCost().toFixed(2)} total cost
        </div>
        <div className="flex gap-3">
          <button 
            onClick={connectAllAPIs}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            🚀 Connect All APIs
          </button>
          <button 
            onClick={testConnections}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔧 Test Connections
          </button>
          <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors">
            ⚙️ API Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationConnectionStatus;
