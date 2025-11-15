// 🔐 FIREBASE AUTH & SECURITY RULES DIAGNOSTIC
// Debug authentication claims and Firebase security rules

import { auth } from '../firebase.js';
import { collection, doc, getDoc } from '../security/SecureFirebase.js';
import { db } from '../firebase.js';

export class FirebaseSecurityDiagnostic {
  static async diagnoseAuth() {
    console.log('🔐 FIREBASE AUTHENTICATION DIAGNOSTIC');
    console.log('=====================================');
    
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No authenticated user');
      return { authenticated: false };
    }
    
    console.log('✅ User authenticated:', user.email);
    console.log('📋 User UID:', user.uid);
    
    try {
      // Get ID token with claims
      const token = await user.getIdToken(true);
      const idTokenResult = await user.getIdTokenResult();
      
      console.log('🎫 Token claims:', idTokenResult.claims);
      console.log('🏢 Tenant ID from claims:', idTokenResult.claims.tenantId);
      console.log('🔑 Custom claims:', JSON.stringify(idTokenResult.claims, null, 2));
      
      return {
        authenticated: true,
        email: user.email,
        uid: user.uid,
        claims: idTokenResult.claims,
        tenantId: idTokenResult.claims.tenantId
      };
    } catch (error) {
      console.error('❌ Error getting claims:', error);
      return { authenticated: true, error: error.message };
    }
  }
  
  static async testLeadCollectionAccess(tenantId = '8ZJY8LY3g2H3Mw2eRcmd') {
    console.log('🧪 TESTING LEAD COLLECTION ACCESS');
    console.log('=================================');
    console.log('🎯 Target tenant:', tenantId);
    
    try {
      // Test collection reference creation
      const leadsCollection = collection(db, 'MarketGenie_tenants', tenantId, 'leads');
      console.log('✅ Collection reference created');
      
      // Test document access
      const testDoc = doc(leadsCollection, 'test-access');
      console.log('✅ Document reference created');
      
      // Try to read a document (this will test security rules)
      try {
        const docSnapshot = await getDoc(testDoc);
        console.log('✅ Document read successful (exists:', docSnapshot.exists(), ')');
      } catch (readError) {
        console.log('❌ Document read failed:', readError.message);
        if (readError.code === 'permission-denied') {
          console.log('🚨 PERMISSION DENIED - Security rules blocking access');
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Collection access failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async runFullDiagnostic() {
    console.log('🚀 RUNNING FULL FIREBASE SECURITY DIAGNOSTIC');
    console.log('=============================================');
    
    const authResult = await this.diagnoseAuth();
    console.log('\n');
    const accessResult = await this.testLeadCollectionAccess();
    
    console.log('\n📊 DIAGNOSTIC SUMMARY:');
    console.log('======================');
    console.log('Authentication:', authResult.authenticated ? '✅' : '❌');
    console.log('Claims present:', authResult.claims ? '✅' : '❌');
    console.log('Tenant ID:', authResult.tenantId || '❌ Missing');
    console.log('Collection access:', accessResult.success ? '✅' : '❌');
    
    if (!authResult.claims?.tenantId) {
      console.log('\n🚨 CRITICAL ISSUE: Missing tenantId in user claims!');
      console.log('💡 Solution: User needs tenantId custom claim set');
    }
    
    return { auth: authResult, access: accessResult };
  }
}

// Global console helpers
window.diagnoseFirebaseAuth = () => FirebaseSecurityDiagnostic.diagnoseAuth();
window.testLeadAccess = () => FirebaseSecurityDiagnostic.testLeadCollectionAccess();
window.runFirebaseDiagnostic = () => FirebaseSecurityDiagnostic.runFullDiagnostic();

console.log('🔐 Firebase Security Diagnostic loaded!');
console.log('🔧 Use: window.runFirebaseDiagnostic() to run full test');
console.log('🔧 Use: window.diagnoseFirebaseAuth() to check auth only');
console.log('🔧 Use: window.testLeadAccess() to test collection access');