// 🔍 VERIFY DATABASE LEADS COUNT
// Run this script in browser console to check exact Firebase database contents

(async function verifyDatabaseLeads() {
    console.log('🔍 Checking Firebase database lead count...');
    
    try {
        // Get Firebase and auth
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
        const { getFirestore, collection, getDocs, query } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js');
        
        // Get current user and tenant
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
            console.error('❌ No authenticated user found');
            return;
        }
        
        const tenantId = user.uid;
        console.log(`👤 User: ${user.email}`);
        console.log(`🏢 Tenant ID: ${tenantId}`);
        
        // Get Firestore instance
        const db = getFirestore();
        
        // Query leads collection for this tenant
        const leadsRef = collection(db, 'tenants', tenantId, 'leads');
        const leadsQuery = query(leadsRef);
        const leadsSnapshot = await getDocs(leadsQuery);
        
        console.log(`📊 Total leads in Firebase database: ${leadsSnapshot.size}`);
        
        // Get lead details
        const leads = [];
        leadsSnapshot.forEach((doc) => {
            const leadData = doc.data();
            leads.push({
                id: doc.id,
                company: leadData.company || 'Unknown',
                email: leadData.email || 'No email',
                isEmergency: leadData.emergencyId ? true : false,
                timestamp: leadData.timestamp?.toDate?.() || new Date(leadData.timestamp) || 'Unknown'
            });
        });
        
        // Sort by timestamp (newest first)
        leads.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Count emergency vs regular leads
        const emergencyLeads = leads.filter(lead => lead.isEmergency);
        const regularLeads = leads.filter(lead => !lead.isEmergency);
        
        console.log(`🚨 Emergency leads in database: ${emergencyLeads.length}`);
        console.log(`📝 Regular leads in database: ${regularLeads.length}`);
        
        // Show recent leads
        console.log('\n📋 Recent leads (last 10):');
        leads.slice(0, 10).forEach((lead, index) => {
            const emergencyFlag = lead.isEmergency ? '🚨' : '📝';
            console.log(`${index + 1}. ${emergencyFlag} ${lead.company} - ${lead.email}`);
        });
        
        console.log('\n✅ Database verification complete');
        
        return {
            total: leadsSnapshot.size,
            emergency: emergencyLeads.length,
            regular: regularLeads.length,
            leads: leads
        };
        
    } catch (error) {
        console.error('❌ Error checking database:', error);
        
        // Fallback: Try using existing app instance
        try {
            console.log('🔄 Trying alternative method...');
            const db = window.db || window.firestore;
            if (db) {
                console.log('📍 Found existing database connection');
                // This would need the specific database query method used in your app
                console.log('💡 Check your Recent Leads component for the exact query method');
            }
        } catch (fallbackError) {
            console.error('❌ Fallback method failed:', fallbackError);
        }
    }
})();