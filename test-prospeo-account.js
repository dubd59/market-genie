// Test Prospeo account endpoint
import https from 'https';

function testProspeoAccount() {
  const apiKey = 'pk_d96cfaf95fe8e43df4e5e4346b949ba4f9ff16b5';
  
  console.log('🧪 Testing Prospeo account endpoint...');
  
  const options = {
    hostname: 'api.prospeo.io',
    port: 443,
    path: '/account-information',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-KEY': apiKey
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', responseData);
      try {
        const parsed = JSON.parse(responseData);
        console.log('Parsed JSON:', parsed);
        
        if (parsed.error === false) {
          console.log('✅ API key is valid!');
          console.log('Credits remaining:', parsed.response?.remaining_credits);
        } else {
          console.log('❌ API key issue:', parsed.message);
        }
      } catch (e) {
        console.log('Not valid JSON, raw response:', responseData);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });
  
  req.end();
}

testProspeoAccount();