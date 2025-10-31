const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

/**
 * Lead Generation API Proxy - Bypasses CORS for Prospeo, VoilaNorbert, and Hunter.io
 * This function acts as a proxy to make API calls on behalf of the frontend
 */
exports.leadGenProxy = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const path = req.path || '/';
      const url = req.url || '/';
      
      console.log('Request path:', path);
      console.log('Request URL:', url);
      console.log('Request method:', req.method);
      
      // Handle test connection endpoints
      if (path.includes('/api/prospeo-test') || url.includes('/api/prospeo-test')) {
        return handleProspeoTest(req, res);
      }
      if (path.includes('/api/voila-account') || url.includes('/api/voila-account')) {
        return handleVoilaAccountTest(req, res);
      }
      if (path.includes('/api/hunter-account') || url.includes('/api/hunter-account')) {
        return handleHunterAccountTest(req, res);
      }

      // Original lead search functionality
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { provider, apiKey, searchData } = req.body;

      if (!provider || !apiKey || !searchData) {
        return res.status(400).json({ 
          error: 'Missing required fields: provider, apiKey, searchData' 
        });
      }

      let result;

      switch (provider) {
        case 'prospeo':
          result = await searchProspeo(apiKey, searchData);
          break;
        case 'voilanorbert':
          result = await searchVoilaNorbert(apiKey, searchData);
          break;
        case 'hunter':
          result = await searchHunter(apiKey, searchData);
          break;
        default:
          return res.status(400).json({ error: 'Invalid provider' });
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error('Lead generation proxy error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });
});

/**
 * Prospeo.io API Integration
 * 75 FREE credits for email + phone finding
 */
async function searchProspeo(apiKey, searchData) {
  const fetch = require('node-fetch');
  
  const { firstName, lastName, company, domain } = searchData;
  
  try {
    // If we have specific person info, use email-finder endpoint
    if (firstName && lastName && firstName !== 'null' && lastName !== 'null') {
      const response = await fetch('https://api.prospeo.io/email-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KEY': apiKey
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          company: company || domain
        })
      });

      const data = await response.json();
      console.log('Prospeo email-finder response:', data);
      
      if (!response.ok) {
        const errorMsg = typeof data.error === 'string' ? data.error : `Prospeo API error: ${response.status}`;
        throw new Error(errorMsg);
      }

      // Check if the API returned an error
      if (data.error === true) {
        // Handle specific Prospeo error codes
        if (data.message === 'NO_RESULT') {
          return {
            success: false,
            provider: 'prospeo',
            error: 'No email found for this person'
          };
        } else if (data.message === 'INVALID_DOMAIN_NAME') {
          return {
            success: false,
            provider: 'prospeo',
            error: 'Invalid domain name provided'
          };
        } else if (data.message === 'NO_VALID_NAME') {
          return {
            success: false,
            provider: 'prospeo',
            error: 'Invalid name provided'
          };
        } else {
          return {
            success: false,
            provider: 'prospeo',
            error: data.message || 'Prospeo API returned an error'
          };
        }
      }

      // Check if email was found in the correct response format
      if (data.response && data.response.email) {
        return {
          success: true,
          provider: 'prospeo',
          data: {
            email: data.response.email,
            first_name: data.response.first_name || firstName,
            last_name: data.response.last_name || lastName,
            domain: data.response.domain || domain,
            email_status: data.response.email_status,
            confidence: 95, // Prospeo emails are high confidence
            source: 'Prospeo.io'
          }
        };
      } else {
        return {
          success: false,
          provider: 'prospeo',
          error: 'No email found for this person'
        };
      }
    } else {
      // For domain searches without specific person, use email-count to check if domain has emails
      const countResponse = await fetch('https://api.prospeo.io/email-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KEY': apiKey
        },
        body: JSON.stringify({
          domain: domain.replace('www.', '').replace('http://', '').replace('https://', '')
        })
      });

      const countData = await countResponse.json();
      console.log('Prospeo email-count response:', countData);
      
      if (!countResponse.ok) {
        throw new Error(countData.error || `Prospeo API error: ${countResponse.status}`);
      }

      // Since domain-search doesn't exist, try common name patterns with email-finder
      if (countData.response && countData.response.count > 0) {
        console.log(`Found ${countData.response.count} emails for ${domain}, trying common names...`);
        
        // Try common executive names
        const commonNames = [
          { first: 'John', last: 'Smith' },
          { first: 'Jane', last: 'Doe' },
          { first: 'Mike', last: 'Johnson' },
          { first: 'Sarah', last: 'Wilson' },
          { first: 'David', last: 'Brown' }
        ];
        
        const foundContacts = [];
        
        for (const name of commonNames.slice(0, 2)) { // Try first 2 to save credits
          try {
            const nameResponse = await fetch('https://api.prospeo.io/email-finder', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-KEY': apiKey
              },
              body: JSON.stringify({
                first_name: name.first,
                last_name: name.last,
                company: domain
              })
            });
            
            const nameData = await nameResponse.json();
            
            if (nameResponse.ok && !nameData.error && nameData.response && nameData.response.email) {
              foundContacts.push({
                email: nameData.response.email,
                first_name: name.first,
                last_name: name.last,
                company: domain,
                phone: nameData.response.mobile || null,
                confidence: 85,
                source: 'Prospeo.io'
              });
            }
          } catch (nameError) {
            console.log(`Error trying ${name.first} ${name.last}:`, nameError.message);
          }
        }
        
        if (foundContacts.length > 0) {
          return {
            success: true,
            provider: 'prospeo',
            data: {
              contacts: foundContacts,
              credits_remaining: countData.response?.credits || 'Unknown'
            }
          };
        } else {
          return {
            success: true,
            provider: 'prospeo',
            data: {
              contacts: [],
              message: `Domain has ${countData.response.count} emails but none found with common names`,
              credits_remaining: countData.response?.credits || 'Unknown'
            }
          };
        }
      } else {
        return {
          success: false,
          provider: 'prospeo',
          error: `No emails found in database for domain: ${domain}`
        };
      }
    }

    return {
      success: false,
      provider: 'prospeo',
      error: 'No email found for this person'
    };

  } catch (error) {
    console.error('Prospeo API error:', error);
    return {
      success: false,
      provider: 'prospeo',
      error: error.message
    };
  }
}

/**
 * VoilaNorbert API Integration
 * 50 FREE credits for email finding
 * API Key format: UUID (e.g., 0d318619-49f1-43d1-b696-c7164a5b160f)
 */
async function searchVoilaNorbert(apiKey, searchData) {
  const fetch = require('node-fetch');
  
  const { firstName, lastName, domain } = searchData;
  
  try {
    console.log('VoilaNorbert search request:', {
      name: `${firstName} ${lastName}`,
      domain: domain,
      apiKey: apiKey.substring(0, 8) + '...' // Log partial key for debugging
    });

    // Search for the email directly using the 2018-01-08 API
    const response = await fetch('https://api.voilanorbert.com/2018-01-08/search/name', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        domain: domain.replace('www.', '').replace('http://', '').replace('https://', '')
      })
    });

    console.log('VoilaNorbert response status:', response.status);
    
    const data = await response.json();
    console.log('VoilaNorbert API response:', data);
    
    if (!response.ok) {
      // Check for specific error messages
      if (response.status === 401) {
        throw new Error('Invalid API key - please check your VoilaNorbert API key');
      } else if (response.status === 403) {
        throw new Error('API access forbidden - please check your VoilaNorbert plan');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else if (response.status === 400) {
        throw new Error('Bad request - please check the name and domain format');
      } else {
        throw new Error(data.message || `VoilaNorbert API error: ${response.status}`);
      }
    }

    // Check if email was found
    if (data.email && data.email.email) {
      return {
        success: true,
        provider: 'voilanorbert',
        data: {
          email: data.email.email,
          confidence: data.email.score || 85,
          credits_remaining: data.account?.search_left || 'Unknown',
          source: 'VoilaNorbert'
        }
      };
    } else if (data.account) {
      // API key is valid but no email found for this search
      return {
        success: true,
        provider: 'voilanorbert',
        data: {
          email: null,
          confidence: 0,
          credits_remaining: data.account.search_left || 'Unknown',
          source: 'VoilaNorbert',
          message: 'No email found for this person'
        }
      };
    } else {
      // Check if we have any response that indicates successful API call
      return {
        success: false,
        provider: 'voilanorbert',
        error: 'No email found for this person'
      };
    }

  } catch (error) {
    console.error('VoilaNorbert API error:', error);
    return {
      success: false,
      provider: 'voilanorbert',
      error: error.message
    };
  }
}

