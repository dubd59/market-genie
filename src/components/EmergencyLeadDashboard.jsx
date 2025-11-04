import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const EmergencyLeadDashboard = () => {
  const [emergencyLeads, setEmergencyLeads] = useState([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const [emergencyStorage, setEmergencyStorage] = useState(null);

  useEffect(() => {
    initializeEmergencyStorage();
  }, []);

  const initializeEmergencyStorage = async () => {
    try {
      const { default: EmergencyLeadStorage } = await import('../services/EmergencyLeadStorage.js');
      const storage = new EmergencyLeadStorage();
      setEmergencyStorage(storage);
      loadEmergencyLeads(storage);
    } catch (error) {
      console.error('Failed to initialize emergency storage:', error);
    }
  };

  const loadEmergencyLeads = (storage) => {
    if (storage) {
      const leads = storage.getEmergencyLeads();
      setEmergencyLeads(leads);
    }
  };

  const handleSyncToFirebase = async () => {
    if (!emergencyStorage) return;
    
    setSyncInProgress(true);
    try {
      const results = await emergencyStorage.syncEmergencyLeads();
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast.success(`✅ Synced ${successCount} leads to Firebase successfully!`);
      }
      
      if (failedCount > 0) {
        toast.error(`❌ Failed to sync ${failedCount} leads - Firebase still having issues`);
      }
      
      // Reload emergency leads
      loadEmergencyLeads(emergencyStorage);
      
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('❌ Sync failed - please try again');
    } finally {
      setSyncInProgress(false);
    }
  };

  const handleMigrateDefaultTenantLeads = async () => {
    if (!emergencyStorage) return;
    
    setMigrationInProgress(true);
    try {
      const result = await emergencyStorage.migrateDefaultTenantLeads();
      
      if (result.success) {
        toast.success(`🎉 ${result.message}`);
        console.log('Migration result:', result);
      } else {
        toast.error(`❌ Migration failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('❌ Migration failed - please try again');
    } finally {
      setMigrationInProgress(false);
    }
  };

  const handleExportCSV = () => {
    if (!emergencyStorage) return;
    
    const csvData = emergencyStorage.exportEmergencyLeadsCSV();
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `emergency-leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Emergency leads exported to CSV!');
    }
  };

  const handleClearEmergencyStorage = () => {
    if (!emergencyStorage) return;
    
    if (window.confirm('Are you sure you want to clear all emergency leads? This cannot be undone!')) {
      emergencyStorage.clearEmergencyStorage();
      setEmergencyLeads([]);
      toast.success('Emergency storage cleared');
    }
  };

  const pendingLeads = emergencyLeads.filter(lead => lead.needsFirebaseSync);
  const syncedLeads = emergencyLeads.filter(lead => !lead.needsFirebaseSync);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          🚨 Emergency Lead Storage
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSyncToFirebase}
            disabled={syncInProgress || pendingLeads.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncInProgress ? '🔄 Syncing...' : `🔄 Sync to Firebase (${pendingLeads.length})`}
          </button>
          <button
            onClick={handleMigrateDefaultTenantLeads}
            disabled={migrationInProgress}
            className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {migrationInProgress ? '🔄 Migrating...' : '🚚 Migrate DB Leads'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={emergencyLeads.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            📁 Export CSV
          </button>
          <button
            onClick={handleClearEmergencyStorage}
            disabled={emergencyLeads.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{pendingLeads.length}</div>
          <div className="text-sm text-yellow-600">Pending Firebase Sync</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{syncedLeads.length}</div>
          <div className="text-sm text-green-600">Successfully Synced</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{emergencyLeads.length}</div>
          <div className="text-sm text-blue-600">Total Emergency Leads</div>
        </div>
      </div>

      {/* Emergency Lead List */}
      {emergencyLeads.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emergency Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firebase Sync
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emergencyLeads.map((lead, index) => (
                <tr key={lead.emergencyId || index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.needsFirebaseSync ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        🚨 Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Synced
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {lead.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.emergencyTimestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.firebaseSyncTimestamp ? 
                      new Date(lead.firebaseSyncTimestamp).toLocaleString() : 
                      'Not synced'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📭</div>
          <div>No emergency leads stored</div>
          <div className="text-sm">Leads will appear here if Firebase connection fails</div>
        </div>
      )}

      {/* Information Banner */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">About Emergency Storage</h3>
        <p className="text-sm text-blue-700">
          When Firebase experiences WebChannelConnection transport errors, leads are automatically saved to local storage. 
          This ensures no lead data is lost during Firebase connectivity issues. Use the sync button to upload pending leads 
          to Firebase once the connection is restored.
        </p>
      </div>
    </div>
  );
};

export default EmergencyLeadDashboard;