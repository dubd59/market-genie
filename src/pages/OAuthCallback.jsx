import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import IntegrationService from '../services/integrationService';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('OAuth callback started');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', window.location.search);
        
        // Prevent multiple executions
        if (window.oauthProcessing) {
          console.log('OAuth already processing, skipping duplicate execution');
          return;
        }
        window.oauthProcessing = true;
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('OAuth callback params:', { code: !!code, state: !!state, error, errorDescription });

        if (error) {
          throw new Error(`OAuth error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        if (!state) {
          throw new Error('No state parameter received');
        }

        // Decode state to get tenant and service info
        let stateData;
        try {
          // Handle both test state and real state
          if (state === 'test') {
            // For manual testing
            stateData = { tenantId: 'marketgenie-tenant', service: 'zoho_campaigns' };
          } else {
            stateData = JSON.parse(atob(state));
          }
          console.log('Decoded state:', stateData);
        } catch (e) {
          console.error('State decode error:', e);
          throw new Error('Invalid state parameter');
        }

        const { tenantId, service } = stateData;

        if (!tenantId || service !== 'zoho_campaigns') {
          throw new Error('Invalid OAuth state');
        }

        console.log('Exchanging code for tokens...', { tenantId, codeLength: code.length });
        
        // Exchange authorization code for access token
        const result = await IntegrationService.handleZohoOAuthCallback(tenantId, code);
        
        console.log('Token exchange result:', result);
        console.log('Token exchange success:', result.success);
        console.log('Token exchange error:', result.error);

        if (result.success) {
          console.log('OAuth callback completed successfully!');
          toast.success('✅ Zoho account connected successfully!');
          
          // Keep popup open longer to see logs
          console.log('Keeping popup open for 10 seconds to see logs...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          // Close the popup window if this is running in a popup
          if (window.opener) {
            console.log('Sending success message to parent window');
            window.opener.postMessage({ 
              type: 'OAUTH_SUCCESS', 
              service: 'zoho_campaigns',
              tenantId: tenantId 
            }, window.location.origin);
            
            // Close after delay
            setTimeout(() => {
              console.log('Closing popup window');
              window.close();
            }, 2000);
          } else {
            // If not in popup, redirect to settings
            navigate('/settings?tab=integrations&success=zoho');
          }
        } else {
          console.error('Token exchange failed:', result.error);
          throw new Error(result.error || 'Failed to complete OAuth');
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message);
        toast.error(`OAuth failed: ${error.message}`);
        
        // Add long delay to see the error
        console.log('ERROR: OAuth failed!');
        console.log('Error details:', error);
        console.log('Keeping popup open for 15 seconds for debugging...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        if (window.opener) {
          console.log('Sending error message to parent window');
          window.opener.postMessage({ 
            type: 'OAUTH_ERROR', 
            error: error.message 
          }, window.location.origin);
          
          // Add delay before closing popup
          setTimeout(() => {
            console.log('Closing popup window after error');
            window.close();
          }, 3000);
        } else {
          // Redirect to settings with error
          setTimeout(() => {
            navigate('/settings?tab=integrations&error=' + encodeURIComponent(error.message));
          }, 3000);
        }
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, tenant]);

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Authorization</h2>
          <p className="text-gray-600">Completing your Zoho connection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Authorization Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/settings?tab=integrations')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Return to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-green-600 text-6xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-green-900 mb-2">Authorization Complete</h2>
        <p className="text-green-600">Redirecting you back...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;