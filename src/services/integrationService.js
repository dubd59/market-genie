// Integration Service - Real API connections for lead scraping
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

class IntegrationService {
  constructor() {
    this.baseURL = 'https://api.marketgenie.com' // Your backend API endpoint
  }

  // Save integration credentials securely
  async saveIntegrationCredentials(tenantId, integrationName, credentials) {
    try {
      console.log('Attempting to save credentials:', { tenantId, integrationName, credentialsKeys: Object.keys(credentials) });
      
      // Clean the credentials object to remove undefined values
      const cleanCredentials = Object.entries(credentials).reduce((clean, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          clean[key] = value;
        }
        return clean;
      }, {});

      console.log('Cleaned credentials:', { cleanCredentialsKeys: Object.keys(cleanCredentials) });

      const credentialsDoc = doc(db, 'tenants', tenantId, 'integrations', integrationName)
      console.log('Document path:', credentialsDoc.path);
      
      const saveData = {
        ...cleanCredentials,
        connectedAt: new Date().toISOString(),
        status: 'connected'
      };
      
      console.log('About to save data with keys:', Object.keys(saveData));
      
      await setDoc(credentialsDoc, saveData)
      console.log('Credentials saved successfully');
      return { success: true }
    } catch (error) {
      console.error('Error saving credentials:', error)
      console.error('Error details:', { name: error.name, message: error.message, code: error.code });
      return { success: false, error: error.message }
    }
  }

  // Get stored credentials
  async getIntegrationCredentials(tenantId, integrationName) {
    try {
      console.log(`Getting credentials for tenant: ${tenantId}, integration: ${integrationName}`);
      const credentialsDoc = doc(db, 'tenants', tenantId, 'integrations', integrationName)
      console.log('Reading from document path:', credentialsDoc.path);
      
      const docSnap = await getDoc(credentialsDoc)
      console.log(`Document exists: ${docSnap.exists()}`);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Retrieved data keys:', Object.keys(data));
        console.log('Data status:', data.status);
        console.log('Has accessToken:', !!data.accessToken);
        console.log('Has refreshToken:', !!data.refreshToken);
        if (data.expiresAt) {
          console.log('Token expires:', data.expiresAt);
          console.log('Token expired:', new Date(data.expiresAt) < new Date());
        }
        return { success: true, data }
      }
      
      console.log('No credentials found for', integrationName);
      return { success: false, error: 'No credentials found' }
    } catch (error) {
      console.error('Error getting credentials:', error)
      console.error('Error details:', { name: error.name, message: error.message, code: error.code });
      return { success: false, error: error.message }
    }
  }

  // LinkedIn Sales Navigator Integration
  async connectLinkedInSalesNavigator(tenantId, authCode) {
    try {
      // Exchange auth code for access token
      const response = await fetch(`${this.baseURL}/integrations/linkedin-sales/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authCode, 
          tenantId,
          redirectUri: `${window.location.origin}/integrations/callback`
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await this.saveIntegrationCredentials(tenantId, 'linkedin-sales', {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt
        })
        return { success: true, data: result }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      console.error('LinkedIn Sales Navigator connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Scrape leads from LinkedIn Sales Navigator
  async scrapeLinkedInLeads(tenantId, searchCriteria) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'linkedin-sales')
      if (!credentials.success) {
        return { success: false, error: 'LinkedIn Sales Navigator not connected' }
      }

      const response = await fetch(`${this.baseURL}/integrations/linkedin-sales/search`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.data.accessToken}`
        },
        body: JSON.stringify({ 
          ...searchCriteria,
          tenantId 
        })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('LinkedIn scraping error:', error)
      return { success: false, error: error.message }
    }
  }

  // Hunter.io Email Finding
  async connectHunterIO(tenantId, apiKey) {
    try {
      // Test the API key
      const response = await fetch(`https://api.hunter.io/v2/account?api_key=${apiKey}`)
      const result = await response.json()

      if (result.data) {
        await this.saveIntegrationCredentials(tenantId, 'hunter-io', {
          apiKey: apiKey,
          accountInfo: result.data
        })
        return { success: true, data: result.data }
      }
      
      return { success: false, error: 'Invalid Hunter.io API key' }
    } catch (error) {
      console.error('Hunter.io connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Find emails using Hunter.io
  async findEmails(tenantId, domain, firstName, lastName) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'hunter-io')
      if (!credentials.success) {
        return { success: false, error: 'Hunter.io not connected' }
      }

      const response = await fetch(
        `https://api.hunter.io/v2/email-finder?domain=${domain}&first_name=${firstName}&last_name=${lastName}&api_key=${credentials.data.apiKey}`
      )
      
      const result = await response.json()
      
      if (result.data && result.data.email) {
        return { 
          success: true, 
          data: {
            email: result.data.email,
            confidence: result.data.confidence,
            sources: result.data.sources
          }
        }
      }
      
      return { success: false, error: 'Email not found' }
    } catch (error) {
      console.error('Email finding error:', error)
      return { success: false, error: error.message }
    }
  }

  // Apollo.io Integration
  async connectApollo(tenantId, apiKey) {
    try {
      // Test Apollo.io API key
      const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': apiKey
        },
        body: JSON.stringify({
          q_organization_domains: 'apollo.io',
          page: 1,
          per_page: 1
        })
      })

      const result = await response.json()
      
      if (response.ok && result.people) {
        await this.saveIntegrationCredentials(tenantId, 'apollo', {
          apiKey: apiKey
        })
        return { success: true }
      }
      
      return { success: false, error: 'Invalid Apollo.io API key' }
    } catch (error) {
      console.error('Apollo.io connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Search leads using Apollo.io
  async searchApolloLeads(tenantId, searchCriteria) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'apollo')
      if (!credentials.success) {
        return { success: false, error: 'Apollo.io not connected' }
      }

      const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': credentials.data.apiKey
        },
        body: JSON.stringify({
          ...searchCriteria,
          page: 1,
          per_page: 25
        })
      })

      const result = await response.json()
      
      if (response.ok && result.people) {
        const leads = result.people.map(person => ({
          firstName: person.first_name,
          lastName: person.last_name,
          email: person.email,
          title: person.title,
          company: person.organization?.name,
          linkedin: person.linkedin_url,
          phone: person.phone_numbers?.[0]?.sanitized_number,
          source: 'apollo'
        }))
        
        return { success: true, data: leads }
      }
      
      return { success: false, error: result.error || 'Search failed' }
    } catch (error) {
      console.error('Apollo search error:', error)
      return { success: false, error: error.message }
    }
  }

  // Facebook Business Integration
  async connectFacebookBusiness(tenantId, accessToken) {
    try {
      // Verify the access token
      const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`)
      const result = await response.json()

      if (result.id) {
        await this.saveIntegrationCredentials(tenantId, 'facebook-business', {
          accessToken: accessToken,
          userId: result.id,
          name: result.name
        })
        return { success: true, data: result }
      }
      
      return { success: false, error: 'Invalid Facebook access token' }
    } catch (error) {
      console.error('Facebook Business connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Get Facebook Lead Ads
  async getFacebookLeads(tenantId, pageId) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'facebook-business')
      if (!credentials.success) {
        return { success: false, error: 'Facebook Business not connected' }
      }

      const response = await fetch(
        `https://graph.facebook.com/${pageId}/leadgen_forms?access_token=${credentials.data.accessToken}`
      )
      
      const result = await response.json()
      
      if (result.data) {
        return { success: true, data: result.data }
      }
      
      return { success: false, error: 'No lead forms found' }
    } catch (error) {
      console.error('Facebook leads error:', error)
      return { success: false, error: error.message }
    }
  }

  // Zoho Mail Integration
  async connectZohoMail(tenantId, clientId, clientSecret) {
    try {
      // For self-client setup, we store credentials and prepare for OAuth
      await this.saveIntegrationCredentials(tenantId, 'zoho-mail', {
        clientId: clientId,
        clientSecret: clientSecret,
        authType: 'self-client',
        status: 'credentials-stored',
        setupInstructions: 'OAuth flow required - use these credentials to generate access token'
      })
      
      return { 
        success: true, 
        data: { 
          message: 'Client credentials stored. OAuth flow needed for access token.',
          clientId: clientId,
          nextStep: 'oauth'
        } 
      }
    } catch (error) {
      console.error('Zoho Mail connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Exchange authorization code for access token
  async exchangeZohoAuthCode(tenantId, authCode, clientId, clientSecret) {
    try {
      const formData = new FormData()
      formData.append('grant_type', 'authorization_code')
      formData.append('client_id', clientId)
      formData.append('client_secret', clientSecret)
      formData.append('code', authCode)
      formData.append('redirect_uri', `${window.location.origin}/integrations/zoho-callback`)

      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (response.ok && result.access_token) {
        // Store the tokens
        await this.saveIntegrationCredentials(tenantId, 'zoho-mail', {
          clientId: clientId,
          clientSecret: clientSecret,
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          expiresIn: result.expires_in,
          tokenType: result.token_type,
          status: 'connected',
          connectedAt: new Date().toISOString()
        })
        
        return { success: true, data: result }
      }
      
      return { success: false, error: result.error || 'Failed to exchange authorization code' }
    } catch (error) {
      console.error('Zoho token exchange error:', error)
      return { success: false, error: error.message }
    }
  }

  // Refresh Zoho access token
  async refreshZohoToken(tenantId) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'zoho-mail')
      if (!credentials.success || !credentials.data.refreshToken) {
        return { success: false, error: 'No refresh token available' }
      }

      const formData = new FormData()
      formData.append('grant_type', 'refresh_token')
      formData.append('client_id', credentials.data.clientId)
      formData.append('client_secret', credentials.data.clientSecret)
      formData.append('refresh_token', credentials.data.refreshToken)

      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (response.ok && result.access_token) {
        // Update stored credentials with new access token
        await this.saveIntegrationCredentials(tenantId, 'zoho-mail', {
          ...credentials.data,
          accessToken: result.access_token,
          expiresIn: result.expires_in,
          updatedAt: new Date().toISOString()
        })
        
        return { success: true, data: result }
      }
      
      return { success: false, error: result.error || 'Failed to refresh token' }
    } catch (error) {
      console.error('Zoho token refresh error:', error)
      return { success: false, error: error.message }
    }
  }

  // Test Zoho Mail connection - for self client, just validate credentials format
  async testZohoMail(clientId, clientSecret) {
    try {
      // Basic validation of client credentials format
      if (!clientId || !clientSecret) {
        return { success: false, error: 'Both Client ID and Client Secret are required' }
      }
      
      if (!clientId.includes('.') || clientSecret.length < 32) {
        return { success: false, error: 'Invalid Zoho client credentials format' }
      }
      
      return { 
        success: true, 
        data: { 
          message: 'Client credentials format valid. Ready for OAuth flow.',
          clientId: clientId
        } 
      }
    } catch (error) {
      console.error('Zoho Mail test error:', error)
      return { success: false, error: error.message }
    }
  }

  // ConvertKit Integration
  async connectConvertKit(tenantId, apiSecret) {
    try {
      // Test ConvertKit API - Get account info
      const response = await fetch(`https://api.convertkit.com/v3/account?api_secret=${apiSecret}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result.account) {
        await this.saveIntegrationCredentials(tenantId, 'convertkit', {
          apiSecret: apiSecret,
          accountName: result.account.name,
          primaryEmailAddress: result.account.primary_email_address
        })
        return { 
          success: true, 
          data: { 
            name: result.account.name,
            email: result.account.primary_email_address 
          } 
        }
      }
      
      return { success: false, error: result.error || 'Invalid ConvertKit API secret' }
    } catch (error) {
      console.error('ConvertKit connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Test ConvertKit connection
  async testConvertKit(apiSecret) {
    try {
      const response = await fetch(`https://api.convertkit.com/v3/account?api_secret=${apiSecret}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result.account) {
        return { 
          success: true, 
          data: { 
            name: result.account.name,
            email: result.account.primary_email_address 
          } 
        }
      }
      
      return { success: false, error: result.error || 'Invalid ConvertKit API secret' }
    } catch (error) {
      console.error('ConvertKit test error:', error)
      return { success: false, error: error.message }
    }
  }

  // Zoho Campaigns API Integration
  async connectZohoCampaigns(tenantId, credentials) {
    try {
      // Prepare the data object with only defined values
      const credentialsData = {
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
        domain: credentials.domain || 'com', // .com, .eu, .in, etc.
        status: 'credentials_saved'
      };

      // Only add optional fields if they exist
      if (credentials.fromEmail) {
        credentialsData.fromEmail = credentials.fromEmail;
      }
      
      if (credentials.fromName) {
        credentialsData.fromName = credentials.fromName;
      }

      // Only save the basic credentials first, tokens will be added after OAuth
      const result = await this.saveIntegrationCredentials(tenantId, 'zoho_campaigns', credentialsData)
      
      if (result.success) {
        // Generate OAuth URL for Zoho Campaigns
        const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/zoho/callback`)
        const state = btoa(JSON.stringify({ tenantId, service: 'zoho_campaigns' }))
        const scope = encodeURIComponent('ZohoCampaigns.campaign.ALL,ZohoCampaigns.contact.ALL')
        
        console.log('OAuth URL generation:', {
          origin: window.location.origin,
          redirectUri: redirectUri,
          clientId: credentials.clientId,
          domain: credentials.domain || 'com'
        });
        
        const authUrl = `https://accounts.zoho.${credentials.domain || 'com'}/oauth/v2/auth?` +
          `response_type=code&` +
          `client_id=${credentials.clientId}&` +
          `scope=${scope}&` +
          `redirect_uri=${redirectUri}&` +
          `state=${state}&` +
          `access_type=offline`
        
        console.log('Generated OAuth URL:', authUrl);
        
        return { 
          success: true, 
          authUrl: authUrl,
          message: 'Credentials saved. Redirecting to OAuth...'
        }
      }
      
      return result
    } catch (error) {
      console.error('Zoho Campaigns connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Handle Zoho OAuth callback
  async handleZohoOAuthCallback(tenantId, authorizationCode) {
    try {
      console.log('Starting OAuth callback handling...', { tenantId, codeLength: authorizationCode.length });
      
      // Check if we've already processed this code (prevent duplicate exchanges)
      const cacheKey = `oauth_${tenantId}_${authorizationCode.substring(0, 20)}`;
      if (window[cacheKey]) {
        console.log('OAuth code already processed, skipping duplicate exchange');
        return { success: true, message: 'OAuth already completed' };
      }
      window[cacheKey] = true;
      
      // Get existing credentials to get client ID and secret
      const credentials = await this.getIntegrationCredentials(tenantId, 'zoho_campaigns');
      console.log('Retrieved credentials:', { success: credentials.success, hasData: !!credentials.data });
      
      if (!credentials.success) {
        console.error('No Zoho credentials found');
        return { success: false, error: 'No Zoho credentials found' };
      }

      const { clientId, clientSecret, domain = 'com' } = credentials.data;
      console.log('Using credentials:', { clientId: clientId?.substring(0, 10) + '...', domain });

      // Exchange authorization code for access token
      const tokenUrl = `https://accounts.zoho.${domain}/oauth/v2/token`;
      const redirectUri = `${window.location.origin}/oauth/zoho/callback`;

      console.log('Token exchange request:', { tokenUrl, redirectUri });

      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code: authorizationCode
        })
      });

      const tokenData = await tokenResponse.json();
      console.log('Token response:', { ok: tokenResponse.ok, status: tokenResponse.status, hasAccessToken: !!tokenData.access_token });
      console.log('Token data details:', { 
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type
      });

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokenData);
        throw new Error(tokenData.error_description || tokenData.error || 'Token exchange failed');
      }

      // Check if we actually got tokens
      if (!tokenData.access_token) {
        console.error('No access token received:', tokenData);
        throw new Error('No access token received from Zoho. The authorization code may have already been used.');
      }

      // Save the tokens
      const expiresIn = parseInt(tokenData.expires_in) || 3600; // Default to 1 hour if invalid
      const expiresAtTime = Date.now() + (expiresIn * 1000);
      
      const updateData = {
        ...credentials.data,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(expiresAtTime).toISOString(),
        expiresIn: expiresIn,
        tokenType: tokenData.token_type || 'Bearer',
        status: 'connected',
        lastUpdated: new Date().toISOString()
      };
      
      console.log('Saving updated credentials...', { hasAccessToken: !!updateData.accessToken, status: updateData.status });
      
      const updateResult = await this.saveIntegrationCredentials(tenantId, 'zoho_campaigns', updateData);
      console.log('Save result:', updateResult);

      if (updateResult.success) {
        console.log('OAuth callback completed successfully');
        return { success: true, message: 'OAuth completed successfully' };
      } else {
        console.error('Failed to save tokens:', updateResult.error);
        throw new Error('Failed to save tokens');
      }

    } catch (error) {
      console.error('Zoho OAuth callback error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test Zoho Campaigns connection
  async testZohoCampaigns(tenantId) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'zoho_campaigns')
      if (!credentials.success) {
        return { success: false, error: 'No Zoho Campaigns credentials found' }
      }

      const { accessToken, domain = 'com' } = credentials.data
      const apiUrl = `https://campaigns.zoho.${domain}/api/v1.1/getorganizationdetails`
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result.status === 'success') {
        return { 
          success: true, 
          data: { 
            organizationName: result.organization_name,
            industryType: result.industry_type,
            accountType: result.account_type
          } 
        }
      }
      
      return { success: false, error: result.message || 'Zoho Campaigns test failed' }
    } catch (error) {
      console.error('Zoho Campaigns test error:', error)
      return { success: false, error: error.message }
    }
  }

  // Send email via Zoho Campaigns
  async sendZohoCampaignEmail(tenantId, emailData) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'zoho_campaigns')
      if (!credentials.success) {
        return { success: false, error: 'No Zoho Campaigns credentials found' }
      }

      const { accessToken, domain = 'com' } = credentials.data
      const apiUrl = `https://campaigns.zoho.${domain}/api/v1.1/json/campaigns/quickcampaign`
      
      const campaignData = {
        campaignname: emailData.subject || 'Market Genie Campaign',
        fromname: emailData.fromName || 'Market Genie',
        subject: emailData.subject,
        htmlcontent: emailData.content,
        recipients: emailData.to, // Can be email address or mailing list ID
        campaigntype: 'instant'
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      })

      const result = await response.json()
      
      if (response.ok && result.status === 'success') {
        return { 
          success: true, 
          data: { 
            campaignId: result.campaign_key,
            message: 'Email campaign sent successfully'
          } 
        }
      }
      
      return { success: false, error: result.message || 'Failed to send email campaign' }
    } catch (error) {
      console.error('Zoho Campaigns email error:', error)
      return { success: false, error: error.message }
    }
  }

  // Add contact to Zoho Campaigns
  async addZohoCampaignContact(tenantId, contactData) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'zoho_campaigns')
      if (!credentials.success) {
        return { success: false, error: 'No Zoho Campaigns credentials found' }
      }

      const { accessToken, domain = 'com' } = credentials.data
      const apiUrl = `https://campaigns.zoho.${domain}/api/v1.1/json/listsubscribe`
      
      const subscribeData = {
        listkey: contactData.listId, // Zoho mailing list ID
        contactinfo: JSON.stringify([{
          'Contact Email': contactData.email,
          'First Name': contactData.firstName || '',
          'Last Name': contactData.lastName || '',
          'Company': contactData.company || ''
        }])
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscribeData)
      })

      const result = await response.json()
      
      if (response.ok && result.status === 'success') {
        return { 
          success: true, 
          data: { 
            message: 'Contact added successfully'
          } 
        }
      }
      
      return { success: false, error: result.message || 'Failed to add contact' }
    } catch (error) {
      console.error('Zoho Campaigns contact error:', error)
      return { success: false, error: error.message }
    }
  }

  // Generic OAuth flow starter
  getOAuthURL(provider, tenantId) {
    const redirectUri = `${window.location.origin}/integrations/callback`
    
    const urls = {
      'linkedin-sales': `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress%20w_member_social&state=${tenantId}`,
      'facebook-business': `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.VITE_FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=pages_manage_ads,pages_read_engagement,leads_retrieval&state=${tenantId}`,
      'twitter': `https://api.twitter.com/oauth/authorize?oauth_token=${process.env.VITE_TWITTER_OAUTH_TOKEN}&oauth_callback=${redirectUri}&state=${tenantId}`,
      'zoho-campaigns': `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCampaigns.contact.ALL,ZohoCampaigns.campaign.ALL&client_id=${process.env.VITE_ZOHO_CLIENT_ID}&state=${tenantId}&response_type=code&redirect_uri=${redirectUri}&access_type=offline`
    }
    
    return urls[provider]
  }
}

export default new IntegrationService()