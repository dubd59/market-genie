const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Function to create founder tenant document
exports.createFounderTenant = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('Creating founder tenant document...');
    
    const db = admin.firestore();
    
    // Create the founder-tenant document
    const founderTenantData = {
      id: 'founder-tenant',
      tenantId: 'founder-tenant',
      name: 'Market Genie Founder',
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      ownerEmail: 'dubdproducts@gmail.com',
      type: 'founder',
      status: 'active',
      initialized: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      plan: 'unlimited',
      features: {
        maxLeads: -1,
        maxUsers: -1,
        maxIntegrations: -1,
        advancedFeatures: true
      }
    };
    
    // Write the document
    await db.collection('MarketGenie_tenants').doc('founder-tenant').set(founderTenantData);
    
    console.log('Founder tenant document created successfully');
    
    // Verify it was created
    const createdDoc = await db.collection('MarketGenie_tenants').doc('founder-tenant').get();
    
    if (createdDoc.exists) {
      console.log('Verification successful:', createdDoc.data());
      
      res.status(200).json({
        success: true,
        message: 'Founder tenant document created successfully',
        data: createdDoc.data()
      });
    } else {
      throw new Error('Document was not created properly');
    }
    
  } catch (error) {
    console.error('Error creating founder tenant:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});