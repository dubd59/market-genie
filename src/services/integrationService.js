// Integration Service - Real API connections for lead scraping
import { collection, doc, setDoc, getDoc, updateDoc } from '../security/SecureFirebase.js'
import { auth, db } from '../firebase.js'

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

      const credentialsDoc = doc(db, 'MarketGenie_tenants', tenantId, 'integrations', integrationName)
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
      
      // 🚨 EMERGENCY FIX: Check for emergency API key in localStorage
      if (integrationName === 'prospeo-io') {
        const emergencyApiKey = localStorage.getItem('prospeo_api_key_emergency');
        const prospeoFixApplied = localStorage.getItem('prospeo_fix_applied');
        
        if (emergencyApiKey && prospeoFixApplied === 'true') {
          console.log('🚨 Using emergency Prospeo API key from localStorage');
          return {
            success: true,
            data: {
              apiKey: emergencyApiKey,
              status: 'connected',
              connectionMethod: 'emergency_fix',
              _emergencyMode: true
            }
          };
        }
      }
      
      const credentialsDoc = doc(db, 'MarketGenie_tenants', tenantId, 'integrations', integrationName)
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

  // ===================================
  // PROSPEO.IO INTEGRATION
  // ===================================
  
  // Connect to Prospeo.io (75 FREE credits!)
  async connectProspeo(tenantId, apiKey) {
    try {
      console.log('🔌 Testing Prospeo.io API connection via Firebase proxy...');
      console.log('🏢 Tenant ID:', tenantId);
      console.log('🔑 API Key received:', apiKey?.substring(0, 8) + '...');
      
      // Clean and validate the API key
      const cleanApiKey = apiKey.trim();
      
      // Validate API key format (basic check)
      if (!cleanApiKey || cleanApiKey.length < 10) {
        return { success: false, error: 'Invalid API key format' };
      }
      
      console.log('🔑 Using API key:', cleanApiKey.substring(0, 8) + '...');
      
      // Use the working Firebase proxy instead of direct API calls
      const PROXY_URL = 'https://leadgenproxy-aopxj7f3aa-uc.a.run.app';
      
      const response = await fetch(`${PROXY_URL}/api/prospeo-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: cleanApiKey
        })
      });

      const result = await response.json();
      console.log('Prospeo proxy response:', result);

      if (result.success) {
        await this.saveIntegrationCredentials(tenantId, 'prospeo-io', {
          apiKey: cleanApiKey,
          credits: result.credits,
          connectionMethod: 'firebase-proxy'
        });
        
        return { 
          success: true, 
          message: 'Prospeo.io connected successfully!',
          credits: result.credits,
          provider: 'prospeo-io'
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to connect to Prospeo.io'
        };
      }
    } catch (error) {
      console.error('❌ Prospeo.io connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search domain using Prospeo.io via Firebase proxy
  async searchDomainProspeo(tenantId, domain, limit = 5) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'prospeo-io');
      if (!credentials.success) {
        return { success: false, error: 'Prospeo.io not connected' };
      }

      console.log(`🔍 Prospeo domain search: ${domain}`);

      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

      // Use Firebase proxy for domain search
      const PROXY_URL = 'https://leadgenproxy-aopxj7f3aa-uc.a.run.app';

      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: 'prospeo',
          apiKey: credentials.data.apiKey,
          searchData: {
            domain: cleanDomain
          }
        })
      });

      const result = await response.json();
      console.log('Prospeo proxy domain search response:', result);

      if (result.success && result.data.contacts && result.data.contacts.length > 0) {
        const contacts = result.data.contacts.slice(0, limit);

        return {
          success: true,
          data: {
            contacts,
            source: 'Prospeo.io',
            domain: cleanDomain,
            total: contacts.length,
            credits_remaining: result.data.credits_remaining
          }
        };
      } else if (result.success && result.data.contacts && result.data.contacts.length === 0) {
        return {
          success: true,
          data: {
            contacts: [],
            source: 'Prospeo.io',
            domain: cleanDomain,
            total: 0,
            message: result.data.message || 'No emails found for this domain',
            credits_remaining: result.data.credits_remaining
          }
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Domain search failed'
        };
      }
    } catch (error) {
      console.error('❌ Prospeo domain search error:', error);
      return { success: false, error: error.message };
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
      console.log('Hunter.io response:', result)
      
      if (result.data && result.data.email) {
        return { 
          success: true, 
          data: {
            email: result.data.email,
            first_name: result.data.first_name,
            last_name: result.data.last_name,
            confidence: result.data.confidence,
            sources: result.data.sources
          }
        }
      }
      
      return { success: false, error: 'Email not found', details: result }
    } catch (error) {
      console.error('Email finding error:', error)
      return { success: false, error: error.message }
    }
  }

  // Domain search to find multiple people at a company
  async searchDomain(tenantId, domain, limit = 5) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'hunter-io')
      if (!credentials.success) {
        return { success: false, error: 'Hunter.io not connected' }
      }

      const response = await fetch(
        `https://api.hunter.io/v2/domain-search?domain=${domain}&limit=${limit}&api_key=${credentials.data.apiKey}`
      )
      
      const result = await response.json()
      console.log('Hunter.io domain search response:', result)
      
      if (result.data && result.data.emails && result.data.emails.length > 0) {
        return { 
          success: true, 
          data: result.data.emails.map(email => ({
            email: email.value,
            first_name: email.first_name,
            last_name: email.last_name,
            position: email.position,
            confidence: email.confidence,
            department: email.department
          }))
        }
      }
      
      return { success: false, error: 'No emails found for domain', details: result }
    } catch (error) {
      console.error('Domain search error:', error)
      return { success: false, error: error.message }
    }
  }

  // ===================================
  // LEAD GENERATION PROXY INTEGRATION
  // ===================================
  
  // Connect to lead generation providers through Firebase proxy (bypasses CORS)
  async connectLeadProvider(tenantId, provider, apiKey) {
    try {
      console.log(`🔌 Testing ${provider} API connection through Firebase proxy...`)
      
      // For VoilaNorbert, use a simple test case that's likely to work
      let testData;
      if (provider === 'voilanorbert') {
        testData = {
          firstName: 'John',
          lastName: 'Doe', 
          domain: 'example.org'  // Use a simple, neutral domain
        };
      } else {
        testData = {
          firstName: 'Test',
          lastName: 'User',
          company: 'Test Company',
          domain: 'example.com'
        };
      }

      const response = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: provider,
          apiKey: apiKey,
          searchData: testData
        })
      });

      const result = await response.json();
      console.log(`${provider} connection test result:`, result);
      
      // Consider connection successful if:
      // 1. API responds successfully, OR
      // 2. API responds with specific "no email found" message (means API key is valid)
      // 3. API responds with non-authentication errors (proves API key works)
      if (result.success || 
          (result.error && result.error.includes('No email found')) ||
          (result.error && result.error.includes('not found for this person')) ||
          (result.error && result.error.includes('No results found')) ||
          (provider === 'voilanorbert' && result.error && result.error.includes('Bad request - please check the name and domain format'))) {
        
        await this.saveIntegrationCredentials(tenantId, provider, {
          apiKey: apiKey,
          credits: result.data?.credits_remaining || 'Unknown',
          lastTested: new Date().toISOString()
        });
        
        console.log(`✅ ${provider} connected successfully`);
        return { 
          success: true, 
          data: { 
            credits: result.data?.credits_remaining || 'Unknown',
            provider: provider,
            message: result.data?.message || 'Connection successful - API key is valid'
          } 
        };
      }
      
      // If we get authentication errors, don't save (but NOT format errors for VoilaNorbert)
      if (result.error && (
          result.error.includes('Invalid API key') ||
          result.error.includes('unauthorized') ||
          result.error.includes('forbidden') ||
          (result.error.includes('Bad request') && provider !== 'voilanorbert') ||
          (result.error.includes('please check the name and domain format') && provider !== 'voilanorbert')
      )) {
        console.log(`❌ ${provider} authentication failed:`, result.error);
        return { success: false, error: `Invalid ${provider} API key: ${result.error}` };
      }
      
      return { success: false, error: result.error || `Invalid ${provider} API key` };
    } catch (error) {
      console.error(`❌ ${provider} connection error:`, error);
      return { success: false, error: error.message };
    }
  }

  // Legacy method names for backward compatibility
  async connectVoilaNorbert(tenantId, apiKey) {
    return await this.connectLeadProvider(tenantId, 'voilanorbert', apiKey);
  }

  async connectHunter(tenantId, apiKey) {
    return await this.connectLeadProvider(tenantId, 'hunter', apiKey);
  }

  // Universal email finder using Firebase proxy (works for all 3 providers)
  async findEmailWithProvider(tenantId, provider, domain, firstName, lastName, company = '') {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, provider);
      if (!credentials.success) {
        return { success: false, error: `${provider} not connected` };
      }

      const searchData = {
        firstName: firstName,
        lastName: lastName,
        domain: domain,
        company: company
      };

      // Map integration names to proxy provider names
      const providerMap = {
        'prospeo-io': 'prospeo',
        'voilanorbert': 'voilanorbert',
        'hunter': 'hunter'
      };
      
      const proxyProvider = providerMap[provider] || provider;

      const response = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: proxyProvider,
          apiKey: credentials.data.apiKey,
          searchData: searchData
        })
      });
      
      const result = await response.json();
      console.log(`${provider} email finder response:`, result);
      
      if (result.success && result.data.email) {
        return { 
          success: true, 
          data: {
            email: result.data.email,
            first_name: firstName,
            last_name: lastName,
            company: company,
            confidence: result.data.confidence,
            source: result.data.source,
            credits_remaining: result.data.credits_remaining
          }
        };
      }
      
      return { success: false, error: result.error || 'No email found' };
    } catch (error) {
      console.error(`❌ ${provider} email finder error:`, error);
      return { success: false, error: error.message };
    }
  }

  // Legacy method names for backward compatibility
  async findEmailVoilaNorbert(tenantId, domain, firstName, lastName) {
    return await this.findEmailWithProvider(tenantId, 'voilanorbert', domain, firstName, lastName);
  }

  async findEmailProspeo(tenantId, domain, firstName, lastName, company) {
    return await this.findEmailWithProvider(tenantId, 'prospeo-io', domain, firstName, lastName, company);
  }

  async findEmailHunter(tenantId, domain, firstName, lastName) {
    return await this.findEmailWithProvider(tenantId, 'hunter', domain, firstName, lastName);
  }

  // Verify email using any provider
  async verifyEmailWithProvider(tenantId, provider, email) {
    // For now, we'll just return a basic verification
    // This can be enhanced to use provider-specific verification APIs
    return {
      success: true,
      data: {
        email: email,
        valid: true,
        provider: provider
      }
    };
  }

  // Legacy method for backward compatibility
  async verifyEmailVoilaNorbert(tenantId, email) {
    return await this.verifyEmailWithProvider(tenantId, 'voilanorbert', email);
  }

  // ===================================
  // SNOV.IO INTEGRATION
  // ===================================
  
  // Connect to Snov.io API
  async connectSnovIo(tenantId, accessToken) {
    try {
      console.log('🔌 Testing Snov.io API connection...')
      
      // Test Snov.io API key by checking account status
      const response = await fetch('https://app.snov.io/restapi/get-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const result = await response.json()
      console.log('Snov.io connection test result:', result)
      
      if (response.ok && result.credits !== undefined) {
        await this.saveIntegrationCredentials(tenantId, 'snov-io', {
          accessToken: accessToken,
          credits: result.credits
        })
        console.log('✅ Snov.io connected successfully')
        return { success: true, data: { credits: result.credits } }
      }
      
      return { success: false, error: 'Invalid Snov.io API token' }
    } catch (error) {
      console.error('❌ Snov.io connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Find email using Snov.io
  async findEmailSnov(tenantId, domain, firstName, lastName) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'snov-io')
      if (!credentials.success) {
        return { success: false, error: 'Snov.io not connected' }
      }

      const response = await fetch('https://app.snov.io/restapi/get-emails-from-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.data.accessToken}`
        },
        body: JSON.stringify({
          domain: domain,
          firstName: firstName,
          lastName: lastName
        })
      })
      
      const result = await response.json()
      console.log('Snov.io email finder response:', result)
      
      if (result && result.emails && result.emails.length > 0) {
        const bestEmail = result.emails[0] // Snov returns best match first
        return { 
          success: true, 
          data: {
            email: bestEmail.email,
            first_name: firstName,
            last_name: lastName,
            confidence: bestEmail.confidence || 'medium',
            source: 'snov-io'
          }
        }
      }
      
      return { success: false, error: 'Email not found via Snov.io', details: result }
    } catch (error) {
      console.error('Snov.io email finding error:', error)
      return { success: false, error: error.message }
    }
  }

  // Search domain using Snov.io
  async searchDomainSnov(tenantId, domain, limit = 5) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'snov-io')
      if (!credentials.success) {
        return { success: false, error: 'Snov.io not connected' }
      }

      const response = await fetch('https://app.snov.io/restapi/get-domain-emails-with-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.data.accessToken}`
        },
        body: JSON.stringify({
          domain: domain,
          type: 'all',
          limit: limit
        })
      })
      
      const result = await response.json()
      console.log('Snov.io domain search response:', result)
      
      if (result && result.emails && result.emails.length > 0) {
        return { 
          success: true, 
          data: result.emails.map(contact => ({
            email: contact.email,
            first_name: contact.firstName,
            last_name: contact.lastName,
            position: contact.position,
            confidence: contact.confidence || 'medium',
            department: contact.department,
            source: 'snov-io'
          }))
        }
      }
      
      return { success: false, error: 'No emails found for domain via Snov.io', details: result }
    } catch (error) {
      console.error('Snov.io domain search error:', error)
      return { success: false, error: error.message }
    }
  }

  // Email verification using Snov.io
  async verifyEmailSnov(tenantId, emails) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'snov-io')
      if (!credentials.success) {
        return { success: false, error: 'Snov.io not connected' }
      }

      const emailList = Array.isArray(emails) ? emails : [emails]

      const response = await fetch('https://app.snov.io/restapi/verify-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.data.accessToken}`
        },
        body: JSON.stringify({
          emails: emailList
        })
      })
      
      const result = await response.json()
      console.log('Snov.io email verification response:', result)
      
      if (result && result.success) {
        return { 
          success: true, 
          data: result.emails || result.data
        }
      }
      
      return { success: false, error: 'Email verification failed', details: result }
    } catch (error) {
      console.error('Snov.io email verification error:', error)
      return { success: false, error: error.message }
    }
  }

  // ===================================
  // ROCKETREACH INTEGRATION  
  // ===================================
  
  // Connect to RocketReach API (CORS-safe approach)
  async connectRocketReach(tenantId, apiKey) {
    try {
      console.log('🚀 Testing RocketReach API connection...')
      
      // RocketReach has CORS restrictions for browser-based requests
      // Instead of testing the API directly, we'll store the credentials
      // and validate during actual usage
      
      if (!apiKey || apiKey.length < 10) {
        return { success: false, error: 'Invalid RocketReach API key format' }
      }
      
      // Store credentials for later use
      await this.saveIntegrationCredentials(tenantId, 'rocketreach', {
        apiKey: apiKey,
        status: 'stored',
        note: 'API key stored - will validate on first use due to CORS restrictions'
      })
      
      console.log('✅ RocketReach API key stored successfully')
      return { 
        success: true, 
        data: { 
          status: 'stored',
          message: 'API key saved. Will validate on first search.',
          note: 'RocketReach requires server-side requests'
        } 
      }
      
    } catch (error) {
      console.error('❌ RocketReach connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Search contacts using RocketReach (CORS-aware)
  async searchRocketReach(tenantId, searchCriteria) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'rocketreach')
      if (!credentials.success) {
        return { success: false, error: 'RocketReach not connected' }
      }

      console.log('🚀 Attempting RocketReach search (may have CORS limitations)...')
      
      // Note: RocketReach API calls from browser may fail due to CORS
      // This is a limitation of their API design
      try {
        const queryParams = new URLSearchParams({
          start: 1,
          size: searchCriteria.limit || 5,
          ...searchCriteria
        })

        const response = await fetch(`https://api.rocketreach.co/api/v2/person/search?${queryParams}`, {
          method: 'GET',
          headers: {
            'Api-Key': credentials.data.apiKey,
            'Content-Type': 'application/json'
          }
        })
        
        const result = await response.json()
        console.log('RocketReach search response:', result)
        
        if (response.ok && result.profiles && result.profiles.length > 0) {
          return { 
            success: true, 
            data: result.profiles.map(profile => ({
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              position: profile.current_title,
              company: profile.current_employer,
              phone: profile.phone_numbers?.[0],
              linkedin: profile.linkedin_url,
              confidence: 'high', // RocketReach is generally high quality
              source: 'rocketreach'
            }))
          }
        }
        
        return { success: false, error: 'No contacts found via RocketReach', details: result }
      } catch (corsError) {
        console.log('⚠️ RocketReach CORS limitation detected:', corsError.message)
        return { 
          success: false, 
          error: 'RocketReach API requires server-side access due to CORS policy',
          corsLimited: true,
          suggestion: 'Use Hunter.io or Voila Norbert for browser-based searches'
        }
      }
      
    } catch (error) {
      console.error('RocketReach search error:', error)
      return { success: false, error: error.message }
    }
  }

  // Find person by domain using RocketReach
  async findPersonRocketReach(tenantId, domain, firstName, lastName) {
    try {
      const credentials = await this.getIntegrationCredentials(tenantId, 'rocketreach')
      if (!credentials.success) {
        return { success: false, error: 'RocketReach not connected' }
      }

      const queryParams = new URLSearchParams({
        name: `${firstName} ${lastName}`,
        current_employer: domain.replace(/\..*/, ''), // Extract company name from domain
        start: 1,
        size: 1
      })

      const response = await fetch(`https://api.rocketreach.co/api/v2/person/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Api-Key': credentials.data.apiKey,
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      console.log('RocketReach person search response:', result)
      
      if (response.ok && result.profiles && result.profiles.length > 0) {
        const profile = result.profiles[0]
        return { 
          success: true, 
          data: {
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            position: profile.current_title,
            company: profile.current_employer,
            phone: profile.phone_numbers?.[0],
            linkedin: profile.linkedin_url,
            confidence: 'high',
            source: 'rocketreach'
          }
        }
      }
      
      return { success: false, error: 'Person not found via RocketReach', details: result }
    } catch (error) {
      console.error('RocketReach person search error:', error)
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

  // Kit (formerly ConvertKit) V4 API Integration
  async connectConvertKit(tenantId, apiKey) {
    try {
      // Test Kit V4 API - Get account info using X-Kit-Api-Key header
      const response = await fetch(`https://api.kit.com/v4/account`, {
        method: 'GET',
        headers: {
          'X-Kit-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result) {
        // Save to 'kit' instead of 'convertkit' for V4 API
        await this.saveIntegrationCredentials(tenantId, 'kit', {
          apiKey: apiKey,
          accountName: result.name || result.email || 'Kit Account',
          primaryEmailAddress: result.email || 'Unknown'
        })
        return { 
          success: true, 
          data: { 
            name: result.name || result.email || 'Kit Account',
            email: result.email || 'Unknown'
          } 
        }
      }
      
      return { success: false, error: result.error || result.message || 'Invalid Kit V4 API key' }
    } catch (error) {
      console.error('Kit V4 connection error:', error)
      return { success: false, error: error.message }
    }
  }

  // Test Kit V4 API connection
  async testConvertKit(apiKey) {
    try {
      const response = await fetch(`https://api.kit.com/v4/account`, {
        method: 'GET',
        headers: {
          'X-Kit-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (response.ok && result) {
        return { 
          success: true, 
          data: { 
            name: result.name || result.email || 'Kit Account',
            email: result.email || 'Unknown'
          } 
        }
      }
      
      return { success: false, error: result.error || result.message || 'Invalid Kit V4 API key' }
    } catch (error) {
      console.error('Kit V4 test error:', error)
      return { success: false, error: error.message }
    }
  }

  // Resend API Integration
  async connectResend(tenantId, apiKey) {
    try {
      // Get the user's ID token for authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const idToken = await user.getIdToken();
      
      // Test Resend API via Firebase Function
      const response = await fetch('https://us-central1-market-genie-f2d41.cloudfunctions.net/testResendConnection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ apiKey })
      });

      const result = await response.json();
      
      if (result.success) {
        // Save Resend credentials
        await this.saveIntegrationCredentials(tenantId, 'resend', {
          apiKey: apiKey,
          accountName: 'Resend Account',
          fromEmail: 'noreply@yourdomain.com', // Will be updated when domain is configured
          status: 'connected',
          connectedAt: new Date().toISOString()
        });
        
        return { 
          success: true, 
          data: result.data
        };
      }
      
      return { success: false, error: result.error || 'Invalid Resend API key' };
    } catch (error) {
      console.error('Resend connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test Resend API connection
  async testResend(apiKey) {
    try {
      // Get the user's ID token for authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const idToken = await user.getIdToken();
      
      // Test Resend API via Firebase Function
      const response = await fetch('https://us-central1-market-genie-f2d41.cloudfunctions.net/testResendConnection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ apiKey })
      });

      const result = await response.json();
      
      if (result.success) {
        return { 
          success: true, 
          data: result.data
        };
      }
      
      return { success: false, error: result.error || 'Invalid Resend API key' };
    } catch (error) {
      console.error('Resend test error:', error);
      return { success: false, error: error.message }
    }
  }

  // Gmail SMTP Integration
  async connectGmail(tenantId, email, appPassword) {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@gmail\.com$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid Gmail address (must end with @gmail.com)' };
      }

      // Clean app password by removing all spaces and validate
      const cleanAppPassword = appPassword.replace(/\s+/g, '');
      if (!cleanAppPassword || cleanAppPassword.length !== 16) {
        return { success: false, error: 'Please enter a valid Gmail App Password (16 characters, spaces will be removed automatically)' };
      }

      console.log('Connecting Gmail SMTP for:', email);

      // Save Gmail credentials with cleaned app password
      await this.saveIntegrationCredentials(tenantId, 'gmail', {
        email: email,
        appPassword: cleanAppPassword,  // Store without spaces
        host: 'smtp.gmail.com',
        port: 587,
        status: 'connected',
        connectedAt: new Date().toISOString()
      });

      return { 
        success: true, 
        data: { 
          email: email,
          host: 'smtp.gmail.com',
          status: 'connected'
        } 
      };
    } catch (error) {
      console.error('Gmail connection error:', error);
      return { success: false, error: error.message };
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

  // Test connection for lead generation providers
  async testConnection(serviceId, options) {
    try {
      const { tenantId, userId, integration, config } = options;
      
      if (!config || !config.apiKey) {
        return { success: false, error: 'API key is required for testing' };
      }

      // Route to specific test handlers based on service type
      switch (serviceId) {
        case 'hunter-io':
          return await this.testLeadProvider('hunter', config.apiKey);

        case 'prospeo-io':
          return await this.testLeadProvider('prospeo', config.apiKey);

        case 'voila-norbert':
          return await this.testLeadProvider('voilanorbert', config.apiKey);

        case 'sendgrid':
          return await this.testSendGridConnection(config.apiKey);

        case 'mailgun':
          return await this.testMailgunConnection(config.apiKey, config.domain);

        default:
          return { success: false, error: `Test connection not implemented for ${serviceId}` };
      }
    } catch (error) {
      console.error(`Error testing ${serviceId} connection:`, error);
      return { success: false, error: error.message };
    }
  }

  // Test lead generation provider without saving credentials
  async testLeadProvider(provider, apiKey) {
    try {
      console.log(`🔌 Testing ${provider} API connection through Firebase proxy...`)
      console.log(`🔑 API Key being used: ${apiKey?.substring(0, 8)}...`);
      
      // Use different test data for each provider based on their API requirements
      let testData;
      if (provider === 'voilanorbert') {
        testData = {
          firstName: 'John',
          lastName: 'Doe', 
          domain: 'example.org'  // Use a simple, neutral domain
        };
      } else if (provider === 'prospeo') {
        testData = {
          firstName: 'Tim',
          lastName: 'Cook',
          company: 'apple.com'  // Use domain format instead of company name
        };
      } else {
        testData = {
          firstName: 'Test',
          lastName: 'User',
          company: 'Test Company',
          domain: 'example.com'
        };
      }

      const response = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: provider,
          apiKey: apiKey,
          searchData: testData
        })
      });

      const result = await response.json();
      console.log(`${provider} connection test result:`, result);
      
      // Consider connection successful if:
      // 1. API responds successfully, OR
      // 2. API responds with specific "no email found" message (means API key is valid)
      // 3. API responds with any result that indicates the API key is valid (non-auth errors)
      // 4. For VoilaNorbert, "Bad request" often means the test data format but API key is valid
      if (result.success || 
          (result.error && result.error.includes('No email found')) ||
          (result.error && result.error.includes('not found for this person')) ||
          (result.error && result.error.includes('No results found')) ||
          (provider === 'voilanorbert' && result.error && result.error.includes('Bad request - please check the name and domain format'))) {
        
        return { 
          success: true, 
          message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connection test successful! API key is valid.`,
          credits: result.data?.credits_remaining || 'Unknown',
          note: result.error ? 'API key valid - test search had expected result' : 'API key valid - test successful'
        };
      } 
      
      // If we get authentication errors, it's a failure (but NOT format errors for VoilaNorbert)
      if (result.error && (
          result.error.includes('Invalid API key') ||
          result.error.includes('unauthorized') ||
          result.error.includes('forbidden') ||
          (result.error.includes('Bad request') && provider !== 'voilanorbert') ||
          (result.error.includes('please check the name and domain format') && provider !== 'voilanorbert')
      )) {
        return { 
          success: false, 
          error: `Invalid ${provider} API key: ${result.error}` 
        };
      } else {
        return { 
          success: false, 
          error: result.error || `Failed to connect to ${provider}` 
        };
      }
    } catch (error) {
      console.error(`Error testing ${provider}:`, error);
      return { 
        success: false, 
        error: `Connection test failed: ${error.message}` 
      };
    }
  }

  // Test SendGrid API connection
  async testSendGridConnection(apiKey) {
    try {
      console.log('🔌 Testing SendGrid API connection...');
      
      // SendGrid API test - check API key validity
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: 'SendGrid connection successful!',
          account: data.username || 'Connected'
        };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid SendGrid API key' };
      } else {
        return { success: false, error: `SendGrid API error: ${response.status}` };
      }
    } catch (error) {
      console.error('SendGrid test error:', error);
      return { success: false, error: `Connection failed: ${error.message}` };
    }
  }

  // Test Mailgun API connection
  async testMailgunConnection(apiKey, domain) {
    try {
      console.log('🔌 Testing Mailgun API connection...');
      
      if (!domain) {
        return { success: false, error: 'Mailgun domain is required' };
      }

      // Mailgun requires Basic Auth
      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`api:${apiKey}`)
        }
      });

      // 405 means the endpoint works but GET isn't allowed (which is expected)
      // This confirms the API key is valid
      if (response.ok || response.status === 405 || response.status === 400) {
        return { 
          success: true, 
          message: 'Mailgun connection successful!',
          domain: domain
        };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid Mailgun API key' };
      } else {
        return { success: false, error: `Mailgun API error: ${response.status}` };
      }
    } catch (error) {
      console.error('Mailgun test error:', error);
      return { success: false, error: `Connection failed: ${error.message}` };
    }
  }

  // Generic connection handler for all integration types
  async connectService(serviceId, options) {
    try {
      const { tenantId, userId, integration, config } = options;
      
      console.log('🔗 connectService called with:', {
        serviceId,
        tenantId: tenantId?.substring(0, 8) + '...',
        configKeys: Object.keys(config || {}),
        apiKey: config?.apiKey?.substring(0, 8) + '...'
      });
      
      if (!config || Object.keys(config).length === 0) {
        return { success: false, error: 'Configuration data is required' };
      }

      // Route to specific handlers based on service type
      switch (serviceId) {
        case 'openai':
        case 'anthropic':
        case 'gemini':
        case 'perplexity':
        case 'deepseek':
          return await this.saveIntegrationCredentials(tenantId, serviceId, {
            apiKey: config.apiKey,
            provider: serviceId
          });

        case 'gmail':
        case 'outlook':
          return await this.saveIntegrationCredentials(tenantId, serviceId, {
            email: config.email,
            appPassword: config.appPassword || config.password
          });

        case 'zoho-mail':
          return await this.saveIntegrationCredentials(tenantId, serviceId, {
            email: config.email,
            password: config.password
          });

        case 'hunter-io':
          if (config.apiKey) {
            return await this.connectHunterIO(tenantId, config.apiKey);
          }
          return { success: false, error: 'API key is required for Hunter.io' };

        case 'prospeo-io':
          if (config.apiKey) {
            return await this.connectProspeo(tenantId, config.apiKey);
          }
          return { success: false, error: 'API key is required for Prospeo.io' };

        case 'voila-norbert':
          if (config.apiKey) {
            return await this.connectVoilaNorbert(tenantId, config.apiKey);
          }
          return { success: false, error: 'API key is required for Voila Norbert' };

        case 'rocketreach':
          if (config.apiKey) {
            return await this.connectRocketReach(tenantId, config.apiKey);
          }
          return { success: false, error: 'API key is required for RocketReach' };

        case 'apollo':
          if (config.apiKey) {
            return await this.connectApollo(tenantId, config.apiKey);
          }
          return { success: false, error: 'API key is required for Apollo.io' };

        case 'clearbit':
        case 'zoominfo':
          return await this.saveIntegrationCredentials(tenantId, serviceId, config);

        default:
          // For services that don't have specific handlers yet, just save the credentials
          return await this.saveIntegrationCredentials(tenantId, serviceId, config);
      }
    } catch (error) {
      console.error(`Error connecting ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Generic disconnection handler
  async disconnectService(serviceId, options) {
    try {
      const { tenantId } = options;
      const credentialsDoc = doc(db, 'MarketGenie_tenants', tenantId, 'integrations', serviceId);
      
      await updateDoc(credentialsDoc, {
        status: 'disconnected',
        disconnectedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error(`Error disconnecting ${serviceId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get connection status for any service
  async getConnectionStatus(serviceId, tenantId = null) {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Use provided tenantId or fallback to user.uid
      const actualTenantId = tenantId || user.uid;
      
      const credentialsDoc = doc(db, 'MarketGenie_tenants', actualTenantId, 'integrations', serviceId);
      const docSnap = await getDoc(credentialsDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
          success: true, 
          data: data,
          isConnected: data.status === 'connected'
        };
      }
      
      return { success: false, data: null, isConnected: false };
    } catch (error) {
      console.error(`Error checking ${serviceId} status:`, error);
      return { success: false, error: error.message, isConnected: false };
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