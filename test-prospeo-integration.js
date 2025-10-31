// Test script to verify Prospeo integration works
// Run this in the browser console to test the integration

async function testProspeoIntegration() {
  console.log('🧪 TESTING PROSPEO INTEGRATION');
  
  try {
    // Import the services
    const IntegrationService = new (await import('./src/services/integrationService.js')).default();
    const { useTenant } = await import('./src/contexts/TenantContext.jsx');
    
    // Get current tenant ID (you'll need to replace this with actual tenant ID)
    const tenantId = 'YOUR_TENANT_ID_HERE'; // Replace with actual tenant ID
    
    console.log('1️⃣ Testing Prospeo API connection...');
    
    // Test domain search with Prospeo
    const testResult = await IntegrationService.searchDomainProspeo(tenantId, 'tesla.com', 3);
    
    if (testResult.success) {
      console.log('✅ SUCCESS! Prospeo returned leads:');
      console.log('📧 Found contacts:', testResult.data);
      console.log('💰 Credits remaining:', testResult.credits_remaining);
      
      // Test the lead service multi-provider search
      console.log('\n2️⃣ Testing multi-provider lead generation...');
      const LeadService = new (await import('./src/services/leadService.js')).default();
      const leadResult = await LeadService.searchDomainMultiProvider(tenantId, 'tesla.com', 2);
      
      if (leadResult.success) {
        console.log('✅ SUCCESS! Multi-provider search worked:');
        console.log('📧 Found leads:', leadResult.data);
      } else {
        console.log('❌ Multi-provider search failed:', leadResult.error);
      }
      
    } else {
      console.log('❌ FAILED! Prospeo API error:', testResult.error);
    }
    
  } catch (error) {
    console.log('💥 TEST FAILED with error:', error);
  }
}

// Instructions:
console.log(`
🧪 PROSPEO INTEGRATION TEST
===========================

1. Open browser developer tools (F12)
2. Go to Market Genie application 
3. Copy and paste this entire script
4. Replace 'YOUR_TENANT_ID_HERE' with your actual tenant ID
5. Run: testProspeoIntegration()

Expected result: Should show leads from tesla.com using Prospeo API
`);

// Uncomment the line below to run the test automatically:
// testProspeoIntegration();