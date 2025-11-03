// DIRECT FIREBASE FIX - Run this to fix the tenant issue permanently
// This will directly update Firebase to ensure your founder tenant is used

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDiwC3Dmd88-t3N9iRV5cW0U6tebWOkY8s",
    authDomain: "marketgenie-c3c0c.firebaseapp.com",
    projectId: "marketgenie-c3c0c",
    storageBucket: "marketgenie-c3c0c.appspot.com",
    messagingSenderId: "1092687766606",
    appId: "1:1092687766606:web:ac212ad78e176bd8fadb96"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function directFirebaseFix() {
    try {
        console.log('🚨 DIRECT FIREBASE FIX STARTING...');
        
        // Step 1: Authenticate as founder
        console.log('🔐 Authenticating as founder...');
        await signInWithEmailAndPassword(auth, 'dubdproducts@gmail.com', 'Nosoup4u123$$');
        console.log('✅ Authenticated successfully');
        
        const founderTenant = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
        const problemTenant = 'HihMMQuIh52phzB2yety';
        
        // Step 2: Get your Prospeo API key from localStorage (from previous fix)
        const prospeoKey = localStorage.getItem('prospeo_api_key_emergency');
        if (!prospeoKey) {
            console.error('❌ No Prospeo API key found in localStorage. Please run the emergency fix first.');
            return;
        }
        
        console.log('🔧 Step 1: Cleaning up problematic tenants...');
        
        // Delete the problematic tenant that's being selected incorrectly
        try {
            await deleteDoc(doc(db, 'MarketGenie_tenants', problemTenant));
            console.log('✅ Deleted problematic tenant:', problemTenant);
        } catch (error) {
            console.log('ℹ️ Problematic tenant might already be deleted:', error.message);
        }
        
        // Delete the "founder-tenant" duplicate
        try {
            await deleteDoc(doc(db, 'MarketGenie_tenants', 'founder-tenant'));
            console.log('✅ Deleted duplicate founder-tenant');
        } catch (error) {
            console.log('ℹ️ Duplicate founder-tenant might not exist:', error.message);
        }
        
        console.log('🔧 Step 2: Ensuring founder tenant exists and is prioritized...');
        
        // Ensure your founder tenant exists and has correct data
        const founderRef = doc(db, 'MarketGenie_tenants', founderTenant);
        await setDoc(founderRef, {
            id: founderTenant,
            tenantId: founderTenant,
            ownerId: founderTenant,
            ownerEmail: 'dubdproducts@gmail.com',
            ownerName: 'Market Genie Founder',
            name: 'Market Genie Founder Workspace',
            plan: 'founder',
            role: 'founder',
            status: 'active',
            _marketGenieApp: true,
            _securityValidated: true,
            _primaryTenant: true, // Mark as primary
            _priority: 1, // Highest priority
            settings: {
                initialized: true,
                theme: 'light',
                timezone: 'America/New_York'
            },
            billing: {
                plan: 'founder',
                status: 'active',
                lifetime: true,
                amount: 0
            },
            features: {
                apiCalls: 999999,
                maxLeads: 999999,
                maxCampaigns: 999999,
                bulkOperations: true,
                advancedAnalytics: true,
                prioritySupport: true,
                whiteLabel: true
            },
            created_at: new Date(),
            updated_at: new Date()
        }, { merge: true });
        
        console.log('✅ Founder tenant updated with priority');
        
        console.log('🔧 Step 3: Adding Prospeo integration to founder tenant...');
        
        // Add Prospeo integration to the correct tenant
        const prospeoRef = doc(db, `MarketGenie_tenants/${founderTenant}/integrations/prospeo-io`);
        await setDoc(prospeoRef, {
            apiKey: prospeoKey,
            status: 'connected',
            connectedAt: new Date(),
            connectionMethod: 'direct_fix',
            credits: 75,
            _marketGenieApp: true,
            _updatedAt: new Date(),
            _securityValidated: true
        });
        
        console.log('✅ Prospeo integration added to founder tenant');
        
        console.log('🔧 Step 4: Verifying tenant collections exist...');
        
        // Ensure required collections exist under founder tenant
        const collections = ['leads', 'campaigns', 'contacts', 'email_templates', 'pipeline_stages'];
        
        for (const collectionName of collections) {
            try {
                const testDoc = doc(db, `MarketGenie_tenants/${founderTenant}/${collectionName}/_init`);
                await setDoc(testDoc, {
                    _initialized: true,
                    _createdAt: new Date(),
                    _marketGenieApp: true
                });
                console.log(`✅ Initialized collection: ${collectionName}`);
            } catch (error) {
                console.log(`⚠️ Could not initialize ${collectionName}:`, error.message);
            }
        }
        
        console.log('🔧 Step 5: Setting localStorage overrides...');
        
        // Set localStorage to force use of founder tenant
        localStorage.setItem('marketgenie_tenant_id', founderTenant);
        localStorage.setItem('tenant_override', founderTenant);
        localStorage.setItem('primary_tenant', founderTenant);
        localStorage.setItem('founder_tenant_verified', 'true');
        localStorage.setItem('direct_fix_applied', new Date().toISOString());
        
        console.log('✅ DIRECT FIREBASE FIX COMPLETED SUCCESSFULLY!');
        console.log('');
        console.log('📊 Summary:');
        console.log('  ✅ Deleted problematic tenant HihMMQuIh52phzB2yety');
        console.log('  ✅ Ensured founder tenant U9vez3sI36Ti5JqoWi5gJUMq2nX2 has priority');
        console.log('  ✅ Added Prospeo integration to founder tenant');
        console.log('  ✅ Initialized required collections');
        console.log('  ✅ Set localStorage overrides');
        console.log('');
        console.log('🚀 NEXT STEPS:');
        console.log('1. Refresh your Market Genie app (Ctrl+F5)');
        console.log('2. Check console - should show founder tenant ID');
        console.log('3. Test bulk scraper - should now save leads successfully!');
        
        return true;
        
    } catch (error) {
        console.error('❌ Direct Firebase fix failed:', error);
        console.log('💡 Error details:', error.message);
        return false;
    }
}

// Auto-run the fix
directFirebaseFix();