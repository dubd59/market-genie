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
              console.log('✅ COCKROACH CRUSHED - Firebase connection stabilized');
              toast.success('🔥 Firebase Connected - Cockroach Eliminated!', {
                duration: 3000,
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
          console.log(`🔄 COCKROACH CRUSHER: Attempting reconnection (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          
          toast.error(`🐛 Cockroach detected! Attempt ${retryCount + 1}/3`, {
            duration: 2000,
            position: 'top-right'
          });
          
          try {
            const success = await reconnectFirebase();
            if (success) {
              console.log('✅ COCKROACH ELIMINATION successful');
              setRetryCount(0);
              toast.success('🎯 Cockroach eliminated!', {
                duration: 2000,
                position: 'top-right'
              });
            }
          } catch (reconnectError) {
            console.error('❌ Cockroach crusher failed:', reconnectError);
          }
        } else {
          console.error('💀 COCKROACH WON - Maximum reconnection attempts reached');
          toast.error('🚨 Connection failed - Operating in offline mode', {
            duration: 5000,
            position: 'top-right'
          });
        }
      }
    };
        } else {
          console.error('❌ Max retry attempts reached');
          toast.error('Connection issues detected. Please refresh the page.', {
            duration: 10000,
            id: 'firebase-connection-error'
          });
        }
      }
    };

    // Initial connection check
    checkConnection();
    
    // Periodic connection monitoring
    connectionCheckInterval = setInterval(checkConnection, 10000);
    
    // Enhanced online/offline handling
    const handleOnline = async () => {
      console.log('🌐 Network back online - checking Firebase connection...');
      setRetryCount(0);
      await checkConnection();
    };
    
    const handleOffline = () => {
      console.log('📴 Network offline detected');
      setConnectionStatus('offline');
      setIsStable(false);
    };
    
    // Enhanced error handling for CORS and connection issues
    const handleUnhandledRejection = (event) => {
      if (event.reason?.message?.includes('CORS') || 
          event.reason?.message?.includes('Failed to fetch') ||
          event.reason?.message?.includes('ERR_FAILED')) {
        console.warn('🔴 Network/CORS error detected:', event.reason);
        
        // Attempt automatic recovery
        setTimeout(async () => {
          console.log('🔄 Attempting automatic recovery...');
          await checkConnection();
        }, 5000);
        
        event.preventDefault();
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      clearInterval(connectionCheckInterval);
      clearTimeout(stabilityTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [retryCount, isStable]);

  // Show loading state until connection is stable
  if (!isStable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full border-t-blue-400 animate-spin" style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Initializing MarketGenie
          </h3>
          <p className="text-gray-500 mb-4">
            {connectionStatus === 'connecting' && 'Establishing secure connection...'}
            {connectionStatus === 'connected' && 'Stabilizing connection...'}
            {connectionStatus === 'error' && `Reconnecting... (${retryCount}/5)`}
            {connectionStatus === 'offline' && 'Waiting for network...'}
          </p>
          
          {retryCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md mx-auto">
              <p className="text-sm text-yellow-700">
                Connection issue detected. Attempting automatic recovery...
              </p>
            </div>
          )}
          
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
              <span>
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'error' ? 'Reconnecting' : 
                 connectionStatus === 'offline' ? 'Offline' : 'Connecting'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default EnhancedFirebaseStabilityManager;