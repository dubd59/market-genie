// Add sample data to the current active tenant
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize with service account key
try {
  const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'market-genie-f2d41'
  });
  
  console.log('✅ Firebase Admin initialized successfully!');
} catch (error) {
  console.log('❌ Error loading service account key:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function addSampleDataToActiveTenant() {
  const TENANT_ID = 'V3zHYKGQCOUbjPS1rIek'; // Current active tenant
  
  console.log(`🚀 Adding sample data to tenant: ${TENANT_ID}`);

  const batch = db.batch();

  try {
    // 1. Sample Deals
    const deal1Ref = db.collection('deals').doc();
    batch.set(deal1Ref, {
      id: deal1Ref.id,
      title: 'Enterprise SaaS Implementation',
      company: 'TechCorp Solutions',
      value: 75000,
      stage: 'Proposal',
      probability: 85,
      expectedCloseDate: new Date('2024-12-15'),
      contactPerson: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      phone: '+1-555-0123',
      description: 'Large enterprise client looking to implement our SaaS solution across 500+ users',
      tenantId: TENANT_ID,
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      tags: ['enterprise', 'high-value', 'urgent'],
      source: 'LinkedIn Outreach',
      nextFollowUp: new Date('2024-11-01')
    });

    const deal2Ref = db.collection('deals').doc();
    batch.set(deal2Ref, {
      id: deal2Ref.id,
      title: 'Marketing Automation Setup',
      company: 'GrowthTech Inc',
      value: 25000,
      stage: 'Negotiation',
      probability: 70,
      expectedCloseDate: new Date('2024-11-30'),
      contactPerson: 'Mike Chen',
      email: 'mike@growthtech.com',
      phone: '+1-555-0456',
      description: 'Mid-market company needs complete marketing automation overhaul',
      tenantId: TENANT_ID,
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      tags: ['marketing', 'automation', 'mid-market'],
      source: 'Cold Email',
      nextFollowUp: new Date('2024-10-25')
    });

    // 2. Sample Contacts
    const contact1Ref = db.collection('contacts').doc();
    batch.set(contact1Ref, {
      id: contact1Ref.id,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@techcorp.com',
      phone: '+1-555-0123',
      company: 'TechCorp Solutions',
      position: 'CTO',
      linkedinProfile: 'https://linkedin.com/in/sarahjohnson',
      tenantId: TENANT_ID,
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      tags: ['decision-maker', 'technical', 'enterprise'],
      source: 'LinkedIn',
      notes: 'Very interested in scalability features. Technical decision maker.',
      lastContact: new Date('2024-10-10')
    });

    const contact2Ref = db.collection('contacts').doc();
    batch.set(contact2Ref, {
      id: contact2Ref.id,
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike@growthtech.com',
      phone: '+1-555-0456',
      company: 'GrowthTech Inc',
      position: 'Marketing Director',
      linkedinProfile: 'https://linkedin.com/in/mikechen',
      tenantId: TENANT_ID,
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      tags: ['marketing', 'growth', 'mid-market'],
      source: 'Cold Email',
      notes: 'Looking for ROI-focused solution. Budget approved.',
      lastContact: new Date('2024-10-12')
    });

    // 3. Sample Companies
    const company1Ref = db.collection('companies').doc();
    batch.set(company1Ref, {
      id: company1Ref.id,
      name: 'TechCorp Solutions',
      domain: 'techcorp.com',
      industry: 'Technology',
      size: '500-1000',
      revenue: '$50M-$100M',
      location: 'San Francisco, CA',
      tenantId: TENANT_ID,
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      description: 'Leading enterprise software company specializing in cloud solutions',
      website: 'https://techcorp.com'
    });

    const company2Ref = db.collection('companies').doc();
    batch.set(company2Ref, {
      id: company2Ref.id,
      name: 'GrowthTech Inc',
      domain: 'growthtech.com',
      industry: 'Marketing Technology',
      size: '100-500',
      revenue: '$10M-$50M',
      location: 'Austin, TX',
      tenantId: TENANT_ID,
      ownerId: 'U9vez3sI36Ti5JqoWi5gJUMq2nX2',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      description: 'Fast-growing marketing technology startup with aggressive growth targets',
      website: 'https://growthtech.com'
    });

    // Commit all changes
    await batch.commit();

    console.log('🎉 SAMPLE DATA ADDED SUCCESSFULLY!');
    console.log('✅ Added:');
    console.log('- 2 sample deals worth $100K total');
    console.log('- 2 sample contacts');
    console.log('- 2 sample companies');
    console.log(`- All data linked to tenant: ${TENANT_ID}`);

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }

  process.exit(0);
}

addSampleDataToActiveTenant();