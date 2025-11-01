// 🎯 DATABASE STRUCTURE & PERMISSIONS TEST
// This tests the exact paths your bulk scraper is trying to write to
// Copy and paste this into browser console

console.log('🔍 Testing Database Structure & Permissions...');

async function testDatabaseStructure() {
    try {
        console.log('\n=== DATABASE STRUCTURE TEST ===\n');

        // Get current user
        const user = window.firebase?.auth()?.currentUser;
        if (!user) {
            console.error('❌ No authenticated user');
            return { success: false, error: 'No auth' };
        }
        console.log('✅ User:', user.email);

        // Test 1: Check if tenant document exists
        console.log('🔍 Test 1: Checking tenant document...');
        const tenantId = '8ZJY8LY3g2H3Mw2eRcmd'; // Your tenant ID from the console logs
        const tenantRef = window.firebase.firestore()
            .collection('MarketGenie_tenants')
            .doc(tenantId);
        
        const tenantDoc = await tenantRef.get();
        if (!tenantDoc.exists) {
            console.error('❌ Tenant document does not exist!');
            return { success: false, error: 'Tenant missing' };
        }
        console.log('✅ Tenant document exists');

        // Test 2: Check leads subcollection access
        console.log('\n🔍 Test 2: Testing leads subcollection access...');
        const leadsRef = tenantRef.collection('leads');
        
        try {
            // Try to read existing leads
            const existingLeads = await leadsRef.limit(1).get();
            console.log(`✅ Can read leads collection (${existingLeads.size} docs found)`);
        } catch (readError) {
            console.error('❌ Cannot read leads collection:', readError.message);
        }

        // Test 3: Try a simple write to leads collection
        console.log('\n🔍 Test 3: Testing write to leads collection...');
        const testLead = {
            email: 'test@diagnostic.com',
            firstName: 'Test',
            lastName: 'User',
            company: 'Diagnostic Test',
            status: 'test',
            source: 'diagnostic_test',
            createdAt: new Date(),
            tenantId: tenantId,
            userId: user.uid,
            _testDocument: true
        };

        try {
            console.log('📤 Attempting lead write...');
            const leadDocRef = await leadsRef.add(testLead);
            console.log('✅ Lead write SUCCESS! Doc ID:', leadDocRef.id);

            // Test 4: Try to delete the test document
            console.log('\n🔍 Test 4: Testing delete operation...');
            try {
                await leadDocRef.delete();
                console.log('✅ Delete SUCCESS');
            } catch (deleteError) {
                console.warn('⚠️ Delete failed but write worked:', deleteError.message);
            }

            return { 
                success: true, 
                message: 'All database operations working',
                leadId: leadDocRef.id 
            };

        } catch (writeError) {
            console.error('❌ Lead write FAILED:', writeError);
            
            // Check specific error types
            if (writeError.code === 'permission-denied') {
                console.error('🚨 PERMISSION DENIED - Security rules blocking writes');
                return { 
                    success: false, 
                    error: 'Permission denied', 
                    errorType: 'PERMISSIONS',
                    details: 'Firestore security rules are blocking lead creation'
                };
            } else if (writeError.code === 'unavailable') {
                console.error('🚨 SERVICE UNAVAILABLE - Firebase connection issue');
                return { 
                    success: false, 
                    error: 'Service unavailable', 
                    errorType: 'CONNECTION'
                };
            } else {
                return { 
                    success: false, 
                    error: writeError.message, 
                    errorType: 'WRITE_ERROR',
                    code: writeError.code 
                };
            }
        }

    } catch (globalError) {
        console.error('❌ Global test failure:', globalError);
        return { 
            success: false, 
            error: globalError.message, 
            errorType: 'GLOBAL_ERROR' 
        };
    }
}

// Test 5: Check security rules in detail
async function testSecurityRules() {
    console.log('\n🔍 Test 5: Security Rules Analysis...');
    
    try {
        const user = window.firebase?.auth()?.currentUser;
        const tenantId = '8ZJY8LY3g2H3Mw2eRcmd';
        
        // Check user's custom claims
        const idTokenResult = await user.getIdTokenResult();
        console.log('🔑 User claims:', idTokenResult.claims);
        
        // Check if user has tenant access
        if (idTokenResult.claims.tenantId === tenantId) {
            console.log('✅ User has matching tenant ID in claims');
        } else {
            console.warn('⚠️ User tenant ID mismatch:');
            console.log('  - Claims tenant:', idTokenResult.claims.tenantId);
            console.log('  - Target tenant:', tenantId);
        }

        // Check if user is founder
        if (idTokenResult.claims.isFounder) {
            console.log('✅ User has founder privileges');
        } else {
            console.log('ℹ️ User is not founder (may still have tenant access)');
        }

        return { 
            claims: idTokenResult.claims,
            hasAccess: idTokenResult.claims.tenantId === tenantId || idTokenResult.claims.isFounder
        };

    } catch (claimsError) {
        console.error('❌ Could not check claims:', claimsError.message);
        return { error: claimsError.message };
    }
}

// Run comprehensive database test
console.log('🚀 Starting Database Structure Test...');

Promise.all([
    testDatabaseStructure(),
    testSecurityRules()
]).then(([dbResult, rulesResult]) => {
    console.log('\n🎯 DATABASE TEST RESULTS:');
    console.log('Database Operations:', dbResult);
    console.log('Security Rules:', rulesResult);

    if (dbResult.success) {
        console.log('\n✅ DATABASE IS HEALTHY!');
        console.log('The issue is likely in the bulk scraper logic, not database access.');
        console.log('Possible causes:');
        console.log('- Rate limiting on rapid writes');
        console.log('- Bulk operation timeout');
        console.log('- Transaction conflicts');
    } else {
        console.log('\n🚨 DATABASE ISSUE DETECTED!');
        console.log('Error Type:', dbResult.errorType);
        
        if (dbResult.errorType === 'PERMISSIONS') {
            console.log('\n🔥 PERMISSION FIXES:');
            console.log('1. Check Firestore security rules');
            console.log('2. Verify user has correct tenant claims');
            console.log('3. Check if rules allow subcollection writes');
        } else if (dbResult.errorType === 'CONNECTION') {
            console.log('\n🔥 CONNECTION FIXES:');
            console.log('1. Check Firebase status dashboard');
            console.log('2. Try hard refresh');
            console.log('3. Check network connection');
        }
    }
}).catch(error => {
    console.error('🔥 Test suite crashed:', error);
});

// Also add a quick manual test
window.testLeadWrite = async () => {
    console.log('⚡ Quick lead write test...');
    try {
        const user = window.firebase?.auth()?.currentUser;
        const doc = await window.firebase.firestore()
            .collection('MarketGenie_tenants')
            .doc('8ZJY8LY3g2H3Mw2eRcmd')
            .collection('leads')
            .add({
                email: 'quick-test@example.com',
                firstName: 'Quick',
                lastName: 'Test',
                company: 'Test Co',
                status: 'test',
                source: 'quick_test',
                createdAt: new Date(),
                tenantId: '8ZJY8LY3g2H3Mw2eRcmd',
                userId: user.uid,
                _quickTest: true
            });
        console.log('✅ Quick lead write passed:', doc.id);
        await doc.delete();
        console.log('✅ Quick cleanup passed');
        return true;
    } catch (e) {
        console.error('❌ Quick lead write failed:', e);
        return false;
    }
};

console.log('\n💡 Use testLeadWrite() for quick manual testing');