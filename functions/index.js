const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create transporter with user's SMTP credentials
const createTransporter = (smtpConfig) => {
  return nodemailer.createTransporter({
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