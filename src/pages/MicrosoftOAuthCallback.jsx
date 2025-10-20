import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CalendarService from '../services/calendarService';
import toast from 'react-hot-toast';

const MicrosoftOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your Outlook calendar connection...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('❌ Microsoft OAuth error:', error, errorDescription);
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          toast.error('Failed to connect Outlook Calendar');
          
          // Redirect back to integrations after delay
          setTimeout(() => {
            navigate('/dashboard?section=API Keys & Integrations');
          }, 3000);
          return;
        }

        if (code) {
          console.log('✅ Received authorization code from Microsoft');
          setMessage('Exchanging authorization code for access token...');
          
          // Exchange code for access token
          const result = await CalendarService.handleMicrosoftCallback(code);
          
          if (result.success) {
            console.log('✅ Successfully obtained access token');
            setStatus('success');
            setMessage('🎉 Successfully connected to Outlook Calendar!');
            
            // Store connection status
            localStorage.setItem('outlook_connected', 'true');
            localStorage.setItem('outlook_connection_time', new Date().toISOString());
            
            toast.success('Outlook Calendar connected successfully!');
            
            // Redirect back to integrations
            setTimeout(() => {
              navigate('/dashboard?section=API Keys & Integrations');
            }, 2000);
          } else {
            throw new Error(result.error || 'Failed to exchange code for token');
          }
        } else {
          throw new Error('No authorization code received from Microsoft');
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setStatus('error');
        setMessage(`Connection failed: ${error.message}`);
        toast.error('Failed to connect Outlook Calendar');
        
        // Redirect back to integrations after delay
        setTimeout(() => {
          navigate('/dashboard?section=API Keys & Integrations');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          )}
          {status === 'success' && (
            <div className="text-green-500 text-6xl mb-4">✅</div>
          )}
          {status === 'error' && (
            <div className="text-red-500 text-6xl mb-4">❌</div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {status === 'processing' && 'Connecting to Outlook...'}
          {status === 'success' && 'Connection Successful!'}
          {status === 'error' && 'Connection Failed'}
        </h2>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'processing' && (
          <p className="text-sm text-gray-500">Please wait while we complete the connection...</p>
        )}
        
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">
              Your Outlook Calendar is now connected to Market Genie! 
              You can now create appointments that will sync with your calendar.
            </p>
          </div>
        )}
        
        {(status === 'success' || status === 'error') && (
          <button
            onClick={() => navigate('/dashboard?section=API Keys & Integrations')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Integrations
          </button>
        )}
      </div>
    </div>
  );
};

export default MicrosoftOAuthCallback;