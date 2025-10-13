// Fix user custom claims for CRM access
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'market-genie-f2d41'
  });
  
  console.log('✅ Firebase Admin initialized successfully!');
} catch (error) {
  console.log('❌ Error loading service account key:', error.message);
  process.exit(1);
}

async function fixUserClaims() {
  const uid = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
  
  try {
    console.log('🔧 Setting custom claims for user...');
    
    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(uid, {
      tenantId: 'founder-tenant',
      role: 'super-admin',
      isSuperAdmin: true,
      isFounder: true,
      permissions: {
        canAccessAllTenants: true,
        canManageUsers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageBilling: true
      }
    });
    
    console.log('✅ Custom claims set successfully!');
    
    // Also update the user document to ensure consistency
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    
    await userRef.update({
      tenantId: 'founder-tenant',
      role: 'super-admin',
      isSuperAdmin: true,
      isFounder: true,
      permissions: {
        canAccessAllTenants: true,
        canManageUsers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageBilling: true,
        canManageIntegrations: true,
        canExportData: true,
        canDeleteData: true
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ User document updated successfully!');
    
    console.log(`
🎉 USER CLAIMS FIXED!

Your user now has:
- tenantId: "founder-tenant" 
- role: "super-admin"
- isSuperAdmin: true
- Full permissions for all operations

🔄 NEXT STEPS:
1. Sign out of your app
2. Sign back in  
3. The CRM and Pipeline should now work perfectly!

The app will now recognize you as the founder with access to the founder-tenant data.
    `);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting custom claims:', error);
    process.exit(1);
  }
}

fixUserClaims();