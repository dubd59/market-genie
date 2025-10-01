import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import stabilityMonitor from '../services/stabilityMonitor';

const FirebaseStabilityManager = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Start monitoring when the app loads
    console.log('🚀 Initializing Firebase stability monitoring...');
    stabilityMonitor.startMonitoring();

    // Cleanup on unmount
    return () => {
      stabilityMonitor.stopMonitoring();
    };
  }, []);

  useEffect(() => {
    // When user logs in, ensure connection is stable
    if (user) {
      console.log('👤 User authenticated - verifying Firebase stability...');
      setTimeout(() => {
        stabilityMonitor.performHealthCheck();
      }, 1000);
    }
  }, [user]);

  // This component doesn't render anything visible
  return null;
};

export default FirebaseStabilityManager;