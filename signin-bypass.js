// SIGN-IN BYPASS - Run this in browser console if stuck at login
// This will force the auth state and get you back to the working app

console.log('🔓 SIGN-IN BYPASS SCRIPT...');

function forceSignIn() {
  console.log('1. 🔍 Looking for auth context...');
  
  // Try to find and trigger auth methods
  const authButtons = document.querySelectorAll('button');
  console.log(`Found ${authButtons.length} buttons`);
  
  // Look for sign-in related buttons
  const signInButtons = Array.from(authButtons).filter(btn => 
    btn.textContent.toLowerCase().includes('sign') ||
    btn.textContent.toLowerCase().includes('login') ||
    btn.textContent.toLowerCase().includes('auth')
  );
  
  if (signInButtons.length > 0) {
    console.log(`Found ${signInButtons.length} sign-in buttons:`, signInButtons.map(b => b.textContent));
    console.log('2. 🖱️ Clicking first sign-in button...');
    signInButtons[0].click();
  } else {
    console.log('2. 🔄 No sign-in buttons found, trying alternative methods...');
    
    // Force localStorage auth bypass
    console.log('   📝 Setting emergency auth bypass...');
    localStorage.setItem('EMERGENCY_AUTH_BYPASS', 'true');
    localStorage.setItem('FORCE_AUTH_SUCCESS', 'true');
    localStorage.setItem('BYPASS_AUTH_CHECK', 'true');
    
    // Set tenant override again
    localStorage.setItem('FORCE_TENANT_ID', 'founder-tenant');
    localStorage.setItem('EMERGENCY_FIREBASE_BYPASS', 'true');
    
    console.log('   🔄 Reloading page...');
    window.location.reload();
  }
}

function quickAuthFix() {
  console.log('🚀 QUICK AUTH FIX - Setting up bypass tokens...');
  
  // Set up auth bypass
  localStorage.setItem('authToken', 'emergency-bypass-token');
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userEmail', 'founder@marketgenie.app');
  localStorage.setItem('tenantId', 'founder-tenant');
  localStorage.setItem('userId', 'U9vez3sI36Ti5JqoWi5gJUMq2nX2');
  
  // Force auth context update
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('authStateChanged', { 
    detail: { 
      authenticated: true, 
      user: { email: 'founder@marketgenie.app' } 
    } 
  }));
  
  console.log('✅ Auth bypass tokens set, reloading...');
  setTimeout(() => window.location.reload(), 1000);
}

console.log('Choose your approach:');
console.log('1. forceSignIn() - Try to click sign-in buttons');
console.log('2. quickAuthFix() - Emergency auth bypass');
console.log('');
console.log('Running quickAuthFix() in 3 seconds...');

setTimeout(quickAuthFix, 3000);