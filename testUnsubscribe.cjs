// Quick test to manually check unsubscribe functionality
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account
const serviceAccount = require('./market-genie-f2d41-firebase-adminsdk-gq72h-c3b8d58c71.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testUnsubscribeLogic() {
  const tenantId = '8ZJY8LY3g2H3Mw2eRcmd'; // From the logs
  const testEmail = 'dubdproducts@gmail.com'; // Real email to test with
  
  console.log('🔍 Testing unsubscribe logic...');
  console.log('📍 Tenant ID:', tenantId);
  console.log('📧 Test email:', testEmail);
  
  try {
    // Check if contacts document exists
    const contactsQuery = await db
      .collection('userData')
      .doc(`${tenantId}_crm_contacts`)
      .get();
    
    console.log('📊 Document exists:', contactsQuery.exists);
    
    if (contactsQuery.exists) {
      const contactsData = contactsQuery.data();
      const contacts = contactsData.contacts || [];
      
      console.log('📊 Total contacts:', contacts.length);
      console.log('📧 Looking for email:', testEmail);
      
      // Show all contacts
      console.log('📋 All contacts:');
      contacts.forEach((contact, index) => {
        console.log(`  ${index + 1}. ${contact.email} - ${contact.name || 'No name'}`);
      });
      
      // Check if our test email exists
      const foundContact = contacts.find(contact => 
        contact.email && contact.email.toLowerCase() === testEmail.toLowerCase()
      );
      
      if (foundContact) {
        console.log('✅ Found contact:', foundContact);
        
        // Simulate removal
        const updatedContacts = contacts.filter(contact => 
          contact.email && contact.email.toLowerCase() !== testEmail.toLowerCase()
        );
        
        console.log('📊 After simulated removal:', updatedContacts.length);
        console.log('📉 Would remove:', contacts.length - updatedContacts.length, 'contacts');
        
      } else {
        console.log('❌ Contact NOT found in list!');
      }
    } else {
      console.log('❌ Contacts document does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testUnsubscribeLogic();