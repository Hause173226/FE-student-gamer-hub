// Test script để kiểm tra Vite proxy
const http = require('http');

console.log('🔍 Testing Vite Proxy...\n');

// Test 1: Health check
function testViteProxy() {
  return new Promise((resolve) => {
    http.get('http://localhost:5173/api/community', (res) => {
      console.log('✅ Vite proxy is working on port 5173');
      console.log('   Status:', res.statusCode);
      resolve(true);
    }).on('error', (err) => {
      console.log('❌ Cannot connect to Vite proxy:', err.message);
      console.log('   Make sure to run: npm run dev');
      resolve(false);
    });
  });
}

// Run test
async function runTest() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const proxyOK = await testViteProxy();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (proxyOK) {
    console.log('✅ Vite proxy is working!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Open http://localhost:5173');
    console.log('2. Navigate to Communities');
    console.log('3. Check console for API calls');
    console.log('4. No more CORS errors!');
  } else {
    console.log('❌ Vite proxy is not working!');
    console.log('   Start it with: npm run dev');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTest();
