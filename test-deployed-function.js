// Test the deployed Firebase function
const testDeployedFunction = async () => {
  console.log('🧪 Testing DEPLOYED Firebase function...');
  
  const data = {
    provider: 'prospeo',
    apiKey: 'f5526d834d7ad4eba595ddee37494a27',
    searchData: {
      firstName: 'Joel',
      lastName: 'Gascoigne',
      domain: 'buffer.com',
      company: 'Buffer'
    }
  };
  
  try {
    const response = await fetch('https://leadgenproxy-aopxj7f3aa-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('✅ Function response:', result);
    
    if (result.success && result.data?.email) {
      console.log('🎉 SUCCESS! Email found:', result.data.email);
      console.log('✅ Firebase function is working perfectly!');
    } else {
      console.log('❌ Function error:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testDeployedFunction();