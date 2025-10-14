import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UnsubscribeService from '../services/unsubscribeService';
import { useTenant } from '../contexts/TenantContext';
import toast from 'react-hot-toast';

const UnsubscribeManagement = () => {
  const { tenant } = useTenant();
  const [stats, setStats] = useState({
    totalUnsubscribes: 0,
    unsubscribesByMonth: {},
    recentUnsubscribes: []
  });
  const [loading, setLoading] = useState(true);
  const [resubscribeEmail, setResubscribeEmail] = useState('');
  const [showResubscribe, setShowResubscribe] = useState(false);

  useEffect(() => {
    if (tenant?.id) {
      loadStats();
    }
  }, [tenant?.id]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const unsubscribeStats = await UnsubscribeService.getUnsubscribeStats(tenant.id);
      setStats(unsubscribeStats);
    } catch (error) {
      console.error('Error loading unsubscribe stats:', error);
      toast.error('Failed to load unsubscribe statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!resubscribeEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await UnsubscribeService.resubscribe(tenant.id, resubscribeEmail);
      toast.success(`${resubscribeEmail} has been resubscribed successfully!`);
      setResubscribeEmail('');
      setShowResubscribe(false);
      loadStats(); // Refresh stats
    } catch (error) {
      console.error('Error resubscribing:', error);
      toast.error('Failed to resubscribe email address');
    }
  };

  const checkUnsubscribeStatus = async (email) => {
    try {
      const isUnsubscribed = await UnsubscribeService.isUnsubscribed(tenant.id, email);
      toast.success(`${email} is ${isUnsubscribed ? 'UNSUBSCRIBED' : 'ACTIVE'}`);
    } catch (error) {
      toast.error('Error checking status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-genie-teal"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Unsubscribe Management</h2>
          <p className="text-gray-600">Monitor and manage email unsubscribes</p>
        </div>
        <button
          onClick={() => setShowResubscribe(!showResubscribe)}
          className="bg-genie-teal text-white px-4 py-2 rounded-lg hover:bg-genie-teal/80 transition-colors"
        >
          Resubscribe User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <span className="text-2xl">📧</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Unsubscribes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUnsubscribes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.unsubscribesByMonth[`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`] || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent (30 days)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentUnsubscribes.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resubscribe Section */}
      {showResubscribe && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resubscribe Email Address</h3>
          <div className="flex gap-4">
            <input
              type="email"
              value={resubscribeEmail}
              onChange={(e) => setResubscribeEmail(e.target.value)}
              placeholder="Enter email address to resubscribe..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
            />
            <button
              onClick={handleResubscribe}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Resubscribe
            </button>
            <button
              onClick={() => checkUnsubscribeStatus(resubscribeEmail)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Check Status
            </button>
          </div>
        </motion.div>
      )}

      {/* Recent Unsubscribes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Unsubscribes</h3>
          <p className="text-sm text-gray-600">Latest unsubscribe requests (last 30 days)</p>
        </div>
        
        <div className="overflow-x-auto">
          {stats.recentUnsubscribes.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentUnsubscribes.map((unsubscribe, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {unsubscribe.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unsubscribe.date.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unsubscribe.campaignId || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setResubscribeEmail(unsubscribe.email);
                          setShowResubscribe(true);
                        }}
                        className="text-genie-teal hover:text-genie-teal/80"
                      >
                        Resubscribe
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Unsubscribes</h3>
              <p className="text-gray-500">No one has unsubscribed in the last 30 days!</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Unsubscribe Trends</h3>
        {Object.keys(stats.unsubscribesByMonth).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(stats.unsubscribesByMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, count]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min((count / Math.max(...Object.values(stats.unsubscribesByMonth))) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No historical data available</p>
        )}
      </div>
    </motion.div>
  );
};

export default UnsubscribeManagement;