/**
 * Hunter.io API Integration
 * 50 FREE credits per month for email finding
 */
async function searchHunter(apiKey, searchData) {
  const fetch = require('node-fetch');
  
  const { firstName, lastName, domain } = searchData;
  
  try {
    // Use the correct Hunter.io email finder endpoint
    const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(firstName)}&last_name=${encodeURIComponent(lastName)}&api_key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Hunter API response:', data);
    
    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.details || data.message || `Hunter.io API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Check if email was found
    if (data.data && data.data.email) {
      return {
        success: true,
        provider: 'hunter',
        data: {
          email: data.data.email,
          confidence: data.data.confidence || 85,
          credits_remaining: data.meta?.requests?.left || 'Unknown',
          source: 'Hunter.io'
        }
      };
    } else {
      return {
        success: false,
        provider: 'hunter',
        error: 'No email found for this person'
      };
    }

  } catch (error) {
    console.error('Hunter API error:', error);
    return {
      success: false,
      provider: 'hunter',
      error: error.message
    };
  }
}

/**
 * Test connection handlers
 */

// Test Prospeo.io connection
async function handleProspeoTest(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  const fetch = require('node-fetch');
  
  try {
    console.log('Testing Prospeo API with key:', apiKey.substring(0, 8) + '...');
    
    // Test account info endpoint first - CORRECT ENDPOINT
    const response = await fetch('https://api.prospeo.io/account-information', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KEY': apiKey
      }
    });

    console.log('Prospeo API response status:', response.status);
    console.log('Prospeo API response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Prospeo API response data:', data);
    
    if (response.ok && data.error === false) {
      return res.json({ 
        success: true, 
        message: 'Prospeo.io connection successful!',
        credits: data.response?.remaining_credits || 'Unknown'
      });
    } else {
      // Handle Prospeo API errors more specifically
      let errorMessage = 'Connection failed';
      
      if (data.error === true) {
        errorMessage = data.message || 'Prospeo API returned an error';
      } else if (data.error) {
        errorMessage = typeof data.error === 'string' ? data.error : 'API error';
      } else if (!response.ok) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      return res.json({ 
        success: false, 
        error: errorMessage,
        details: data
      });
    }
  } catch (error) {
    console.error('Prospeo test error:', error);
    return res.json({ 
      success: false, 
      error: `Connection failed: ${error.message}`,
      stack: error.stack
    });
  }
}

// Test Voila Norbert connection
async function handleVoilaAccountTest(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  const fetch = require('node-fetch');
  
  try {
    // Test account info endpoint with correct header format
    const response = await fetch('https://api.voilanorbert.com/2018-01-08/account/info', {
      headers: {
        'X-API-KEY': apiKey
      }
    });

    const data = await response.json();
    
    if (response.ok && data.credits !== undefined) {
      return res.json({ 
        success: true, 
        message: 'Voila Norbert connection successful!',
        credits: data.credits
      });
    } else {
      return res.json({ 
        success: false, 
        error: data.error || 'Invalid API key or connection failed' 
      });
    }
  } catch (error) {
    return res.json({ 
      success: false, 
      error: 'Failed to connect to Voila Norbert' 
    });
  }
}

// Test Hunter.io connection
async function handleHunterAccountTest(req, res) {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'API key is required as query parameter' });
  }

  const fetch = require('node-fetch');
  
  try {
    // Test account info endpoint
    const response = await fetch(`https://api.hunter.io/v2/account?api_key=${key}`);
    const data = await response.json();
    
    if (response.ok && data.data) {
      return res.json({ 
        success: true, 
        message: 'Hunter.io connection successful!',
        credits: data.data.requests?.left || 'Unknown'
      });
    } else {
      return res.json({ 
        success: false, 
        error: data.errors?.[0]?.details || 'Invalid API key or connection failed' 
      });
    }
  } catch (error) {
    return res.json({ 
      success: false, 
      error: 'Failed to connect to Hunter.io' 
    });
  }
}