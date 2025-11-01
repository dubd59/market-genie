// 🚨 // 🚨 ENHANCED FIREBASE CONNECTION TESTER v2
// Copy and paste this entire code into browser console
// Comprehensive test for WebChannel connection issues

console.log('🔥 Starting Enhanced Firebase Connection Test v2...');

async function comprehensiveFirebaseTest() {
    console.log('\n=== FIREBASE CONNECTION HEALTH CHECK ===\n');
    
    try {
        // Phase 1: Basic Auth Check
        console.log('🔍 Phase 1: Authentication Status...');
        const user = window.firebase?.auth()?.currentUser;
        if (!user) {
            console.error('❌ No authenticated user found');
            return { success: false, error: 'No authentication' };
        }
        console.log('✅ User authenticated:', user.email);

        // Phase 2: Network Diagnostics
        console.log('\n🔍 Phase 2: Network Environment...');
        console.log('- Online status:', navigator.onLine);
        console.log('- Protocol:', window.location.protocol);
        console.log('- Host:', window.location.host);
        console.log('- Connection:', navigator.connection?.effectiveType || 'Unknown');
        
        // Phase 3: Simple Read Test (should work even with write issues)
        console.log('\n🔍 Phase 3: Read Test...');
        try {
            const readStart = Date.now();
            const snapshot = await window.firebase.firestore()
                .collection('MarketGenie_tenants')
                .limit(1)
                .get();
            const readTime = Date.now() - readStart;
            console.log(`✅ READ SUCCESS in ${readTime}ms - Found ${snapshot.size} documents`);
        } catch (readError) {
            console.error('❌ READ FAILED:', readError.message);
            return { success: false, error: 'Read operations failing' };
        }

        // Phase 4: Write Test with Timeout and Progress Tracking
        console.log('\n🔍 Phase 4: Write Test (10-second timeout)...');
        
        const writeData = {
            test: true,
            timestamp: new Date().toISOString(),
            message: 'Enhanced WebChannel diagnostic test',
            userId: user.uid,
            testId: Math.random().toString(36).substr(2, 9),
            browserInfo: {
                userAgent: navigator.userAgent,
                vendor: navigator.vendor,
                language: navigator.language
            }
        };

        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT_ERROR: Write operation exceeded 10 seconds')), 10000);
        });

        // Track progress
        console.log('📤 Attempting write operation...');
        const progressTimer = setInterval(() => {
            console.log('⏳ Still waiting for write operation...');
        }, 2000);

        try {
            const writeStart = Date.now();
            const writePromise = window.firebase.firestore()
                .collection('emergency_diagnostic')
                .add(writeData);

            const docRef = await Promise.race([writePromise, timeoutPromise]);
            const writeTime = Date.now() - writeStart;
            
            clearInterval(progressTimer);
            console.log(`✅ WRITE SUCCESS in ${writeTime}ms! Document ID: ${docRef.id}`);

            // Phase 5: Cleanup Test
            console.log('\n🔍 Phase 5: Delete Test...');
            try {
                await docRef.delete();
                console.log('✅ DELETE SUCCESS');
            } catch (deleteError) {
                console.warn('⚠️ DELETE FAILED (but write worked):', deleteError.message);
            }

            return { 
                success: true, 
                message: 'Firebase connection fully operational',
                metrics: {
                    writeTime: writeTime,
                    documentId: docRef.id
                }
            };

        } catch (writeError) {
            clearInterval(progressTimer);
            
            if (writeError.message.includes('TIMEOUT_ERROR')) {
                console.error('🚨 WRITE TIMEOUT - WebChannel connection issue detected');
                return { 
                    success: false, 
                    error: 'Write timeout (WebChannel issue)', 
                    errorType: 'TIMEOUT' 
                };
            } else {
                console.error('❌ WRITE FAILED:', writeError);
                return { 
                    success: false, 
                    error: writeError.message, 
                    errorType: 'WRITE_ERROR',
                    code: writeError.code 
                };
            }
        }

    } catch (globalError) {
        console.error('❌ GLOBAL TEST FAILURE:', globalError);
        return { 
            success: false, 
            error: globalError.message, 
            errorType: 'GLOBAL_ERROR' 
        };
    }
}

function provideTroubleshootingSteps(result) {
    console.log('\n🎯 TEST RESULT:', result);
    
    if (result.success) {
        console.log('\n✅ FIREBASE CONNECTION IS HEALTHY!');
        console.log('The issue is likely specific to the bulk scraper implementation.');
        console.log('Consider debugging the bulk operations workflow.');
        return;
    }

    console.log('\n🚨 CONNECTION ISSUE DETECTED');
    console.log('Error Type:', result.errorType);
    console.log('Error Message:', result.error);

    if (result.errorType === 'TIMEOUT') {
        console.log('\n🔥 WEBCHANNEL TIMEOUT FIXES:');
        console.log('1. 🔄 Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)');
        console.log('2. 🧹 Clear browser data: DevTools > Application > Storage > Clear storage');
        console.log('3. 🚫 Disable extensions: Try incognito/private mode');
        console.log('4. 📱 Network change: Switch to mobile hotspot');
        console.log('5. 🔄 Restart browser completely');
        console.log('6. 🌐 Different browser: Try Chrome/Firefox/Edge');
    } else if (result.errorType === 'WRITE_ERROR') {
        console.log('\n🔥 WRITE ERROR FIXES:');
        console.log('1. 🔒 Check Firestore security rules');
        console.log('2. 🔑 Verify user permissions');
        console.log('3. 📊 Check Firebase quota limits');
        console.log('4. 🌐 Firebase status: https://status.firebase.google.com/');
    } else {
        console.log('\n🔥 GENERAL FIXES:');
        console.log('1. 🔄 Page refresh');
        console.log('2. 🔒 Re-authenticate');
        console.log('3. 🌐 Check internet connection');
        console.log('4. 💻 Restart computer');
    }
}

// Execute the comprehensive test
console.log('🚀 Starting comprehensive Firebase test...');
comprehensiveFirebaseTest()
    .then(provideTroubleshootingSteps)
    .catch(error => {
        console.error('🔥 TEST CRASHED:', error);
        console.log('\n🚨 CRITICAL: Browser/system restart required');
    });

// Also provide a quick manual test function
window.quickFirebaseTest = async () => {
    console.log('⚡ Quick test...');
    try {
        const doc = await window.firebase.firestore().collection('quick_test').add({test: Date.now()});
        console.log('✅ Quick test passed:', doc.id);
        await doc.delete();
        return true;
    } catch (e) {
        console.error('❌ Quick test failed:', e.message);
        return false;
    }
};
console.log('\n💡 Run quickFirebaseTest() for a fast check anytime');