// Test Prospeo API key directly with Node.js (no CORS issues)
import https from 'https';

const API_KEY = 'af031c01367fd2aede39804a69094b84';

console.log('🧪 TESTING PROSPEO API KEY WITH NODE.JS');
console.log('🔑 API Key:', API_KEY.substring(0, 8) + '...');

// Test account endpoint
const options = {
  hostname: 'api.prospeo.io',
  path: '/account',
  method: 'GET',
  headers: {
    'X-KEY': API_KEY,
    'Content-Type': 'application/json',
    'User-Agent': 'MarketGenie/1.0'
  }
};

const req = https.request(options, (res) => {
  console.log('📊 Response Status:', res.statusCode);
  console.log('📋 Response Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Account Response:', result);
      
      if (res.statusCode === 200 && result.remaining_credits !== undefined) {
        console.log('🎉 SUCCESS! API Key is valid!');
        console.log('💰 Credits remaining:', result.remaining_credits);
        console.log('📋 Plan:', result.plan || 'Free');
        
        // Now test domain search
        testDomainSearch();
      } else {
        console.log('❌ API Key validation failed');
        console.log('💥 Error details:', result);
      }
    } catch (error) {
      console.log('💥 JSON Parse Error:', error.message);
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('💥 Request Error:', error.message);
});

req.end();

function testDomainSearch() {
  console.log('\n🔍 TESTING DOMAIN SEARCH...');
  
  const searchData = JSON.stringify({
    domain: 'tesla.com'
  });
  
  const searchOptions = {
    hostname: 'api.prospeo.io',
    path: '/domain-search',
    method: 'POST',
    headers: {
      'X-KEY': API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'MarketGenie/1.0',
      'Content-Length': Buffer.byteLength(searchData)
    }
  };
  
  const searchReq = https.request(searchOptions, (res) => {
    console.log('📊 Search Response Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('📧 Domain Search Response:', result);
        
        if (res.statusCode === 200 && result.emails) {
          console.log('🎉 DOMAIN SEARCH SUCCESS!');
          console.log('📧 Found emails:', result.emails.length);
          console.log('👥 Sample contacts:', result.emails.slice(0, 3));
          console.log('💰 Credits remaining:', result.remaining_credits);
          console.log('\n🎯 YOUR PROSPEO INTEGRATION IS WORKING! 🎯');
        } else {
          console.log('❌ Domain search failed');
          console.log('💥 Error details:', result);
        }
      } catch (error) {
        console.log('💥 JSON Parse Error:', error.message);
        console.log('📄 Raw response:', data);
      }
    });
  });
  
  searchReq.on('error', (error) => {
    console.log('💥 Search Request Error:', error.message);
  });
  
  searchReq.write(searchData);
  searchReq.end();
}