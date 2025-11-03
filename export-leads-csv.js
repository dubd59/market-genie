// EXPORT LEADS TO CSV - Run this in browser console
// This will download your 8 leads as a CSV file

console.log('📋 EXPORTING LEADS TO CSV...');

async function exportLeadsToCSV() {
  try {
    const db = window.firebase.firestore();
    const tenantId = 'U9vez3sI36Ti5JqoWi5gJUMq2nX2';
    
    // Get all leads
    const leadsRef = db.collection('MarketGenie_tenants')
                       .doc(tenantId)
                       .collection('leads');
    
    const snapshot = await leadsRef.orderBy('createdAt', 'desc').get();
    
    console.log(`✅ Found ${snapshot.size} leads to export`);
    
    // Prepare CSV data
    const headers = [
      'firstName', 'lastName', 'email', 'company', 'title', 
      'phone', 'status', 'score', 'source', 'notes', 'createdAt'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const row = headers.map(header => {
        let value = data[header] || '';
        
        // Format timestamp
        if (header === 'createdAt' && data[header]) {
          value = data[header].toDate ? data[header].toDate().toISOString() : value;
        }
        
        // Escape commas and quotes in CSV
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value}"`;
          }
        }
        
        return value;
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-genie-leads-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ CSV downloaded successfully!');
    
    // Also log the data to console for review
    console.log('\n📊 LEAD SUMMARY:');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.firstName} ${data.lastName} | ${data.email} | ${data.company} | Score: ${data.score}`);
    });
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

exportLeadsToCSV();