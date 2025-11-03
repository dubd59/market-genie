// NETWORK CONNECTIVITY TEST - Run this in browser console
// Tests if Firebase servers are reachable

console.log('🌐 TESTING NETWORK CONNECTIVITY TO FIREBASE...');

async function testConnectivity() {
  // Test 1: Basic internet
  console.log('1. Testing basic internet...');
  try {
    await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
    console.log('✅ Basic internet working');
  } catch (e) {
    console.log('❌ No internet connection');
    return;
  }
  
  // Test 2: Firebase servers
  console.log('2. Testing Firebase servers...');
  try {
    await fetch('https://firestore.googleapis.com/', { mode: 'no-cors' });
    console.log('✅ Firebase servers reachable');
  } catch (e) {
    console.log('❌ Cannot reach Firebase servers');
    console.log('   Try disabling VPN/proxy or check firewall');
  }
  
  // Test 3: DNS resolution
  console.log('3. Testing DNS...');
  try {
    await fetch('https://8.8.8.8/', { mode: 'no-cors' });
    console.log('✅ DNS working');
  } catch (e) {
    console.log('❌ DNS issues detected');
  }
  
  console.log('\n🔧 If tests fail, try:');
  console.log('   - Restart your router/modem');
  console.log('   - Flush DNS: ipconfig /flushdns');
  console.log('   - Try different network (mobile hotspot)');
}

testConnectivity();