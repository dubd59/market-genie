import React, { useEffect, useState } from 'react';
import { db, reconnectFirebase, checkConnectionHealth } from '../firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import toast from 'react-hot-toast';

const EnhancedFirebaseStabilityManager = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    console.log('🚀 COCKROACH-PROOF Stability Manager starting...');
    
    let connectionCheckInterval;
    let stabilityTimeout;
    
    const checkConnection = async () => {
      try {
        // Use our bulletproof connection checker
        const isHealthy = await checkConnectionHealth();
        
        if (isHealthy) {
          setConnectionStatus('connected');
          setRetryCount(0);
          
          if (!isStable) {
            // Wait for connection to stabilize
            stabilityTimeout = setTimeout(() => {
              setIsStable(true);
              console.log('✅ Firebase connection stabilized');
              toast.success('🔥 Firebase Connected!', {
                duration: 2000,
                position: 'top-right'
              });
            }, 2000);
          }
        } else {
          throw new Error('Connection health check failed');
        }
        
      } catch (error) {
        console.error('🔴 Firebase connection test failed:', error);
        setConnectionStatus('error');
        setIsStable(false);
        
        if (retryCount < 3) {
          console.log(`🔄 Attempting reconnection (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          
          toast.error(`� Connection issue detected! Attempt ${retryCount + 1}/3`, {
            duration: 2000,
            position: 'top-right'
          });
          
          try {
            const success = await reconnectFirebase();
            if (success) {
              console.log('✅ Firebase reconnection successful');
              setRetryCount(0);
              toast.success('✅ Connection restored!', {
                duration: 2000,
                position: 'top-right'
              });
            }
          } catch (reconnectError) {
            console.error('❌ Reconnection failed:', reconnectError);
          }
        } else {
          console.error('💀 Maximum reconnection attempts reached');
          toast.error('🚨 Connection failed - Operating in offline mode', {
            duration: 5000,
            position: 'top-right'
          });
        }
      }
    };

    // Initial connection check
    checkConnection();
    
    // Periodic connection monitoring (check every 15 seconds)
    connectionCheckInterval = setInterval(checkConnection, 15000);
    
    // Enhanced online/offline handling
    const handleOnline = async () => {
      console.log('🌐 Network back online - checking Firebase connection...');
      setRetryCount(0);
      await checkConnection();
    };
    
    const handleOffline = () => {
      console.log('📴 Network offline - entering offline mode');
      setConnectionStatus('offline');
      setIsStable(false);
      clearTimeout(stabilityTimeout);
    };

    // Add event listeners for network status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Enhanced visibility change handling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Page visible - checking Firebase connection...');
        checkConnection();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      clearInterval(connectionCheckInterval);
      clearTimeout(stabilityTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [retryCount, isStable]);

  // Connection status indicator
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981'; // Green
      case 'connecting': return '#F59E0B'; // Orange  
      case 'error': return '#EF4444'; // Red
      case 'offline': return '#6B7280'; // Gray
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return isStable ? '🔥 Cockroach-Free Zone' : '🔄 Stabilizing...';
      case 'connecting': return '🔄 Hunting Cockroaches...';
      case 'error': return '🐛 Cockroach Detected!';
      case 'offline': return '📴 Offline Mode';
      default: return '⚡ Initializing...';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Connection Status Indicator - Removed for production */}
      {/* 
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: getStatusColor(),
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 9999,
          opacity: connectionStatus === 'connected' && isStable ? 0.7 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        {getStatusText()}
      </div>
      */}

      {/* Render children - app continues to work even with connection issues */}
      {children}
    </div>
  );
};

export default EnhancedFirebaseStabilityManager;