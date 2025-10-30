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
        throw new Error(data.error || `Prospeo API error: ${response.status}`);
      }

      if (data.email) {
        return {
          success: true,
          provider: 'prospeo',
          data: {
            email: data.email,
            phone: data.phone || null,
            confidence: data.confidence || 85,
            credits_remaining: data.remaining_credits || 'Unknown',
            source: 'Prospeo.io'
          }
        };
      }
    } else {
      // For domain searches without specific person, use domain-search endpoint
      const response = await fetch('https://api.prospeo.io/domain-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-KEY': apiKey
        },
        body: JSON.stringify({
          domain: domain.replace('www.', '').replace('http://', '').replace('https://', '')
        })
      });

      const data = await response.json();
      console.log('Prospeo domain-search response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `Prospeo API error: ${response.status}`);
      }

      // Check if we found any emails
      if (data.emails && data.emails.length > 0) {
        // Return multiple contacts from domain search
        return {
          success: true,
          provider: 'prospeo',
          data: {
            contacts: data.emails.slice(0, 5).map(email => ({
              email: email.email,
              first_name: email.first_name,
              last_name: email.last_name,
              company: domain,
              phone: email.phone || null,
              confidence: email.confidence || 85,
              source: 'Prospeo.io'
            })),
            credits_remaining: data.remaining_credits || 'Unknown'
          }
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
    // Test account info endpoint first
    const response = await fetch('https://api.prospeo.io/account', {
      headers: {
        'X-KEY': apiKey
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      return res.json({ 
        success: true, 
        message: 'Prospeo.io connection successful!',
        credits: data.remaining_credits || data.credits || 'Unknown'
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
      error: 'Failed to connect to Prospeo.io' 
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