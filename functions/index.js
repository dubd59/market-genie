const {onRequest} = require('firebase-functions/v2/https');
const {onDocumentCreated} = require('firebase-functions/v2/firestore');
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {onSchedule} = require('firebase-functions/v2/scheduler');
const functions = require('firebase-functions'); // Keep for backward compatibility
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { Resend } = require('resend');

// Import lead generation proxy
const { leadGenProxy } = require('./leadGenProxy');

// Import Gmail bounce detection functions
const { scanGmailBounces, processBounces } = require('./gmailBounceDetection');

// Export lead generation proxy
exports.leadGenProxy = leadGenProxy;

// Export Gmail bounce detection functions
exports.scanGmailBounces = scanGmailBounces;
exports.processBounces = processBounces;

// Function to create founder tenant document
exports.createFounderTenant = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Creating founder tenant document...');
    
    // Create the founder-tenant document
    const founderTenantData = {
      id: 'founder-tenant',
      tenantId: 'founder-tenant',
      name: 'Market Genie Founder',
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      ownerEmail: 'dubdproducts@gmail.com',
      type: 'founder',
      status: 'active',
      initialized: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      plan: 'unlimited',
      features: {
        maxLeads: -1,
        maxUsers: -1,
        maxIntegrations: -1,
        advancedFeatures: true
      }
    };
    
    // Write the document
    await db.collection('MarketGenie_tenants').doc('founder-tenant').set(founderTenantData);
    
    console.log('Founder tenant document created successfully');
    
    // Verify it was created
    const createdDoc = await db.collection('MarketGenie_tenants').doc('founder-tenant').get();
    
    if (createdDoc.exists) {
      console.log('Verification successful:', createdDoc.data());
      
      res.status(200).json({
        success: true,
        message: 'Founder tenant document created successfully',
        data: createdDoc.data()
      });
    } else {
      throw new Error('Document was not created properly');
    }
    
  } catch (error) {
    console.error('Error creating founder tenant:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Function to copy integrations from old tenant to founder tenant
exports.copyIntegrationsToFounder = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Copying integrations from old tenant to founder tenant...');
    
    const oldTenantId = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
    const newTenantId = 'founder-tenant';
    
    // Get all integrations from old tenant
    const integrationsRef = db.collection('MarketGenie_tenants').doc(oldTenantId).collection('integrations');
    const integrationsSnapshot = await integrationsRef.get();
    
    let copiedCount = 0;
    const copiedIntegrations = [];
    
    if (!integrationsSnapshot.empty) {
      console.log(`Found ${integrationsSnapshot.size} integrations to copy`);
      
      // Copy each integration
      for (const doc of integrationsSnapshot.docs) {
        const integrationData = doc.data();
        const integrationId = doc.id;
        
        console.log(`Copying integration: ${integrationId}`);
        
        // Write to new tenant
        await db.collection('MarketGenie_tenants')
          .doc(newTenantId)
          .collection('integrations')
          .doc(integrationId)
          .set(integrationData);
        
        copiedCount++;
        copiedIntegrations.push({
          id: integrationId,
          name: integrationData.name || integrationId,
          status: integrationData.status || 'active'
        });
      }
    }
    
    console.log(`Successfully copied ${copiedCount} integrations`);
    
    res.status(200).json({
      success: true,
      message: `Successfully copied ${copiedCount} integrations to founder tenant`,
      copiedCount,
      integrations: copiedIntegrations
    });
    
  } catch (error) {
    console.error('Error copying integrations:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// 🎯 CRITICAL: Set tenant custom claims for new users
exports.setUserTenantClaims = onCall(async (request) => {
  // Verify the user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid, tenantId } = request.data;
  const callerUid = request.auth.uid;

  // Users can only set claims for themselves
  if (uid !== callerUid) {
    throw new HttpsError('permission-denied', 'Can only set claims for yourself');
  }

  try {
    console.log(`Setting tenant claims for user ${uid}: tenantId=${tenantId}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      tenantId: tenantId,
      role: 'user',
      updatedAt: Date.now()
    });

    console.log(`✅ Successfully set tenant claims for user ${uid}`);
    
    return {
      success: true,
      message: 'Tenant claims set successfully',
      tenantId: tenantId
    };
    
  } catch (error) {
    console.error('Error setting tenant claims:', error);
    throw new HttpsError('internal', `Failed to set tenant claims: ${error.message}`);
  }
});

// 🎯 CRITICAL: Auto-set tenant claims when user creates tenant
exports.onTenantCreated = onDocumentCreated('MarketGenie_tenants/{tenantId}', async (event) => {
  try {
    const tenantData = event.data.data();
    const tenantId = event.params.tenantId;
    const ownerId = tenantData.ownerId;

      if (!ownerId) {
        console.log('No ownerId found in tenant data, skipping claims setup');
        return;
      }

      console.log(`Auto-setting tenant claims for owner ${ownerId} of tenant ${tenantId}`);
      
      // Set custom claims for the tenant owner
      await admin.auth().setCustomUserClaims(ownerId, {
        tenantId: tenantId,
        role: 'owner',
        updatedAt: Date.now()
      });

      console.log(`✅ Auto-set tenant claims for user ${ownerId}`);
      
    } catch (error) {
      console.error('Error auto-setting tenant claims:', error);
    }
  });

// 🛠️ ADMIN: Fix existing user claims (call manually)
exports.fixUserClaims = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { userId, tenantId } = req.body;
    
    if (!userId || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'userId and tenantId are required'
      });
    }

    console.log(`Fixing claims for user ${userId}: tenantId=${tenantId}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, {
      tenantId: tenantId,
      role: 'user',
      updatedAt: Date.now()
    });

    console.log(`✅ Fixed claims for user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'User claims fixed successfully',
      userId: userId,
      tenantId: tenantId
    });
    
  } catch (error) {
    console.error('Error fixing user claims:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create transporter with user's SMTP credentials
const createTransporter = (smtpConfig) => {
  console.log('Creating transporter for:', smtpConfig.smtpEmail);
  console.log('Using host:', smtpConfig.smtpHost || 'smtp.gmail.com');
  console.log('Using port:', parseInt(smtpConfig.smtpPort) || 587);
  
  // Enhanced configuration for Google Workspace and Gmail
  const transportConfig = {
    host: smtpConfig.smtpHost || 'smtp.gmail.com',
    port: parseInt(smtpConfig.smtpPort) || 587,
    secure: (smtpConfig.smtpPort === '465'), // true for 465, false for other ports
    auth: {
      user: smtpConfig.smtpEmail,
      pass: smtpConfig.smtpPassword
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    // Additional options for Google Workspace
    requireTLS: true,
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: true, // Enable debug logging
    logger: console // Use console for logging
  };
  
  // Special handling for Google Workspace domains
  if (smtpConfig.smtpEmail && !smtpConfig.smtpEmail.endsWith('@gmail.com')) {
    console.log('Detected potential Google Workspace account');
    // Use Gmail SMTP for Google Workspace
    transportConfig.host = 'smtp.gmail.com';
    transportConfig.port = 587;
    transportConfig.secure = false;
  }
  
  return nodemailer.createTransport(transportConfig);
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
    
    const credentialsPath = `MarketGenie_tenants/${tenantId}/integrations/gmail`;
    console.log('Fetching SMTP credentials for tenant:', tenantId);
    console.log('Firestore path for credentials:', credentialsPath);
    
    // Fetch Gmail SMTP credentials from database (stored in gmail integration)
    const credentialsDoc = await db
      .collection('MarketGenie_tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('gmail')
      .get();
    
    if (!credentialsDoc.exists) {
      console.error('No credentials found at path:', credentialsPath);
      return res.status(400).json({
        success: false,
        error: 'Gmail SMTP credentials not configured. Please set up Gmail in integrations.',
        setup: 'Go to Integrations → Gmail → Add your email and app password',
        debug: { credentialsPath, exists: false }
      });
    }
    
    const credentials = credentialsDoc.data();
    console.log('Gmail SMTP credentials found:', credentials);
    if (credentials && credentials.email) {
      console.log('Using sender email:', credentials.email);
    } else {
      console.warn('No sender email found in credentials:', credentials);
    }
    
    // Prepare Gmail/Google Workspace SMTP configuration
    const smtpConfig = {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpEmail: credentials.email,
      smtpPassword: credentials.appPassword || credentials.password
    };
    
    if (!smtpConfig.smtpEmail || !smtpConfig.smtpPassword) {
      return res.status(400).json({
        success: false,
        error: 'Gmail/Google Workspace credentials missing. Please add your email and app password.',
        setup: 'For Google Workspace: 1) Enable 2FA, 2) Generate app password at myaccount.google.com/apppasswords, 3) Use your full workspace email'
      });
    }
    
    // Validate Google Workspace setup
    if (!smtpConfig.smtpEmail.endsWith('@gmail.com')) {
      console.log('Google Workspace account detected:', smtpConfig.smtpEmail);
      console.log('Ensure 2FA is enabled and app password is correctly generated');
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
    console.log('Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    // Test connection first
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP connection verification failed:', verifyError);
      
      // Provide specific error messages for common issues
      let errorMessage = 'SMTP connection failed: ' + verifyError.message;
      let helpMessage = '';
      
      if (verifyError.code === 'EAUTH' || verifyError.responseCode === 535) {
        errorMessage = 'Gmail/Google Workspace authentication failed';
        helpMessage = 'Please check: 1) 2-Factor Authentication is enabled, 2) App Password is correctly generated at myaccount.google.com/apppasswords, 3) Using your full workspace email address';
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        help: helpMessage,
        details: verifyError.message
      });
    }
    
    // Send email (with structured error handling for common SMTP responses)
    let result;
    try {
      result = await transporter.sendMail(mailOptions);
      console.log('SMTP email sent successfully:', result.messageId);

      return res.status(200).json({
        success: true,
        message: 'Email sent successfully via SMTP',
        messageId: result.messageId
      });
    } catch (sendError) {
      console.error('SMTP send failed:', sendError);
      const respCode = sendError && (sendError.responseCode || sendError.code || '');
      const msg = sendError && sendError.message ? sendError.message : String(sendError);

      // Gmail daily sending limit (550)
      if (msg.includes('Daily user sending limit') || respCode === 550) {
        return res.status(429).json({
          success: false,
          code: 'SMTP_QUOTA',
          message: 'Daily user sending limit exceeded for authenticated account',
          suggestion: 'Try again tomorrow or configure SMTP relay in Google Workspace Admin console, or use a transactional email provider (Resend, SendGrid)',
          details: msg
        });
      }

      // Authentication failures (535 / EAUTH)
      if (respCode === 535 || msg.toLowerCase().includes('authentication') || msg.toLowerCase().includes('auth')) {
        return res.status(401).json({
          success: false,
          code: 'SMTP_AUTH',
          message: 'SMTP authentication failed for the provided credentials',
          suggestion: 'Ensure 2-Step Verification is enabled and the app password is correct (or use OAuth/SMTP relay)',
          details: msg
        });
      }

      // Fallback: return generic error
      return res.status(500).json({
        success: false,
        error: 'Failed to send email via SMTP',
        details: msg
      });
    }
    
  } catch (error) {
    console.error('Error in sendCampaignEmailSMTP:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send email via SMTP: ' + error.message
    });
  }
});

// ============================================
// Gmail API Sending (OAuth) - Higher limits!
// ============================================
exports.sendCampaignEmailGmailAPI = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  console.log('=== sendCampaignEmailGmailAPI function called ===');
  
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
    
    if (!to || !subject || !content || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, content, tenantId'
      });
    }
    
    console.log('Fetching Gmail OAuth credentials for tenant:', tenantId);
    
    // Fetch Gmail OAuth credentials
    const credentialsDoc = await db
      .collection('MarketGenie_tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('gmail')
      .get();
    
    if (!credentialsDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'Gmail not configured. Please connect Gmail in integrations.'
      });
    }
    
    const credentials = credentialsDoc.data();
    
    // Check if OAuth tokens are available
    if (!credentials.accessToken || !credentials.refreshToken) {
      console.log('No OAuth tokens found, falling back to SMTP');
      return res.status(400).json({
        success: false,
        error: 'Gmail OAuth not connected. Please use "Connect with Google" button.',
        fallbackToSMTP: true
      });
    }
    
    let accessToken = credentials.accessToken;
    
    // Refresh token if needed (tokens expire after 1 hour)
    const CLIENT_ID = '1023666208479-besa8q2moobncp0ih4njtop8a95htop9.apps.googleusercontent.com';
    const CLIENT_SECRET = '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';
    
    try {
      // Always try to refresh token to ensure it's valid
      console.log('Refreshing Gmail access token...');
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', 
        new URLSearchParams({
          refresh_token: credentials.refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token'
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
      
      accessToken = tokenResponse.data.access_token;
      console.log('Access token refreshed successfully');
      
      // Update stored access token
      await db
        .collection('MarketGenie_tenants')
        .doc(tenantId)
        .collection('integrations')
        .doc('gmail')
        .update({
          accessToken: accessToken,
          tokenRefreshedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
      return res.status(401).json({
        success: false,
        error: 'Gmail token expired. Please reconnect Gmail.',
        code: 'GMAIL_TOKEN_EXPIRED'
      });
    }
    
    // Get user email from Gmail API
    let senderEmail = credentials.email;
    if (!senderEmail) {
      try {
        const profileResponse = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        senderEmail = profileResponse.data.emailAddress;
        
        // Store email for future reference
        await db
          .collection('MarketGenie_tenants')
          .doc(tenantId)
          .collection('integrations')
          .doc('gmail')
          .update({ email: senderEmail });
          
      } catch (profileError) {
        console.error('Could not get user profile:', profileError.message);
        return res.status(400).json({
          success: false,
          error: 'Could not retrieve Gmail profile'
        });
      }
    }
    
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
        }
      }
    } catch (error) {
      console.warn('Could not fetch business profile:', error);
    }
    
    // Build the email message in RFC 2822 format
    const emailLines = [
      `From: "${senderName}" <${senderEmail}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      content
    ];
    
    const email = emailLines.join('\r\n');
    
    // Encode to base64url
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    // Send via Gmail API
    console.log('Sending email via Gmail API...');
    console.log('From:', senderEmail, 'To:', to, 'Subject:', subject);
    
    try {
      const sendResponse = await axios.post(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        { raw: encodedEmail },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Email sent successfully via Gmail API');
      console.log('Message ID:', sendResponse.data.id);
      
      return res.status(200).json({
        success: true,
        messageId: sendResponse.data.id,
        method: 'gmail_api',
        from: senderEmail
      });
      
    } catch (sendError) {
      console.error('Gmail API send error:', sendError.response?.data || sendError.message);
      
      const errorMessage = sendError.response?.data?.error?.message || sendError.message;
      
      // Check for specific errors
      if (errorMessage.includes('Daily Limit Exceeded') || errorMessage.includes('rateLimitExceeded')) {
        return res.status(429).json({
          success: false,
          error: 'Daily sending limit reached. Try again tomorrow.',
          code: 'GMAIL_API_QUOTA'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to send email via Gmail API: ' + errorMessage
      });
    }
    
  } catch (error) {
    console.error('Error in sendCampaignEmailGmailAPI:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email: ' + error.message
    });
  }
});

// ============================================
// SendGrid Email Sending - Best for bulk!
// ============================================
exports.sendEmailViaSendGrid = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  console.log('=== sendEmailViaSendGrid function called ===');
  
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
    
    if (!to || !subject || !content || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, content, tenantId'
      });
    }
    
    console.log('Fetching SendGrid API key for tenant:', tenantId);
    
    // Fetch SendGrid credentials
    const credentialsDoc = await db
      .collection('MarketGenie_tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('sendgrid')
      .get();
    
    if (!credentialsDoc.exists) {
      return res.status(400).json({
        success: false,
        error: 'SendGrid not configured. Please connect SendGrid in integrations.'
      });
    }
    
    const credentials = credentialsDoc.data();
    
    if (!credentials.apiKey) {
      return res.status(400).json({
        success: false,
        error: 'SendGrid API key not found. Please reconnect SendGrid.'
      });
    }
    
    console.log('Sending email via SendGrid to:', to);
    
    // Get the from email - check multiple sources
    let fromEmail = null;
    let fromName = 'Dub D Digital Products';
    
    // Try to get Gmail connection for sender info
    const gmailDoc = await db
      .collection('MarketGenie_tenants')
      .doc(tenantId)
      .collection('integrations')
      .doc('gmail')
      .get();
    
    if (gmailDoc.exists) {
      const gmailData = gmailDoc.data();
      console.log('Gmail doc data keys:', Object.keys(gmailData));
      
      // Check various possible email field names
      fromEmail = gmailData.email || gmailData.userEmail || gmailData.account || gmailData.senderEmail;
      
      if (fromEmail) {
        fromName = fromEmail.split('@')[0];
        console.log('Using email from Gmail doc:', fromEmail);
      }
    }
    
    // If still no email, use the verified SendGrid sender
    if (!fromEmail) {
      fromEmail = 'ddub@dubdproducts.com';  // Your verified sender
      fromName = 'Dub D Digital Products';
      console.log('Using hardcoded verified sender:', fromEmail);
    }
    
    console.log('Final from email:', fromEmail);
    
    // Prepare SendGrid API request
    const sendgridPayload = {
      personalizations: [{
        to: [{ email: to }]
      }],
      from: { 
        email: fromEmail,
        name: fromName
      },
      subject: subject,
      content: [{
        type: 'text/html',
        value: content
      }]
    };
    
    // Send via SendGrid API
    const sendgridResponse = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      sendgridPayload,
      {
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // SendGrid returns 202 for success
    if (sendgridResponse.status === 202 || sendgridResponse.status === 200) {
      console.log('✅ Email sent via SendGrid to:', to);
      return res.status(200).json({
        success: true,
        method: 'sendgrid',
        to: to,
        from: fromEmail
      });
    } else {
      console.error('SendGrid returned unexpected status:', sendgridResponse.status);
      return res.status(400).json({
        success: false,
        error: 'SendGrid returned status: ' + sendgridResponse.status
      });
    }
    
  } catch (error) {
    console.error('Error in sendEmailViaSendGrid:', error.response?.data || error.message);
    
    let errorMessage = error.message;
    if (error.response?.data?.errors) {
      errorMessage = error.response.data.errors.map(e => e.message).join(', ');
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send via SendGrid: ' + errorMessage
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
    
    // First, get the tenant owner (user ID) from the tenant ID
    let userId = tenantId; // Default fallback
    try {
      const tenantDoc = await db.collection('MarketGenie_tenants').doc(tenantId).get();
      if (tenantDoc.exists) {
        const tenantData = tenantDoc.data();
        userId = tenantData.ownerId || tenantId;
        console.log('📍 Found tenant owner ID:', userId);
      } else {
        console.log('⚠️ Tenant document not found, using tenantId as userId');
      }
    } catch (error) {
      console.error('Error getting tenant owner:', error);
      console.log('⚠️ Using tenantId as fallback userId');
    }
    
    console.log('📍 Firebase paths being used:');
    console.log('📍 Contacts path: userData/' + userId + '_crm_contacts');
    console.log('📍 Unsubscribes path: userData/' + tenantId + '_unsubscribes');

    // Remove from contacts (CRM) - Use the actual userId (tenant owner)
    try {
      const contactsQuery = await db
        .collection('userData')
        .doc(`${userId}_crm_contacts`)
        .get();
      
      console.log('📊 Document exists:', contactsQuery.exists);
      
      if (contactsQuery.exists) {
        const contactsData = contactsQuery.data();
        const contacts = contactsData.contacts || [];
        
        console.log('📊 BEFORE REMOVAL - Total contacts:', contacts.length);
        console.log('📧 Looking for email to remove:', email);
        console.log('📧 Sample contacts:', contacts.slice(0, 2).map(c => ({ email: c.email, name: c.name })));
        
        // Filter out the unsubscribing email
        const updatedContacts = contacts.filter(contact => 
          contact.email && contact.email.toLowerCase() !== email.toLowerCase()
        );
        
        console.log('📊 AFTER REMOVAL - Total contacts:', updatedContacts.length);
        console.log('📉 Contacts removed:', contacts.length - updatedContacts.length);
        
        if (contacts.length !== updatedContacts.length) {
          console.log('✅ Contact found and will be removed!');
        } else {
          console.log('❌ Contact NOT found in list! Email not in contacts.');
          console.log('📧 All contact emails:', contacts.map(c => c.email));
        }
        
        // Update the contacts collection using the correct userId
        await db
          .collection('userData')
          .doc(`${userId}_crm_contacts`)
          .set({ contacts: updatedContacts });
        
        console.log('✅ Successfully updated contacts collection');
        console.log('Removed contact from CRM:', email);
      } else {
        console.log('❌ Contacts document does not exist at path: userData/' + userId + '_crm_contacts');
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
            timestamp: new Date().toISOString(),
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

// ===================================
// EMERGENCY LEAD SAVE FUNCTION
// ===================================

// Emergency lead save function - bypasses client Firebase connection issues
exports.emergencySaveLead = functions.https.onCall(async (data, context) => {
  console.log('🚨 EMERGENCY SAVE: Function called');
  // Safe logging to avoid circular reference errors
  console.log('Data received:', {
    tenantId: data?.tenantId,
    leadEmail: data?.leadData?.email,
    leadCompany: data?.leadData?.company
  });
  
  try {
    // Validate input
    if (!data || !data.tenantId || !data.leadData) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: tenantId, leadData');
    }

    const { tenantId, leadData } = data;
    
    // Validate lead data
    if (!leadData.email) {
      throw new functions.https.HttpsError('invalid-argument', 'Lead email is required');
    }

    console.log(`🚨 Emergency saving lead: ${leadData.email} for tenant: ${tenantId}`);

    // Create enhanced lead document
    const enrichedLead = {
      email: leadData.email,
      firstName: leadData.firstName || '',
      lastName: leadData.lastName || '',
      company: leadData.company || '',
      title: leadData.title || '',
      domain: leadData.domain || '',
      source: leadData.source || 'emergency-save',
      score: leadData.score || 75,
      status: leadData.status || 'new',
      tags: Array.isArray(leadData.tags) ? leadData.tags : ['emergency-saved'],
      notes: leadData.notes || `Emergency saved via Firebase Function at ${new Date().toISOString()}`,
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      
      // Emergency save metadata
      _emergencySave: true,
      _savedVia: 'firebase-function',
      _transportErrorBypass: true,
      
      // Security
      _tenantId: tenantId,
      _marketGenieApp: true,
      _securityValidated: true
    };

    // Save to database using Firebase Admin SDK (server-side)
    const leadsCollection = db.collection('MarketGenie_tenants').doc(tenantId).collection('leads');
    const docRef = await leadsCollection.add(enrichedLead);

    console.log(`✅ Emergency save successful: ${leadData.email} with ID: ${docRef.id}`);

    // Update tenant usage tracking
    try {
      const tenantUsageRef = db.collection('MarketGenie_tenants').doc(tenantId).collection('usage').doc('current');
      await tenantUsageRef.set({
        leads: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Tenant usage updated');
    } catch (usageError) {
      console.warn('⚠️ Failed to update tenant usage:', usageError.message);
      // Don't fail the whole operation for usage tracking
    }

    return {
      success: true,
      leadId: docRef.id,
      email: leadData.email,
      message: 'Lead saved successfully via emergency function',
      savedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Emergency save function error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', `Emergency save failed: ${error.message}`);
  }
});

// ============================================
// SCHEDULED CAMPAIGN SENDER
// Runs every hour to check for campaigns due to send
// ============================================
exports.scheduledCampaignSender = onSchedule({
  schedule: 'every 1 hours',
  timeZone: 'America/New_York',
  memory: '512MiB',
  timeoutSeconds: 540
}, async (event) => {
  console.log('🕐 Scheduled Campaign Sender running...');
  
  const now = new Date();
  console.log('Current time:', now.toISOString());
  
  try {
    // Get all campaign documents from userData collection
    // Campaigns are stored at: userData/{userId}_{userId}_campaigns
    const userDataSnapshot = await db.collection('userData').get();
    
    // Filter to only campaign documents
    const campaignDocs = userDataSnapshot.docs.filter(doc => doc.id.endsWith('_campaigns'));
    console.log(`Found ${campaignDocs.length} campaign documents to check`);
    
    for (const campaignDoc of campaignDocs) {
      // Extract userId from document ID (format: {userId}_{userId}_campaigns)
      const docId = campaignDoc.id;
      const userId = docId.split('_')[0];
      console.log(`\n📧 Checking user: ${userId} (doc: ${docId})`);
      
      try {
        const campaignsData = campaignDoc.data();
        
        // Handle both array and object with data property
        let campaigns = Array.isArray(campaignsData) ? campaignsData : (campaignsData.data || campaignsData || []);
        if (!Array.isArray(campaigns)) {
          campaigns = Object.values(campaigns).filter(c => c && typeof c === 'object' && c.name);
        }
        
        if (!campaigns || campaigns.length === 0) {
          console.log(`No campaigns found for user ${userId}`);
          continue;
        }
        
        console.log(`Found ${campaigns.length} campaigns for user ${userId}`);
        let campaignsUpdated = false;
        
        // Get contacts for this user
        const contactsDoc = await db.collection('userData').doc(`${userId}_crm_contacts`).get();
        
        let contacts = [];
        if (contactsDoc.exists) {
          const contactsData = contactsDoc.data();
          contacts = contactsData.data || contactsData.contacts || [];
          if (!Array.isArray(contacts)) {
            contacts = Object.values(contacts).filter(c => c && c.email);
          }
        }
        console.log(`Found ${contacts.length} contacts for user ${userId}`);
        
        // Find tenant ID for this user (for Gmail credentials)
        let tenantId = userId; // Default to userId
        const tenantSnapshot = await db.collection('MarketGenie_tenants')
          .where('ownerUid', '==', userId)
          .limit(1)
          .get();
        
        if (!tenantSnapshot.empty) {
          tenantId = tenantSnapshot.docs[0].id;
          console.log(`Found tenant: ${tenantId} for user ${userId}`);
        } else {
          // Try using userId directly as tenantId
          const directTenantDoc = await db.collection('MarketGenie_tenants').doc(userId).get();
          if (directTenantDoc.exists) {
            tenantId = userId;
            console.log(`Using userId as tenantId: ${tenantId}`);
          }
        }
        
        // Check each campaign
        for (let i = 0; i < campaigns.length; i++) {
          const campaign = campaigns[i];
          
          if (!campaign || typeof campaign !== 'object') continue;
          
          // Skip if not scheduled or already completed
          if (!campaign.sendDate || campaign.status === 'Completed') {
            continue;
          }
          
          const scheduledTime = new Date(campaign.sendDate);
          
          // Check if campaign is due (scheduled time has passed)
          if (scheduledTime <= now && (campaign.status === 'Scheduled' || campaign.status === 'In Progress')) {
            console.log(`\n🚀 Campaign "${campaign.name}" is due for sending!`);
            console.log(`Scheduled: ${scheduledTime.toISOString()}, Now: ${now.toISOString()}`);
            
            // Get Gmail credentials from tenant
            const gmailDoc = await db
              .collection('MarketGenie_tenants')
              .doc(tenantId)
              .collection('integrations')
              .doc('gmail')
              .get();
            
            if (!gmailDoc.exists || !gmailDoc.data().refreshToken) {
              console.log(`❌ Gmail not configured for tenant ${tenantId}`);
              campaigns[i].status = 'Error';
              campaigns[i].lastError = 'Gmail not configured';
              campaignsUpdated = true;
              continue;
            }
            
            const gmailCreds = gmailDoc.data();
            
            // Refresh access token
            const CLIENT_ID = '1023666208479-besa8q2moobncp0ih4njtop8a95htop9.apps.googleusercontent.com';
            const CLIENT_SECRET = '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';
            
            let accessToken;
            try {
              const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', 
                new URLSearchParams({
                  refresh_token: gmailCreds.refreshToken,
                  client_id: CLIENT_ID,
                  client_secret: CLIENT_SECRET,
                  grant_type: 'refresh_token'
                }).toString(),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
              );
              accessToken = tokenResponse.data.access_token;
              console.log('✅ Gmail token refreshed');
            } catch (tokenError) {
              console.error('❌ Token refresh failed:', tokenError.message);
              campaigns[i].status = 'Error';
              campaigns[i].lastError = 'Gmail token expired - reconnect required';
              campaignsUpdated = true;
              continue;
            }
            
            // Get sender email
            let senderEmail = gmailCreds.email || 'noreply@example.com';
            try {
              const profileResponse = await axios.get(
                'https://gmail.googleapis.com/gmail/v1/users/me/profile',
                { headers: { Authorization: `Bearer ${accessToken}` } }
              );
              senderEmail = profileResponse.data.emailAddress;
            } catch (profileError) {
              console.warn('Could not fetch sender email, using stored:', senderEmail);
            }
            
            // Get target contacts based on audience
            const targetContacts = contacts.filter(contact => {
              if (!contact.email) return false;
              
              // Skip already sent
              const sentList = campaign.sentContacts || [];
              if (sentList.includes(contact.email)) return false;
              
              // Filter by audience
              if (!campaign.targetAudience || campaign.targetAudience === 'All Leads' || campaign.targetAudience === 'All Contacts') {
                return true;
              }
              if (campaign.targetAudience === 'New Leads') {
                return contact.status === 'new' || contact.status === 'lead';
              }
              if (campaign.targetAudience === 'Warm Prospects') {
                return contact.status === 'qualified' || contact.status === 'warm';
              }
              if (campaign.targetAudience === 'Custom Segment' && campaign.customSegments?.length > 0) {
                return campaign.customSegments.some(segment => {
                  if (contact.tags?.includes(segment)) return true;
                  if (segment.startsWith('Company: ')) {
                    return contact.company === segment.replace('Company: ', '');
                  }
                  if (segment.startsWith('Status: ')) {
                    return contact.status === segment.replace('Status: ', '');
                  }
                  return false;
                });
              }
              return false;
            });
            
            console.log(`📊 Found ${targetContacts.length} contacts to send to`);
            
            if (targetContacts.length === 0) {
              console.log('✅ All contacts have been sent - marking as Completed');
              campaigns[i].status = 'Completed';
              campaigns[i].completedDate = new Date().toISOString();
              campaignsUpdated = true;
              continue;
            }
            
            // Get batch size
            const batchSize = campaign.batchSize || 25;
            const contactsToSend = targetContacts.slice(0, batchSize);
            console.log(`📧 Sending to ${contactsToSend.length} contacts (batch size: ${batchSize})`);
            
            // Update campaign to In Progress
            campaigns[i].status = 'In Progress';
            campaigns[i].lastSendAttempt = new Date().toISOString();
            
            let sentCount = 0;
            const sentContacts = campaign.sentContacts || [];
            
            for (const contact of contactsToSend) {
              try {
                // Personalize content
                let emailContent = campaign.emailContent || '';
                emailContent = emailContent
                  .replace(/{{first_name}}/gi, contact.name?.split(' ')[0] || 'there')
                  .replace(/{{name}}/gi, contact.name || 'there')
                  .replace(/{{company}}/gi, contact.company || 'your company')
                  .replace(/{{email}}/gi, contact.email || '');
                
                // Build raw email
                const boundary = `boundary_${Date.now()}`;
                const rawEmail = [
                  `From: ${senderEmail}`,
                  `To: ${contact.email}`,
                  `Subject: ${campaign.subject || 'No Subject'}`,
                  `MIME-Version: 1.0`,
                  `Content-Type: multipart/alternative; boundary="${boundary}"`,
                  '',
                  `--${boundary}`,
                  'Content-Type: text/plain; charset="UTF-8"',
                  '',
                  emailContent.replace(/<[^>]*>/g, ''),
                  '',
                  `--${boundary}`,
                  'Content-Type: text/html; charset="UTF-8"',
                  '',
                  emailContent,
                  '',
                  `--${boundary}--`
                ].join('\r\n');
                
                // Base64 encode for Gmail API
                const encodedMessage = Buffer.from(rawEmail)
                  .toString('base64')
                  .replace(/\+/g, '-')
                  .replace(/\//g, '_')
                  .replace(/=+$/, '');
                
                // Send via Gmail API
                const sendResponse = await axios.post(
                  'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
                  { raw: encodedMessage },
                  { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
                );
                
                console.log(`✅ Sent to ${contact.email}`);
                sentCount++;
                sentContacts.push(contact.email);
                
                // Small delay between emails
                await new Promise(resolve => setTimeout(resolve, 500));
                
              } catch (sendError) {
                console.error(`❌ Failed to send to ${contact.email}:`, sendError.response?.data?.error?.message || sendError.message);
              }
            }
            
            // Update campaign stats
            campaigns[i].sentContacts = sentContacts;
            campaigns[i].emailsSent = sentContacts.length;
            campaigns[i].lastSentDate = new Date().toISOString();
            
            // Check if all done
            const remainingContacts = targetContacts.length - sentCount;
            if (remainingContacts <= 0) {
              campaigns[i].status = 'Completed';
              campaigns[i].completedDate = new Date().toISOString();
              console.log(`🎉 Campaign "${campaign.name}" completed!`);
            } else {
              // Schedule next batch for tomorrow (same time)
              const nextSend = new Date(now);
              nextSend.setDate(nextSend.getDate() + 1);
              campaigns[i].sendDate = nextSend.toISOString();
              console.log(`📅 Next batch scheduled for: ${nextSend.toISOString()}`);
            }
            
            campaignsUpdated = true;
            console.log(`📧 Sent ${sentCount} emails for campaign "${campaign.name}"`);
          }
        }
        
        // Save updated campaigns back to the same document
        if (campaignsUpdated) {
          // Always save with { data: [...] } format for consistency
          const saveData = { 
            data: campaigns, 
            lastUpdated: admin.firestore.FieldValue.serverTimestamp() 
          };
          
          await db.collection('userData').doc(docId).set(saveData, { merge: false });
          console.log(`✅ Saved updated campaigns for user ${userId}`);
        }
        
      } catch (userError) {
        console.error(`Error processing user ${userId}:`, userError.message);
      }
    }
    
    console.log('\n✅ Scheduled Campaign Sender completed');
    
  } catch (error) {
    console.error('❌ Scheduled Campaign Sender error:', error);
    throw error;
  }
});