// Database initialization script
const admin = require('firebase-admin');

// Initialize with service account (you'll need to download this from Firebase Console)
// For now, we'll use the web SDK approach

const founderTenantData = {
  id: 'founder_master_tenant',
  name: 'Market Genie - Founder Account',
  domain: 'marketgenie.com',
  type: 'master',
  ownerId: 'founder',  
  ownerEmail: 'dubdproducts@gmail.com',
  isFounderAccount: true,
  isMasterTenant: true,
  tenantId: 'founder_master_tenant',
  settings: {
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  },
  subscription: {
    plan: 'founder',
    status: 'lifetime',
    features: ['all']
  },
  permissions: {
    superAdmin: true,
    systemAccess: true
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('🔥 Founder tenant data ready for Firebase:');
console.log(JSON.stringify(founderTenantData, null, 2));

console.log('\n📋 To initialize manually in Firebase Console:');
console.log('1. Go to Firestore Database');
console.log('2. Click "Start collection"');
console.log('3. Collection ID: "tenants"');
console.log('4. Document ID: "founder_master_tenant"');
console.log('5. Copy the data above');