/**
 * DEBUG SCRIPT - Check User and Tenant Status
 * Run this in browser console to see why Admin Panel isn't showing
 */

(function debugUserAndTenant() {
  console.log('🔍 DEBUGGING USER AND TENANT STATUS...');
  console.log('===========================================');
  
  // Check user
  console.log('👤 USER INFO:');
  if (window.currentUser) {
    console.log('  Email:', window.currentUser.email);
    console.log('  UID:', window.currentUser.uid);
    console.log('  Full user object:', window.currentUser);
  } else {
    console.log('  ❌ No currentUser found in window');
  }
  
  // Check tenant
  console.log('\n🏢 TENANT INFO:');
  if (window.currentMarketGenieTenant) {
    console.log('  Tenant ID:', window.currentMarketGenieTenant.id);
    console.log('  Owner Email:', window.currentMarketGenieTenant.ownerEmail);
    console.log('  Role:', window.currentMarketGenieTenant.role);
    console.log('  Full tenant object:', window.currentMarketGenieTenant);
  } else {
    console.log('  ❌ No currentMarketGenieTenant found in window');
  }
  
  // Check localStorage
  console.log('\n💾 LOCALSTORAGE INFO:');
  try {
    const savedTenant = localStorage.getItem('marketgenie_current_tenant');
    if (savedTenant) {
      const tenant = JSON.parse(savedTenant);
      console.log('  Saved tenant:', tenant);
    } else {
      console.log('  ❌ No saved tenant in localStorage');
    }
  } catch (error) {
    console.log('  ❌ Error reading localStorage:', error);
  }
  
  // Check conditions for Admin Panel
  console.log('\n🛡️ ADMIN PANEL ACCESS CHECK:');
  const userEmail = window.currentUser?.email;
  const tenantRole = window.currentMarketGenieTenant?.role;
  
  console.log('  User email check:', userEmail === 'dubdproducts@gmail.com' ? '✅ PASS' : `❌ FAIL (${userEmail})`);
  console.log('  Tenant role check:', tenantRole === 'founder' ? '✅ PASS' : `❌ FAIL (${tenantRole})`);
  
  console.log('\n💡 SOLUTION:');
  if (userEmail !== 'dubdproducts@gmail.com') {
    console.log('  ❌ Wrong email - Admin Panel requires dubdproducts@gmail.com');
  } else if (tenantRole !== 'founder') {
    console.log('  ❌ Wrong role - Need to set tenant role to "founder"');
    console.log('  🔧 Will create a fix for this...');
  } else {
    console.log('  ✅ All conditions met - Admin Panel should be visible');
  }
  
  console.log('\n===========================================');
})();

console.log('🔍 Debug script loaded! Checking user and tenant status...');