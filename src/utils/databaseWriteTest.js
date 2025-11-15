// 🧪 DATABASE WRITE TEST
// Simple test to bypass all complex logic and test direct Firebase writes

import { collection, addDoc } from '../security/SecureFirebase.js';
import { db } from '../firebase.js';

export class DatabaseWriteTest {
  static async testSimpleWrite(tenantId = '8ZJY8LY3g2H3Mw2eRcmd') {
    console.log('🧪 Testing simple database write...');
    
    try {
      const testData = {
        test: true,
        email: 'test@example.com',
        name: 'Test Lead',
        company: 'Test Company',
        timestamp: new Date().toISOString(),
        source: 'database-test'
      };
      
      console.log('📊 Test data:', testData);
      
      const leadsCollection = collection(db, 'MarketGenie_tenants', tenantId, 'leads');
      console.log('📁 Collection reference created');
      
      const startTime = Date.now();
      const docRef = await addDoc(leadsCollection, testData);
      const duration = Date.now() - startTime;
      
      console.log(`✅ TEST PASSED: Document saved in ${duration}ms with ID: ${docRef.id}`);
      return { success: true, id: docRef.id, duration };
      
    } catch (error) {
      console.error('❌ TEST FAILED:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async testBulkWrite(tenantId = '8ZJY8LY3g2H3Mw2eRcmd', count = 3) {
    console.log(`🧪 Testing bulk database write (${count} documents)...`);
    
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const result = await this.testSimpleWrite(tenantId);
      results.push(result);
      
      if (!result.success) {
        console.error(`❌ Bulk test failed on document ${i + 1}`);
        break;
      }
      
      // Small delay between writes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Bulk test results: ${successCount}/${count} successful`);
    
    return { totalTests: count, successCount, results };
  }
}

// Global helper functions for console testing
window.testDatabaseWrite = () => DatabaseWriteTest.testSimpleWrite();
window.testBulkDatabaseWrite = (count = 3) => DatabaseWriteTest.testBulkWrite('8ZJY8LY3g2H3Mw2eRcmd', count);

console.log('🧪 Database tests loaded! Use window.testDatabaseWrite() or window.testBulkDatabaseWrite() in console');