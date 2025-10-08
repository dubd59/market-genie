/**
 * 🛡️ SECURITY INITIALIZATION COMPONENT
 * 
 * This component provides real-time security status display
 * and emergency controls for the MarketGenie application.
 * 
 * Features:
 * - Real-time security status monitoring
 * - Violation count display
 * - Emergency security controls
 * - Security health dashboard
 */

import React, { useState, useEffect } from 'react';
import { dbGuardian } from '../security/DatabaseGuardian.js';
import { securityMonitor } from '../security/RuntimeMonitor.js';
import { securityUtils } from '../security/SecureFirebase.js';

const SecurityStatus = () => {
  const [securityData, setSecurityData] = useState({
    violations: 0,
    status: 'INITIALIZING',
    monitoring: { isActive: false },
    lastCheck: null
  });

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Update security status every 5 seconds
    const interval = setInterval(() => {
      updateSecurityStatus();
    }, 5000);

    // Initial check
    updateSecurityStatus();

    return () => clearInterval(interval);
  }, []);

  const updateSecurityStatus = () => {
    try {
      const violationReport = dbGuardian.getViolationReport();
      const monitoringReport = securityMonitor.getMonitoringReport();
      const securityStatus = securityUtils.getSecurityStatus();

      setSecurityData({
        violations: violationReport.totalViolations,
        status: violationReport.securityStatus,
        monitoring: monitoringReport,
        lastCheck: new Date().toLocaleTimeString(),
        details: violationReport
      });
    } catch (error) {
      console.error('Security status update failed:', error);
      setSecurityData(prev => ({
        ...prev,
        status: 'ERROR',
        lastCheck: new Date().toLocaleTimeString()
      }));
    }
  };

  const getStatusColor = () => {
    if (securityData.status === 'SECURE') return 'text-green-500';
    if (securityData.status === 'VIOLATIONS_DETECTED') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getStatusIcon = () => {
    if (securityData.status === 'SECURE') return '🛡️';
    if (securityData.status === 'VIOLATIONS_DETECTED') return '🚨';
    return '⚠️';
  };

  const handleEmergencyReset = () => {
    if (window.confirm('🚨 Are you sure you want to perform an emergency security reset? This will clear all violation history.')) {
      dbGuardian.clearViolations();
      securityMonitor.restart();
      updateSecurityStatus();
      alert('✅ Security system reset completed');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[250px]">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className={`font-medium ${getStatusColor()}`}>
              {securityData.status}
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            {showDetails ? '▼' : '▶'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Violations:</span>
            <span className={securityData.violations > 0 ? 'text-red-500 font-medium' : 'text-green-500'}>
              {securityData.violations}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Monitor:</span>
            <span className={securityData.monitoring.isActive ? 'text-green-500' : 'text-red-500'}>
              {securityData.monitoring.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Last Check:</span>
            <span>{securityData.lastCheck}</span>
          </div>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="space-y-2 text-xs">
              <div>
                <strong>Monitoring Stats:</strong>
                <div className="ml-2 space-y-1">
                  <div>Blocked Ops: {securityData.monitoring.blockedOperations || 0}</div>
                  <div>Network Requests: {securityData.monitoring.networkRequests || 0}</div>
                  <div>Recent Violations: {securityData.monitoring.recentViolations || 0}</div>
                </div>
              </div>

              {securityData.violations > 0 && (
                <div className="mt-2">
                  <button
                    onClick={handleEmergencyReset}
                    className="w-full bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-600"
                  >
                    🚨 Emergency Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-500">
            MarketGenie Database Security
          </div>
          <div className="text-xs font-medium text-blue-600">
            🔒 ABSOLUTE ISOLATION
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatus;