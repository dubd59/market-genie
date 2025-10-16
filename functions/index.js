const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { Resend } = require('resend');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create transporter with user's SMTP credentials
const createTransporter = (smtpConfig) => {
  return nodemailer.createTransport({
    host: smtpConfig.smtpHost || 'smtp.zoho.com',
    port: parseInt(smtpConfig.smtpPort) || 587,
    secure: (smtpConfig.smtpPort === '465'), // true for 465, false for other ports
    auth: {
      user: smtpConfig.smtpEmail,
      pass: smtpConfig.smtpPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Simple test function
exports.testFunction = functions.https.onCall(async (data, context) => {
  console.log('Test function called with data:', data);
  return { success: true, message: 'Test function works!', receivedData: data };
});

// Zoho Campaigns email sending function
exports.sendZohoEmail = functions.https.onCall(async (data, context) => {
  console.log('=== sendZohoEmail function called ===');
  console.log('Data received:', JSON.stringify(data, null, 2));
  
  try {
    // Validate input
    if (!data || !data.to || !data.subject || !data.content || !data.tenantId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: to, subject, content, tenantId');
    }

    // Fetch Zoho Campaigns credentials from database
    const credentialsDoc = await db
      .collection('tenants')
      .doc(data.tenantId)
      .collection('integrations')
      .doc('zoho_campaigns')
      .get();

    if (!credentialsDoc.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'Zoho Campaigns not configured. Please connect your Zoho account first.');
    }

    const credentials = credentialsDoc.data();
    const { accessToken, domain = 'com' } = credentials;
    
    if (!accessToken) {
      throw new functions.https.HttpsError('failed-precondition', 'Invalid Zoho Campaigns credentials.');
    }

    // Prepare campaign data
    const campaignData = {
      campaignname: `Test Email - ${Date.now()}`,
      fromname: data.fromName || 'Market Genie',
      subject: data.subject,
      htmlcontent: data.content,
      recipients: data.to,
      campaigntype: 'instant'
    };

    // Send via Zoho Campaigns API
    const apiUrl = `https://campaigns.zoho.${domain}/api/v1.1/json/campaigns/quickcampaign`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(campaignData)
    });

    const result = await response.json();
    
    if (response.ok && result.status === 'success') {
      console.log('Zoho email sent successfully:', result.campaign_key);
      
      return {
        success: true,
        campaignId: result.campaign_key,
        message: 'Email sent via Zoho Campaigns'
      };
    } else {
      console.error('Zoho API error:', result);
      throw new functions.https.HttpsError('internal', result.message || 'Failed to send email via Zoho Campaigns');
    }

  } catch (error) {
    console.error('=== Error in sendZohoEmail ===');
    console.error('Error message:', error.message);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to send email: ' + error.message);
  }
});

// Email sending function (new version)
exports.sendEmailV2 = functions.https.onCall(async (data, context) => {
  console.log('=== sendEmailV2 function called ===');
  console.log('Data received:', JSON.stringify(data, null, 2));
  console.log('Context auth:', context.auth ? { uid: context.auth.uid, token: context.auth.token } : 'No auth');
  console.log('Context app:', context.app ? context.app : 'No app');
  
  try {
    console.log('Function called with data keys:', Object.keys(data || {}));
    
    // Validate input
    if (!data || !data.to || !data.subject || !data.content || !data.tenantId) {
      console.log('Validation failed:', {
        hasData: !!data,
        hasTo: !!(data && data.to),
        hasSubject: !!(data && data.subject), 
        hasContent: !!(data && data.content),
        hasTenantId: !!(data && data.tenantId)
      });
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: to, subject, content, tenantId');
    }

    console.log('Looking for credentials at path:', `tenants/${data.tenantId}/integrations/zoho_mail_smtp`);

    // Fetch user's SMTP credentials from database
    const credentialsDoc = await db
      .collection('tenants')
      .doc(data.tenantId)
      .collection('integrations')
      .doc('zoho_mail_smtp')
      .get();

    console.log('Credentials doc exists:', credentialsDoc.exists);
    if (credentialsDoc.exists) {
      console.log('Credentials doc data keys:', Object.keys(credentialsDoc.data() || {}));
    }

    if (!credentialsDoc.exists) {
      throw new functions.https.HttpsError('failed-precondition', 'SMTP credentials not configured. Please configure email settings in integrations.');
    }

    const smtpConfig = credentialsDoc.data();
    
    // Validate SMTP credentials
    if (!smtpConfig.smtpEmail || !smtpConfig.smtpPassword) {
      throw new functions.https.HttpsError('failed-precondition', 'Incomplete SMTP configuration. Please check email settings.');
    }

    // Create transporter with user's credentials
    const transporter = createTransporter(smtpConfig);

    // Email options using user's credentials
    const fromName = smtpConfig.smtpFromName || 'Marketing Campaign';
    const mailOptions = {
      from: `"${fromName}" <${smtpConfig.smtpEmail}>`,
      to: data.to,
      subject: data.subject,
      html: data.content,
      text: data.content.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      from: mailOptions.from,
      to: data.to,
      subject: data.subject
    };

  } catch (error) {
    console.error('=== Error in sendEmailV2 ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to send email: ' + error.message);
  }
});

// Send email via Zoho Campaigns API using OAuth - HTTP version for testing
exports.sendCampaignEmailHTTP = functions.https.onRequest(async (req, res) => {
  console.log('=== sendCampaignEmailHTTP function called ===');
  
  // Enable CORS for all origins
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  try {
    const data = req.body;
    
    // Validate input
    if (!data || !data.to || !data.subject || !data.content || !data.tenantId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, content, tenantId' 
      });
    }

    console.log('Fetching credentials for tenant:', data.tenantId);

    // Fetch Zoho Campaigns credentials from database
    const credentialsDoc = await db
      .collection('tenants')
      .doc(data.tenantId)
      .collection('integrations')
      .doc('zoho_campaigns')
      .get();

    console.log('Credentials document exists:', credentialsDoc.exists);

    if (!credentialsDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        error: 'Zoho Campaigns not configured for this tenant' 
      });
    }

    const credentials = credentialsDoc.data();
    
    if (!credentials.accessToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Zoho Campaigns not connected - OAuth required' 
      });
    }

    let { accessToken, domain = 'com' } = credentials;
    
    // Check if token is expired and refresh if needed
    if (credentials.expiresAt && new Date(credentials.expiresAt) <= new Date()) {
      console.log('Access token expired, attempting to refresh...');
      
      if (!credentials.refreshToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'Access token expired and no refresh token available' 
        });
      }
      
      try {
        // Refresh the token
        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('client_id', credentials.clientId);
        formData.append('client_secret', credentials.clientSecret);
        formData.append('refresh_token', credentials.refreshToken);

        const tokenResponse = await axios.post('https://accounts.zoho.com/oauth/v2/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        if (tokenResponse.data.access_token) {
          accessToken = tokenResponse.data.access_token;
          
          // Update the stored credentials with new token
          const updatedCredentials = {
            ...credentials,
            accessToken: tokenResponse.data.access_token,
            expiresIn: tokenResponse.data.expires_in,
            expiresAt: new Date(Date.now() + (tokenResponse.data.expires_in * 1000)).toISOString(),
            lastUpdated: new Date().toISOString()
          };
          
          await credentialsDoc.ref.update(updatedCredentials);
          console.log('Token refreshed successfully');
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return res.status(400).json({ 
          success: false, 
          error: 'Access token expired and refresh failed. Please reconnect Zoho account.' 
        });
      }
    }
    
    // Send email via Zoho Campaigns API
    const apiUrl = `https://campaigns.zoho.${domain}/api/v1.1/json/campaigns/quickcampaign`;
    
    const campaignData = {
      campaignname: data.subject || 'Market Genie Campaign',
      fromname: data.fromName || 'Market Genie',
      subject: data.subject,
      htmlcontent: data.content,
      recipients: data.to,
      campaigntype: 'instant'
    };

    console.log('Sending campaign via Zoho API:', { apiUrl, campaignData });

    const response = await axios.post(apiUrl, campaignData, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    console.log('Zoho API response:', { status: response.status, result });

    if (response.status === 200 && result.status === 'success') {
      return res.json({ 
        success: true, 
        data: { 
          campaignId: result.campaign_key,
          message: 'Email campaign sent successfully via Zoho Campaigns'
        } 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: result.message || 'Failed to send email campaign via Zoho' 
      });
    }
    
  } catch (error) {
    console.error('Error in sendCampaignEmailHTTP:', error);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Handle axios errors specifically
    if (error.response) {
      console.error('Axios response error:', error.response.status, error.response.data);
      return res.status(500).json({ 
        success: false, 
        error: `Zoho API error: ${error.response.data?.message || error.response.statusText}` 
      });
    } else if (error.request) {
      console.error('Axios request error:', error.request);
      return res.status(500).json({ 
        success: false, 
        error: 'Network error while contacting Zoho API' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send campaign email: ' + error.message 
    });
  }
});

// Send email via Zoho Campaigns API using OAuth
exports.sendCampaignEmail = functions.https.onCall(async (data, context) => {
  console.log('=== sendCampaignEmail function called ===');
  console.log('Data received:', JSON.stringify(data, null, 2));
  console.log('Context received:', JSON.stringify(context, null, 2));
  
  try {
    // Log authentication info - more detailed
    console.log('Full context object keys:', Object.keys(context || {}));
    console.log('Auth context exists:', !!context.auth);
    console.log('Auth context:', context.auth);
    console.log('User UID:', context.auth?.uid);
    console.log('User token:', context.auth?.token);
    
    // For now, allow unauthenticated calls for testing
    if (!context.auth || !context.auth.uid) {
      console.warn('No authentication context - allowing for testing purposes');
      // Don't throw error, just log it for now
    }
    
    // Validate input
    if (!data || !data.to || !data.subject || !data.content || !data.tenantId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: to, subject, content, tenantId');
    }

    console.log('Fetching credentials for tenant:', data.tenantId);

    // Fetch Zoho Campaigns credentials from database
    const credentialsDoc = await db
      .collection('tenants')
      .doc(data.tenantId)
      .collection('integrations')
      .doc('zoho_campaigns')
      .get();

    console.log('Credentials document exists:', credentialsDoc.exists);

    if (!credentialsDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Zoho Campaigns not configured for this tenant');
    }

    const credentials = credentialsDoc.data();
    
    if (!credentials.accessToken) {
      throw new functions.https.HttpsError('failed-precondition', 'Zoho Campaigns not connected - OAuth required');
    }

    let { accessToken, domain = 'com' } = credentials;
    
    // Check if token is expired and refresh if needed
    if (credentials.expiresAt && new Date(credentials.expiresAt) <= new Date()) {
      console.log('Access token expired, attempting to refresh...');
      
      if (!credentials.refreshToken) {
        throw new functions.https.HttpsError('failed-precondition', 'Access token expired and no refresh token available');
      }
      
      try {
        // Refresh the token
        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('client_id', credentials.clientId);
        formData.append('client_secret', credentials.clientSecret);
        formData.append('refresh_token', credentials.refreshToken);

        const tokenResponse = await axios.post('https://accounts.zoho.com/oauth/v2/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        if (tokenResponse.data.access_token) {
          accessToken = tokenResponse.data.access_token;
          
          // Update the stored credentials with new token
          const updatedCredentials = {
            ...credentials,
            accessToken: tokenResponse.data.access_token,
            expiresIn: tokenResponse.data.expires_in,
            expiresAt: new Date(Date.now() + (tokenResponse.data.expires_in * 1000)).toISOString(),
            lastUpdated: new Date().toISOString()
          };
          
          await credentialsDoc.ref.update(updatedCredentials);
          console.log('Token refreshed successfully');
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new functions.https.HttpsError('failed-precondition', 'Access token expired and refresh failed. Please reconnect Zoho account.');
      }
    }
    
    // Send email via Zoho Campaigns API
    const apiUrl = `https://campaigns.zoho.${domain}/api/v1.1/json/campaigns/quickcampaign`;
    
    const campaignData = {
      campaignname: data.subject || 'Market Genie Campaign',
      fromname: data.fromName || 'Market Genie',
      subject: data.subject,
      htmlcontent: data.content,
      recipients: data.to,
      campaigntype: 'instant'
    };

    console.log('Sending campaign via Zoho API:', { apiUrl, campaignData });

    const response = await axios.post(apiUrl, campaignData, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    console.log('Zoho API response:', { status: response.status, result });

    if (response.status === 200 && result.status === 'success') {
      return { 
        success: true, 
        data: { 
          campaignId: result.campaign_key,
          message: 'Email campaign sent successfully via Zoho Campaigns'
        } 
      };
    } else {
      throw new functions.https.HttpsError('internal', result.message || 'Failed to send email campaign via Zoho');
    }
    
  } catch (error) {
    console.error('Error in sendCampaignEmail:', error);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Handle axios errors specifically
    if (error.response) {
      console.error('Axios response error:', error.response.status, error.response.data);
      throw new functions.https.HttpsError('internal', `Zoho API error: ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('Axios request error:', error.request);
      throw new functions.https.HttpsError('internal', 'Network error while contacting Zoho API');
    }
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', 'Failed to send campaign email: ' + error.message);
  }
});

// Example HTTP function
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase Functions!');
});

// FIXED version - Send email via Zoho Campaigns API using OAuth - HTTP version
exports.sendCampaignEmailFixed = functions.https.onRequest(async (req, res) => {
  console.log('=== sendCampaignEmailFixed function called ===');
  
  // Enable CORS for all origins
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  
  try {
    const data = req.body;
    
    // Validate input
    if (!data || !data.to || !data.subject || !data.content || !data.tenantId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, content, tenantId' 
      });
    }

    console.log('Fetching credentials for tenant:', data.tenantId);

    // Fetch Zoho Campaigns credentials from database
    const credentialsDoc = await db
      .collection('tenants')
      .doc(data.tenantId)
      .collection('integrations')
      .doc('zoho_campaigns')
      .get();

    console.log('Credentials document exists:', credentialsDoc.exists);

    if (!credentialsDoc.exists) {
      return res.status(400).json({ 
        success: false, 
        error: 'Zoho Campaigns not configured for this tenant' 
      });
    }

    const credentials = credentialsDoc.data();
    
    if (!credentials.accessToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Zoho Campaigns not connected - OAuth required' 
      });
    }

    let { accessToken, domain = 'com' } = credentials;
    
    // Check if token is expired and refresh if needed
    if (credentials.expiresAt && new Date(credentials.expiresAt) <= new Date()) {
      console.log('Access token expired, attempting to refresh...');
      
      if (!credentials.refreshToken) {
        return res.status(400).json({ 
          success: false, 
          error: 'Access token expired and no refresh token available' 
        });
      }
      
      try {
        // Refresh the token
        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('client_id', credentials.clientId);
        formData.append('client_secret', credentials.clientSecret);
        formData.append('refresh_token', credentials.refreshToken);

        const tokenResponse = await axios.post('https://accounts.zoho.com/oauth/v2/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        if (tokenResponse.data.access_token) {
          accessToken = tokenResponse.data.access_token;
          
          // Update the stored credentials with new token
          const updatedCredentials = {
            ...credentials,
            accessToken: tokenResponse.data.access_token,
            expiresIn: tokenResponse.data.expires_in,
            expiresAt: new Date(Date.now() + (tokenResponse.data.expires_in * 1000)).toISOString(),
            lastUpdated: new Date().toISOString()
          };
          
          await credentialsDoc.ref.update(updatedCredentials);
          console.log('Token refreshed successfully');
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return res.status(400).json({ 
          success: false, 
          error: 'Access token expired and refresh failed. Please reconnect Zoho account.' 
        });
      }
    }
    
    // Use corrected Zoho Campaigns API format
    console.log('Sending via Zoho Campaigns API with corrected format...');
    
    const apiUrl = `https://campaigns.zoho.${domain}/api/v1.1/json/campaigns/quickcampaign`;
    
    const campaignData = {
      campaignname: `${data.subject} - ${Date.now()}`,
      fromname: data.fromName || 'Market Genie',
      subject: data.subject,
      htmlcontent: data.content,
      recipients: [data.to], // Recipients as array
      campaigntype: 'instant'
    };

    console.log('Sending campaign via Zoho API (corrected):', { apiUrl, campaignData });

    const response = await axios.post(apiUrl, campaignData, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = response.data;
    console.log('Zoho Campaigns API response:', { status: response.status, result });

    if (response.status === 200 && result.status === 'success') {
      return res.json({ 
        success: true, 
        data: { 
          campaignId: result.campaign_key,
          message: 'Email campaign sent successfully via Zoho Campaigns'
        } 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        error: `Zoho Campaigns API error: ${result.message || 'Unknown error'}`,
        details: result
      });
    }
    
  } catch (error) {
    console.error('Error in sendCampaignEmailFixed:', error);
    
    // Handle axios errors specifically
    if (error.response) {
      console.error('Axios response error:', error.response.status, error.response.data);
      return res.status(500).json({ 
        success: false, 
        error: `API error: ${error.response.data?.message || error.response.statusText}`,
        details: error.response.data
      });
    } else if (error.request) {
      console.error('Axios request error:', error.request);
      return res.status(500).json({ 
        success: false, 
        error: 'Network error while contacting Zoho API' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send campaign email: ' + error.message 
    });
  }
});

// Kit (formerly ConvertKit) V4 API email sending function
exports.sendCampaignEmailKit = functions.https.onRequest(async (req, res) => {
  console.log('=== sendCampaignEmailKit function called ===');
  
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  
  try {
    const { to, subject, content, tenantId } = req.body;
    
    // Validate input
    if (!to || !subject || !content || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, content, tenantId'
      });
    }
    
    console.log('Fetching Kit credentials for tenant:', tenantId);
    
    // Fetch Kit credentials from database
    const credentialsDoc = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('kit')
      .get();
    
    console.log('Credentials document exists:', credentialsDoc.exists);
    
    if (!credentialsDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Kit credentials not found for tenant'
      });
    }
    
    const credentials = credentialsDoc.data();
    console.log('Retrieved data keys:', Object.keys(credentials));
    console.log('Data status:', credentials.status);
    console.log('Has apiKey:', !!credentials.apiKey);
    
    if (!credentials.apiKey || credentials.status !== 'connected') {
      return res.status(400).json({
        success: false,
        error: 'Kit API key not found or not connected'
      });
    }
    
    console.log('Sending via Kit V4 API...');
    
    // Prepare Kit broadcast data
    const broadcastData = {
      content: content,
      description: `Campaign: ${subject}`,
      public: false,
      published_at: new Date().toISOString(),
      send_at: new Date().toISOString(),
      subject: subject,
      subscriber_filter: {
        email_address: to
      }
    };
    
    console.log('Sending broadcast via Kit V4 API:', {
      apiUrl: 'https://api.kit.com/v4/broadcasts',
      broadcastData: broadcastData
    });
    
    // Send broadcast via Kit V4 API
    const response = await axios.post(
      'https://api.kit.com/v4/broadcasts',
      broadcastData,
      {
        headers: {
          'X-Kit-Api-Key': credentials.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('Kit V4 API response:', {
      status: response.status,
      data: response.data
    });
    
    if (response.status === 200 || response.status === 201) {
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully via Kit',
        broadcastId: response.data.id || 'unknown'
      });
    } else {
      console.error('Kit API error response:', response.data);
      return res.status(500).json({
        success: false,
        error: 'Kit API error: ' + (response.data.message || 'Unknown error'),
        details: response.data
      });
    }
    
  } catch (error) {
    console.error('Error in sendCampaignEmailKit:', error);
    
    if (error.response) {
      console.error('Kit API error response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      return res.status(500).json({
        success: false,
        error: 'Kit API error: ' + (error.response.data?.message || error.response.statusText),
        details: error.response.data
      });
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(500).json({
        success: false,
        error: 'Timeout while contacting Kit API'
      });
    }
    
    if (error.code && error.code.startsWith('E')) {
      return res.status(500).json({
        success: false,
        error: 'Network error while contacting Kit API'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send campaign email: ' + error.message
    });
  }
});

// Resend API email sending function
exports.sendCampaignEmailResend = functions.https.onRequest(async (req, res) => {
  console.log('=== sendCampaignEmailResend function called ===');
  
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);
  
  try {
    const { to, subject, content, tenantId } = req.body;
    
    // Validate input
    if (!to || !subject || !content || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, content, tenantId'
      });
    }
    
    console.log('Fetching Resend credentials for tenant:', tenantId);
    
    // Fetch Resend credentials from database
    const credentialsDoc = await db
      .collection('tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('resend')
      .get();
    
    console.log('Credentials document exists:', credentialsDoc.exists);
    
    if (!credentialsDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Resend credentials not found for tenant'
      });
    }
    
    const credentials = credentialsDoc.data();
    console.log('Retrieved data keys:', Object.keys(credentials));
    console.log('Data status:', credentials.status);
    console.log('Has apiKey:', !!credentials.apiKey);
    
    if (!credentials.apiKey || credentials.status !== 'connected') {
      return res.status(400).json({
        success: false,
        error: 'Resend API key not found or not connected'
      });
    }
    
    console.log('Sending via Resend SDK...');
    
    // Initialize Resend with the tenant's API key
    const resend = new Resend(credentials.apiKey);
    
    // Prepare Resend email data
    const emailData = {
      from: 'Market Genie <onboarding@resend.dev>', // Use verified Resend domain
      to: [to],
      subject: subject,
      html: content.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
      text: content // Plain text version
    };
    
    console.log('Sending email via Resend SDK:', {
      emailData: emailData
    });
    
    // Send email via Resend SDK
    const result = await resend.emails.send(emailData);
    
    console.log('Resend SDK response:', result);
    
    if (result.data && result.data.id) {
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully via Resend',
        emailId: result.data.id
      });
    } else if (result.error) {
      console.error('Resend SDK error:', result.error);
      
      // Check if this is a domain verification error
      const errorMessage = result.error.message || '';
      if (errorMessage.includes('You can only send testing emails to your own email address')) {
        return res.status(400).json({
          success: false,
          error: 'Domain not verified: You can only send test emails to your own email address (dubdproducts@gmail.com) until you verify a domain at resend.com/domains',
          details: result.error,
          suggestion: 'To send to any email address, please verify your domain in Resend dashboard'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Resend API error: ' + errorMessage,
        details: result.error
      });
    } else {
      console.error('Unexpected Resend response:', result);
      return res.status(500).json({
        success: false,
        error: 'Unexpected response from Resend API',
        details: result
      });
    }
    
  } catch (error) {
    console.error('Error in sendCampaignEmailResend:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send campaign email: ' + error.message
    });
  }
});

// Test Resend API connection
exports.testResendConnection = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  console.log('=== testResendConnection function called ===');
  
  try {
    // Verify authentication
    const authToken = req.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization token'
      });
    }
    
    const idToken = authToken.split('Bearer ')[1];
    
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
    
    // Get API key from request body
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    // Validate API key format (Resend keys start with "re_")
    if (!apiKey.startsWith('re_')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Resend API key format. Keys must start with "re_"'
      });
    }
    
    console.log('Testing Resend API with key:', apiKey.substring(0, 10) + '...');
    
    try {
      // First try to get domains (works with full access keys)
      const response = await axios.get('https://api.resend.com/domains', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Resend API response:', response.data);
      
      return res.status(200).json({
        success: true,
        data: {
          name: 'Resend Account',
          domains: response.data.data ? response.data.data.length : 0,
          apiKeyValid: true,
          keyType: 'full_access'
        },
        message: 'Resend API connection successful'
      });
      
    } catch (domainError) {
      // If domains call fails, check if it's a restricted key
      if (domainError.response && domainError.response.status === 401) {
        const errorData = domainError.response.data;
        
        if (errorData && errorData.name === 'restricted_api_key') {
          // This is a restricted key that can only send emails
          console.log('Detected restricted API key - can only send emails');
          
          return res.status(200).json({
            success: true,
            data: {
              name: 'Resend Account (Restricted)',
              domains: 0,
              apiKeyValid: true,
              keyType: 'restricted',
              restriction: 'This key can only send emails'
            },
            message: 'Resend API key validated (restricted to sending only)'
          });
        }
      }
      
      // Re-throw other errors to be handled by outer catch
      throw domainError;
    }
    
  } catch (error) {
    console.error('Error testing Resend connection:', error);
    
    if (error.response) {
      // Resend API error
      const status = error.response.status;
      const message = error.response.data?.message || 'Invalid API key';
      
      return res.status(400).json({
        success: false,
        error: `Resend API error (${status}): ${message}`
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to test Resend connection: ' + error.message
    });
  }
});

// Simple SMTP Email Function - Works with any email provider (Zoho, Gmail, etc.)
exports.sendCampaignEmailSMTP = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  console.log('=== sendCampaignEmailSMTP function called ===');
  
  try {
    // Verify authentication
    const authToken = req.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization token'
      });
    }
    
    const idToken = authToken.split('Bearer ')[1];
    
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
    
    const { to, subject, content, tenantId } = req.body;
    
    // Validate input
    if (!to || !subject || !content || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, content, tenantId'
      });
    }
    
    console.log('Fetching SMTP credentials for tenant:', tenantId);
    
    // Fetch Gmail SMTP credentials from database (stored in gmail integration)
    const credentialsDoc = await db
      .collection('MarketGenie_tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('gmail')
      .get();
    
    if (!credentialsDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Gmail SMTP credentials not configured. Please set up Gmail in integrations.',
        setup: 'Go to Integrations → Gmail → Add your email and app password'
      });
    }
    
    const credentials = credentialsDoc.data();
    console.log('Gmail SMTP credentials found for:', credentials.email);
    
    // Prepare Gmail SMTP configuration
    const smtpConfig = {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpEmail: credentials.email,
      smtpPassword: credentials.appPassword || credentials.password
    };
    
    if (!smtpConfig.smtpEmail || !smtpConfig.smtpPassword) {
      return res.status(400).json({
        success: false,
        error: 'Gmail credentials missing. Please add your Gmail email and app password.',
        setup: 'Generate app password at: myaccount.google.com/apppasswords'
      });
    }
    
    console.log('Creating SMTP transporter for:', smtpConfig.smtpEmail);
    
    // Fetch business profile for sender name
    let senderName = 'Market Genie';
    try {
      const businessProfileDoc = await db
        .collection('userData')
        .doc(`${tenantId}_businessProfile`)
        .get();
      
      if (businessProfileDoc.exists) {
        const businessInfo = businessProfileDoc.data().businessInfo;
        if (businessInfo && businessInfo.companyName) {
          senderName = businessInfo.companyName;
          console.log('Using business profile sender name:', senderName);
        } else {
          console.log('No company name found in business profile');
        }
      } else {
        console.log('No business profile document found');
      }
    } catch (error) {
      console.warn('Could not fetch business profile for sender name:', error);
    }
    
    // Create SMTP transporter
    const transporter = createTransporter(smtpConfig);
    
    // Prepare email
    const mailOptions = {
      from: `"${senderName}" <${smtpConfig.smtpEmail}>`,
      to: to,
      subject: subject,
      text: content.replace(/<[^>]*>/g, ''), // Strip HTML for plain text version
      html: content // Use content as-is since it's already HTML formatted
    };
    
    console.log('Sending email via SMTP...');
    
    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log('SMTP email sent successfully:', result.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully via SMTP',
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('Error in sendCampaignEmailSMTP:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send email via SMTP: ' + error.message
    });
  }
});

// Test Gmail SMTP Connection - Debug function
exports.testGmailConnection = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  console.log('=== testGmailConnection function called ===');
  
  try {
    // Verify authentication
    const authToken = req.get('Authorization');
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization token'
      });
    }
    
    const idToken = authToken.split('Bearer ')[1];
    
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
    
    const { tenantId } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing tenantId'
      });
    }
    
    console.log('Testing Gmail connection for tenant:', tenantId);
    
    // Check if Gmail credentials exist
    const credentialsDoc = await db
      .collection('MarketGenie_tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('gmail')
      .get();
    
    if (!credentialsDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Gmail credentials not found. Please configure Gmail in integrations first.',
        debug: {
          credentialsPath: `/tenants/${tenantId}/integrations/gmail`,
          exists: false
        }
      });
    }
    
    const credentials = credentialsDoc.data();
    console.log('Gmail credentials found:', {
      email: credentials.email,
      hasAppPassword: !!credentials.appPassword,
      appPasswordLength: credentials.appPassword ? credentials.appPassword.length : 0
    });
    
    // Test SMTP configuration
    const smtpConfig = {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpEmail: credentials.email,
      smtpPassword: credentials.appPassword || credentials.password
    };
    
    if (!smtpConfig.smtpEmail || !smtpConfig.smtpPassword) {
      return res.status(400).json({
        success: false,
        error: 'Gmail credentials incomplete',
        debug: {
          hasEmail: !!smtpConfig.smtpEmail,
          hasPassword: !!smtpConfig.smtpPassword,
          email: smtpConfig.smtpEmail
        }
      });
    }
    
    // Create test transporter
    const transporter = createTransporter(smtpConfig);
    
    // Verify SMTP connection
    console.log('Testing SMTP connection...');
    await transporter.verify();
    
    console.log('Gmail SMTP connection test successful');
    
    return res.status(200).json({
      success: true,
      message: 'Gmail SMTP connection test successful',
      debug: {
        email: credentials.email,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        connectionVerified: true
      }
    });
    
  } catch (error) {
    console.error('Error in testGmailConnection:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Gmail connection test failed: ' + error.message,
      debug: {
        errorType: error.name,
        errorCode: error.code
      }
    });
  }
});

// Process unsubscribe requests
exports.processUnsubscribe = functions.https.onRequest(async (req, res) => {
  console.log('=== processUnsubscribe function called ===');
  
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; text-align: center;">
              <h2 style="color: #ef4444;">Invalid Unsubscribe Link</h2>
              <p>The unsubscribe link appears to be invalid or expired.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Decode the token
    let tokenData;
    try {
      const decodedToken = atob(token);
      tokenData = JSON.parse(decodedToken);
    } catch (error) {
      console.error('Invalid token format:', error);
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; text-align: center;">
              <h2 style="color: #ef4444;">Invalid Token</h2>
              <p>The unsubscribe token is malformed.</p>
            </div>
          </body>
        </html>
      `);
    }

    const { tenantId, email } = tokenData;
    
    if (!tenantId || !email) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; text-align: center;">
              <h2 style="color: #ef4444;">Invalid Token Data</h2>
              <p>Required information is missing from the unsubscribe token.</p>
            </div>
          </body>
        </html>
      `);
    }

    console.log('Processing unsubscribe for:', email, 'in tenant:', tenantId);
    console.log('📍 Firebase paths being used:');
    console.log('📍 Contacts path: userData/' + tenantId + '_crm_contacts');
    console.log('📍 Unsubscribes path: userData/' + tenantId + '_unsubscribes');

    // Remove from contacts (CRM)
    try {
      const contactsQuery = await db
        .collection('userData')
        .doc(`${tenantId}_crm_contacts`)
        .get();
      
      if (contactsQuery.exists) {
        const contactsData = contactsQuery.data();
        const contacts = contactsData.contacts || [];
        
        console.log('📊 BEFORE REMOVAL - Total contacts:', contacts.length);
        console.log('📧 Looking for email to remove:', email);
        
        // Filter out the unsubscribing email
        const updatedContacts = contacts.filter(contact => 
          contact.email && contact.email.toLowerCase() !== email.toLowerCase()
        );
        
        console.log('📊 AFTER REMOVAL - Total contacts:', updatedContacts.length);
        console.log('📉 Contacts removed:', contacts.length - updatedContacts.length);
        
        // Update the contacts collection
        await db
          .collection('userData')
          .doc(`${tenantId}_crm_contacts`)
          .set({ contacts: updatedContacts });
        
        console.log('✅ Successfully updated contacts collection');
        console.log('Removed contact from CRM:', email);
      }
    } catch (error) {
      console.error('Error removing from contacts:', error);
    }

    // Add to unsubscribe log for tracking
    try {
      await db
        .collection('userData')
        .doc(`${tenantId}_unsubscribes`)
        .set({
          unsubscribes: admin.firestore.FieldValue.arrayUnion({
            email: email,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            tokenData: tokenData
          })
        }, { merge: true });
        
      console.log('Added to unsubscribe log:', email);
    } catch (error) {
      console.error('Error logging unsubscribe:', error);
    }

    // Return success page
    return res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; text-align: center;">
            <div style="color: #10b981; font-size: 48px; margin-bottom: 20px;">✓</div>
            <h2 style="color: #10b981; margin-bottom: 20px;">Successfully Unsubscribed</h2>
            <p style="color: #6b7280; margin-bottom: 30px;">
              The email address <strong>${email}</strong> has been successfully removed from all marketing communications.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              You will no longer receive emails from this sender. If you continue to receive emails, please contact support.
            </p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
              Powered by MarketGenie
            </div>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error in processUnsubscribe:', error);
    return res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; text-align: center;">
            <h2 style="color: #ef4444;">Error Processing Request</h2>
            <p>An error occurred while processing your unsubscribe request. Please try again or contact support.</p>
          </div>
        </body>
      </html>
    `);
  }
});