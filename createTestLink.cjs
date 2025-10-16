// Create a manual unsubscribe link for testing
const tenantId = '8ZJY8LY3g2H3Mw2eRcmd';
const email = 'dubdvideo@gmail.com';  // Use the email that's actually in contacts
const campaignId = 'test_campaign_123';

const data = {
  tenantId,
  email: email.toLowerCase(),
  campaignId,
  timestamp: Date.now()
};

// Create token
const token = btoa(JSON.stringify(data)).replace(/[^a-zA-Z0-9]/g, '');
const unsubscribeUrl = `https://us-central1-market-genie-f2d41.cloudfunctions.net/processUnsubscribe?token=${token}`;

console.log('🔗 Manual Unsubscribe Link:');
console.log(unsubscribeUrl);
console.log('');
console.log('📧 Email:', email);
console.log('🏢 Tenant:', tenantId);
console.log('🎯 Token:', token);