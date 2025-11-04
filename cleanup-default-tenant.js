// 🗑️ SAFE DEFAULT TENANT CLEANUP
// This script will safely delete the anomalous "default-tenant" collection
// Run this in your browser console after confirming your real leads are safe

(async function cleanupDefaultTenant() {
    console.log('🗑️ Starting safe cleanup of default-tenant anomaly...');
    
    try {
        // Use existing Firebase setup from your app
        const db = window.db || window.firestore;
        const auth = window.auth || window.firebase?.auth?.();
        
        if (!db) {
            console.error('❌ Firebase database not found. Make sure you are on the app page.');
            return;
        }
        
        // Get current user
        const user = auth?.currentUser || window.user;
        
        if (!user) {
            console.error('❌ No authenticated user found');
            return;
        }
        
        const realTenantId = user.uid;
        console.log(`👤 Your real tenant ID: ${realTenantId}`);
        
        // STEP 1: Verify your real leads are safe
        console.log('🔍 Step 1: Verifying your real leads are safe...');
        const realLeadsRef = db.collection('tenants').doc(realTenantId).collection('leads');
        const realLeadsSnapshot = await realLeadsRef.get();
        console.log(`✅ Your real leads count: ${realLeadsSnapshot.size}`);
        
        if (realLeadsSnapshot.size === 0) {
            console.error('❌ SAFETY CHECK FAILED: No leads found in your real tenant!');
            console.error('❌ Aborting cleanup to prevent data loss');
            return;
        }
        
        // STEP 2: Count default tenant leads
        console.log('🔍 Step 2: Counting default-tenant leads...');
        const defaultLeadsRef = db.collection('tenants').doc('default-tenant').collection('leads');
        const defaultLeadsSnapshot = await defaultLeadsRef.get();
        console.log(`📊 Default-tenant leads to delete: ${defaultLeadsSnapshot.size}`);
        
        if (defaultLeadsSnapshot.size === 0) {
            console.log('✅ No default-tenant leads found - cleanup not needed');
            return;
        }
        
        // STEP 3: Confirm deletion
        const shouldDelete = confirm(
            `🚨 CONFIRM DELETION:\n\n` +
            `Your real leads: ${realLeadsSnapshot.size} (SAFE)\n` +
            `Default-tenant leads: ${defaultLeadsSnapshot.size} (WILL BE DELETED)\n\n` +
            `Delete the default-tenant anomaly?`
        );
        
        if (!shouldDelete) {
            console.log('❌ Cleanup cancelled by user');
            return;
        }
        
        // STEP 4: Delete in batches (Firestore limit is 500 per batch)
        console.log('🗑️ Step 4: Deleting default-tenant leads...');
        
        const deleteInBatches = async (snapshot) => {
            const batchSize = 500;
            const docs = snapshot.docs;
            let deletedCount = 0;
            
            for (let i = 0; i < docs.length; i += batchSize) {
                const batch = db.batch();
                const batchDocs = docs.slice(i, i + batchSize);
                
                batchDocs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                
                await batch.commit();
                deletedCount += batchDocs.length;
                console.log(`🗑️ Deleted batch: ${deletedCount}/${docs.length}`);
            }
            
            return deletedCount;
        };
        
        const deletedCount = await deleteInBatches(defaultLeadsSnapshot);
        
        console.log(`✅ Cleanup complete!`);
        console.log(`   - Deleted: ${deletedCount} default-tenant leads`);
        console.log(`   - Preserved: ${realLeadsSnapshot.size} real leads`);
        console.log(`🎉 Default-tenant anomaly successfully removed!`);
        
        // STEP 5: Verify cleanup
        console.log('🔍 Step 5: Verifying cleanup...');
        const verifySnapshot = await defaultLeadsRef.get();
        if (verifySnapshot.size === 0) {
            console.log('✅ Verification passed - default-tenant is clean');
        } else {
            console.log(`⚠️ ${verifySnapshot.size} leads still remain - may need another batch`);
        }
        
    } catch (error) {
        console.error('❌ Cleanup error:', error);
    }
})();