import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import SecurityStatus from '../components/SecurityStatus'
import dataInvestigationService from '../services/dataInvestigationService'
import { toast } from 'react-hot-toast'

function AdminDashboard() {
  const [investigating, setInvestigating] = useState(false);

  const handleDataInvestigation = async () => {
    setInvestigating(true);
    toast.loading('🔍 Investigating all data locations...');
    
    try {
      const results = await dataInvestigationService.recoverMissingCampaigns();
      if (results.success) {
        toast.dismiss();
        toast.success(`Found ${results.campaigns.length} campaigns!`);
        console.log('📊 Investigation Results:', results);
      } else {
        toast.dismiss();
        toast.error(results.message || 'No campaigns found');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Investigation failed: ' + error.message);
      console.error('Investigation error:', error);
    } finally {
      setInvestigating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage users, settings, and system configuration</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Status Monitor */}
        <div className="mb-8">
          <SecurityStatus />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">⚙️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                  <p className="text-sm text-gray-500">Configure system preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">System Analytics</h3>
                  <p className="text-sm text-gray-500">View system performance metrics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Investigation */}
          <div className="bg-white overflow-hidden shadow rounded-lg border-2 border-red-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🔍</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Data Investigation</h3>
                  <p className="text-sm text-gray-500">Find missing campaigns (170 & 140 emails)</p>
                </div>
              </div>
              <button
                onClick={handleDataInvestigation}
                disabled={investigating}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                  investigating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } transition-colors duration-200`}
              >
                {investigating ? '🔍 Investigating...' : '🔍 Find Missing Campaigns'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
