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
      const credentialsDoc = doc(db, 'tenants', tenantId, 'integrations', integrationName)
      await setDoc(credentialsDoc, {
        ...credentials,
        connectedAt: new Date(),
        status: 'connected'
      })
      return { success: true }
    } catch (error) {
      console.error('Error saving credentials:', error)
      return { success: false, error: error.message }
    }
  }

  // Get stored credentials
  async getIntegrationCredentials(tenantId, integrationName) {
    try {
      const credentialsDoc = doc(db, 'tenants', tenantId, 'integrations', integrationName)
      const docSnap = await getDoc(credentialsDoc)
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() }
      }
      return { success: false, error: 'No credentials found' }
    } catch (error) {
      console.error('Error getting credentials:', error)
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

  // Generic OAuth flow starter
  getOAuthURL(provider, tenantId) {
    const redirectUri = `${window.location.origin}/integrations/callback`
    
    const urls = {
      'linkedin-sales': `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.VITE_LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress%20w_member_social&state=${tenantId}`,
      'facebook-business': `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.VITE_FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=pages_manage_ads,pages_read_engagement,leads_retrieval&state=${tenantId}`,
      'twitter': `https://api.twitter.com/oauth/authorize?oauth_token=${process.env.VITE_TWITTER_OAUTH_TOKEN}&oauth_callback=${redirectUri}&state=${tenantId}`
    }
    
    return urls[provider]
  }
}

export default new IntegrationService()