// Test different Prospeo formats
import https from 'https';

async function testDifferentFormats() {
  const apiKey = 'f5526d834d7ad4eba595ddee37494a27';
  
  const formats = [
    {
      name: 'Format 1: Domain as company',
      data: {
        first_name: 'Joel',
        last_name: 'Gascoigne',
        company: 'buffer.com'
      }
    },
    {
      name: 'Format 2: Company name from domain',
      data: {
        first_name: 'Joel',
        last_name: 'Gascoigne', 
        company: 'Buffer'
      }
    },
    {
      name: 'Format 3: Just domain field',
      data: {
        first_name: 'Joel',
        last_name: 'Gascoigne',
        domain: 'buffer.com'
      }
    },
    {
      name: 'Format 4: Both company and domain',
      data: {
        first_name: 'Joel',
        last_name: 'Gascoigne',
        company: 'Buffer',
        domain: 'buffer.com'
      }
    }
  ];
  
  for (const format of formats) {
    console.log(`\n🧪 Testing ${format.name}...`);
    console.log('Data:', JSON.stringify(format.data, null, 2));
    
    await new Promise((resolve) => {
      const data = JSON.stringify(format.data);
      
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
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (parsed.error === false) {
              console.log('✅ SUCCESS!', parsed.response?.email);
            } else {
              console.log('❌ Error:', parsed.message);
            }
          } catch (e) {
            console.log('❌ Invalid JSON:', responseData);
          }
          resolve();
        });
      });
      
      req.on('error', (e) => {
        console.error(`❌ Request error: ${e.message}`);
        resolve();
      });
      
      req.write(data);
      req.end();
    });
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testDifferentFormats();