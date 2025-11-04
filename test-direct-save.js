// DIRECT LEAD SAVE TEST - Cut through all the complex code
// Run this in your browser console to test the basic save operation

async function testDirectLeadSave() {
  console.log('🧪 TESTING DIRECT LEAD SAVE');
  console.log('===========================');
  
  try {
    // Get tenant info
    const tenant = window.tenant || { id: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2' };
    console.log('🏢 Using tenant:', tenant.id);
    
    // Test lead data
    const testLead = {
      firstName: 'Test',
      lastName: 'Lead',
      email: 'test.lead@example.com',
      company: 'Test Company',
      phone: '',
      title: 'Test Executive',
      source: 'direct-test',
      notes: 'Direct test lead to diagnose save issues'
    };
    
    console.log('📊 Test lead data:', testLead);
    
    // Import LeadService
    if (!window.LeadService) {
      console.log('⚠️ LeadService not available globally, trying to import...');
      try {
        const { default: LeadService } = await import('./src/services/leadService.js');
        window.LeadService = LeadService;
        console.log('✅ LeadService imported successfully');
      } catch (importError) {
        console.error('❌ Failed to import LeadService:', importError.message);
        return false;
      }
    }
    
    console.log('💾 Attempting direct save...');
    const startTime = Date.now();
    
    // Simple direct save - no timeout, no retries, no emergency systems
    const result = await window.LeadService.createLead(tenant.id, testLead);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ Save took ${duration}ms`);
    
    if (result.success) {
      console.log('✅ DIRECT SAVE SUCCESSFUL!');
      console.log('📋 Saved lead:', result.data);
      console.log('🆔 Lead ID:', result.data.id);
      return true;
    } else {
      console.log('❌ DIRECT SAVE FAILED!');
      console.log('💥 Error:', result.error);
      console.log('📋 Full result:', result);
      return false;
    }
    
  } catch (error) {
    console.error('💥 DIRECT SAVE ERROR:', error);
    console.error('📋 Error details:', error.message);
    console.error('📋 Stack trace:', error.stack);
    return false;
  }
}

console.log('🧪 Direct Lead Save Test loaded');
console.log('Run: testDirectLeadSave() to test basic save functionality');
console.log('This bypasses all complex retry logic and emergency systems');