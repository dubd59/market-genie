// Test new Prospeo API key
import https from 'https';

function testNewProspeoKey() {
  const newApiKey = 'f5526d834d7ad4eba595ddee37494a27';
  
  console.log('🧪 Testing NEW Prospeo API key...');
  console.log('Key preview:', newApiKey.substring(0, 8) + '...');
  
  const options = {
    hostname: 'api.prospeo.io',
    port: 443,
    path: '/account-information',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-KEY': newApiKey
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
          console.log('✅ NEW API key is VALID!');
          console.log('Credits remaining:', parsed.response?.remaining_credits);
          testEmailFinder(newApiKey);
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

function testEmailFinder(apiKey) {
  console.log('\n🔍 Testing email finder with new key...');
  
  const data = JSON.stringify({
    first_name: 'Joel',
    last_name: 'Gascoigne',
    domain: 'buffer.com'
  });
  
  const options = {
    hostname: 'api.prospeo.io',
    port: 443,
    path: '/email-finder',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-KEY': apiKey,
      'Content-Length': data.length
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Email finder status: ${res.statusCode}`);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Email finder response:', responseData);
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.error === false && parsed.response?.email) {
          console.log('🎉 EMAIL FOUND:', parsed.response.email);
          console.log('✅ New API key works perfectly!');
        } else if (parsed.error === true) {
          console.log('⚠️  No email found, but API key works:', parsed.message);
        }
      } catch (e) {
        console.log('Email finder response not JSON:', responseData);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Email finder error: ${e.message}`);
  });
  
  req.write(data);
  req.end();
}

testNewProspeoKey();