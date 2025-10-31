// Step-by-step diagnostic for browser console
// Copy and paste each line ONE AT A TIME into console

// Step 1: Test if fetch works at all
console.log('Testing basic fetch...');
fetch('https://httpbin.org/get').then(r => r.json()).then(d => console.log('✅ Fetch works:', d.url));

// Step 2: Test if Prospeo API is reachable
console.log('Testing Prospeo API...');
fetch('https://api.prospeo.io/account', {
  method: 'GET',
  headers: { 'X-KEY': 'test-key' }
}).then(r => {
  console.log('📡 Prospeo API Response Status:', r.status);
  return r.json();
}).then(d => console.log('📦 Prospeo API Response:', d));

// Step 3: Test a simple function
function testFunction() {
  console.log('✅ Function executed successfully!');
  return 'Function completed';
}

console.log('🧪 Now run: testFunction()');