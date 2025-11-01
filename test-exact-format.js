// Test exact format we're sending to Prospeo
import https from 'https';

function testExactFormat() {
  const apiKey = 'f5526d834d7ad4eba595ddee37494a27';
  
  console.log('🧪 Testing EXACT format we send from Firebase function...');
  
  // This matches exactly what our Firebase function sends
  const data = JSON.stringify({
    first_name: 'Joel',
    last_name: 'Gascoigne', 
    domain: 'buffer.com'
    // NO company parameter at all
  });
  
  console.log('Sending:', data);
  
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
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', responseData);
      try {
        const parsed = JSON.parse(responseData);
        if (parsed.error === false) {
          console.log('🎉 SUCCESS! Email found:', parsed.response?.email);
        } else {
          console.log('❌ Error:', parsed.message);
        }
      } catch (e) {
        console.log('Response not JSON:', responseData);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
  });
  
  req.write(data);
  req.end();
}

testExactFormat();