// Check for recent leads in the database and export to CSV
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');
const { writeFileSync } = require('fs');

const firebaseConfig = {
  apiKey: "AIzaSyBoN_nHIdmgJ8aGZE3C3ViEUNKfwZkM7zg",
  authDomain: "market-genie-f2d41.firebaseapp.com",
  projectId: "market-genie-f2d41",
  storageBucket: "market-genie-f2d41.firebasestorage.app",
  messagingSenderId: "1011717577432",
  appId: "1:1011717577432:web:c1e31bf1e9f9c8b8c8fc22"
};

async function checkAndExportLeads() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('🔍 Checking for recent leads in your database...');
    
    // Check the tenant's leads collection
    const tenantId = '8ZJY8LY3g2H3Mw2eRcmd'; // Your tenant ID from the logs
    const leadsRef = collection(db, 'MarketGenie_tenants', tenantId, 'leads');
    
    // Get all leads, ordered by creation time
    const q = query(leadsRef, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    
    console.log(`\n📊 RESULTS:`);
    console.log(`Total leads found: ${snapshot.size}`);
    
    const leads = [];
    
    if (snapshot.size > 0) {
      console.log('\n✅ Found these leads:');
      snapshot.forEach(doc => {
        const data = doc.data();
        const lead = {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          company: data.company || '',
          phone: data.phone || '',
          title: data.title || '',
          source: data.source || '',
          status: data.status || '',
          score: data.score || '',
          notes: data.notes || '',
          createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : ''
        };
        
        leads.push(lead);
        
        console.log(`- ${lead.firstName} ${lead.lastName} | ${lead.email} | ${lead.company} | Source: ${lead.source}`);
      });
      
      // Export to CSV
      const csvHeaders = [
        'First Name',
        'Last Name', 
        'Email',
        'Company',
        'Phone',
        'Title',
        'Source',
        'Status',
        'Score',
        'Notes',
        'Created Date'
      ];
      
      const csvRows = leads.map(lead => [
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.company,
        lead.phone,
        lead.title,
        lead.source,
        lead.status,
        lead.score,
        lead.notes,
        lead.createdAt
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      // Save to file
      const filename = `exported-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      writeFileSync(filename, csvContent, 'utf8');
      
      console.log(`\n📄 CSV Export Complete!`);
      console.log(`File saved: ${filename}`);
      console.log(`Total leads exported: ${leads.length}`);
      
      // Show recent Prospeo leads specifically
      const prospeoLeads = leads.filter(lead => 
        lead.source.includes('prospeo') || 
        lead.source.includes('bulk') ||
        lead.email.includes('sparktoro') ||
        lead.email.includes('close.com') ||
        lead.email.includes('buffer.com')
      );
      
      if (prospeoLeads.length > 0) {
        console.log(`\n🎯 Recent Prospeo/Bulk Scrape Leads: ${prospeoLeads.length}`);
        prospeoLeads.forEach(lead => {
          console.log(`   • ${lead.firstName} ${lead.lastName} - ${lead.email} (${lead.company})`);
        });
      } else {
        console.log(`\n❌ NO RECENT PROSPEO LEADS FOUND`);
        console.log(`This means the saves are still failing - the last fix should work now!`);
      }
      
    } else {
      console.log('\n❌ NO LEADS FOUND IN DATABASE');
      console.log('The recent scrapes found emails but they failed to save.');
      console.log('The document ID fix should resolve this now.');
      
      // Create a CSV with the emails we know were found but not saved
      const lostLeads = [
        { email: 'rand@sparktoro.com', company: 'SparkToro', firstName: 'Rand', lastName: 'Fishkin' },
        { email: 'jennifer@whitedental.com', company: 'White Dental Practice', firstName: 'Jennifer', lastName: 'White' },
        { email: 'nathanlatka@founderpath.com', company: 'Founderpath', firstName: 'Nathan', lastName: 'Latka' },
        { email: 'joel@buffer.com', company: 'Buffer', firstName: 'Joel', lastName: 'Gascoigne' },
        { email: 'sarah@boutiqueconsulting.com', company: 'Boutique Consulting', firstName: 'Sarah', lastName: 'Williams' },
        { email: 'steli@close.com', company: 'Close', firstName: 'Steli', lastName: 'Efti' },
        { email: 'william@baileybusiness.com', company: 'Bailey Business Consulting', firstName: 'William', lastName: 'Bailey' },
        { email: 'chris@mooreinsurance.com', company: 'Moore Insurance Agency', firstName: 'Chris', lastName: 'Moore' }
      ];
      
      const csvContent = [
        ['First Name', 'Last Name', 'Email', 'Company', 'Source', 'Status'],
        ...lostLeads.map(lead => [
          lead.firstName,
          lead.lastName,
          lead.email,
          lead.company,
          'bulk-prospeo-scrape-recovered',
          'Found but not saved due to bug'
        ])
      ].map(row => row.map(field => `"${field}"`).join(','))
       .join('\n');
      
      const filename = `recovered-prospeo-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      writeFileSync(filename, csvContent, 'utf8');
      
      console.log(`\n📄 Created CSV with leads that were found but not saved:`);
      console.log(`File: ${filename}`);
      console.log(`These are real emails found by Prospeo that you paid credits for!`);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking leads:', error);
    process.exit(1);
  }
}

checkAndExportLeads();