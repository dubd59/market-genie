// Simple Prospeo API test
import https from 'https';

function testProspeoSimple() {
  const apiKey = 'pk_d96cfaf95fe8e43df4e5e4346b949ba4f9ff16b5';
  
  console.log('🧪 Testing Prospeo API with simple request...');
  
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
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response body:', responseData);
      try {
        const parsed = JSON.parse(responseData);
        console.log('Parsed JSON:', parsed);
      } catch (e) {
        console.log('Not valid JSON, raw response:', responseData);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });
  
  req.write(data);
  req.end();
}

testProspeoSimple();