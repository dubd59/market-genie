import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRdYaXJkJNZIkMzKM4cZEFTADOJJhDiEs",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "1023666208479",
  appId: "1:1023666208479:web:7cf3c7b4db4b24cfb02e6c",
  measurementId: "G-SZS1W4K0NB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Founder Account Setup
async function createFounderAccount() {
  const founderEmail = 'dubdproducts@gmail.com';
  const founderPassword = 'MarketGenie2025!'; // You can change this
  
  try {
    console.log('Creating founder account...');
    
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, founderEmail, founderPassword);
    const user = userCredential.user;
    
    console.log('✅ Firebase Auth account created:', user.uid);
    
    // Update the user profile
    await updateProfile(user, {
      displayName: 'Founder - Market Genie'
    });
    
    // Create the user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: founderEmail,
      displayName: 'Founder - Market Genie',
      role: 'super-admin',
      tenantId: 'founder-tenant',
      isSuperAdmin: true,
      isFounder: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      permissions: {
        canAccessAllTenants: true,
        canManageUsers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageBilling: true
      },
      profile: {
        firstName: 'Founder',
        lastName: 'Admin',
        company: 'Market Genie',
        phone: '',
        avatar: ''
      }
    });
    
    console.log('✅ User document created in Firestore');
    
    // Verify the founder tenant exists
    const founderTenantRef = doc(db, 'tenants', 'founder-tenant');
    await setDoc(founderTenantRef, {
      id: 'founder-tenant',
      name: 'Market Genie - Founder Account',
      domain: 'marketgenie.com',
      ownerId: user.uid,
      plan: 'enterprise',
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      settings: {
        maxUsers: 1000,
        maxDeals: 50000,
        featuresEnabled: {
          crm: true,
          automation: true,
          analytics: true,
          integrations: true,
          aiFeatures: true
        }
      },
      billing: {
        plan: 'enterprise',
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    }, { merge: true });
    
    console.log('✅ Founder tenant verified/updated');
    
    console.log(`
🎉 FOUNDER ACCOUNT SETUP COMPLETE!

📧 Email: ${founderEmail}
🔐 Password: ${founderPassword}
👤 User ID: ${user.uid}
🏢 Tenant: founder-tenant
⚡ Role: Super Admin

You can now sign in to your Market Genie application!
    `);
    
    return {
      success: true,
      user: user,
      credentials: {
        email: founderEmail,
        password: founderPassword
      }
    };
    
  } catch (error) {
    console.error('❌ Error creating founder account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('Account already exists. Attempting to sign in...');
      try {
        const signInResult = await signInWithEmailAndPassword(auth, founderEmail, founderPassword);
        console.log('✅ Successfully signed in to existing account');
        return {
          success: true,
          user: signInResult.user,
          credentials: {
            email: founderEmail,
            password: founderPassword
          }
        };
      } catch (signInError) {
        console.error('❌ Could not sign in to existing account:', signInError);
        console.log('Please reset password or use different credentials');
      }
    }
    
    return {
      success: false,
      error: error
    };
  }
}

// Run the setup
createFounderAccount()
  .then(result => {
    if (result.success) {
      console.log('🚀 Setup completed successfully!');
      process.exit(0);
    } else {
      console.log('❌ Setup failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });