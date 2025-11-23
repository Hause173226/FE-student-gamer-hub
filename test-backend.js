// Test script để kiểm tra PlatformGame-be có chạy không
const http = require('http');

const BASE_URL = 'http://localhost:8080';
const AUTH = Buffer.from('admin:123456').toString('base64');

console.log('🔍 Testing PlatformGame-be Backend...\n');

// Test 1: Health check
function testHealthCheck() {
  return new Promise((resolve) => {
    http.get(BASE_URL, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ Backend is running on port 8080');
        resolve(true);
      } else {
        console.log('❌ Backend returned status:', res.statusCode);
        resolve(false);
      }
    }).on('error', (err) => {
      console.log('❌ Cannot connect to backend:', err.message);
      console.log('   Make sure to run: cd PlatformGame-be && mvn spring-boot:run');
      resolve(false);
    });
  });
}

// Test 2: API Communities
function testCommunitiesAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/community',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json'
      }
    };

    http.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const communities = JSON.parse(data);
            console.log(`✅ Communities API working - Found ${communities.length} communities`);
            if (communities.length > 0) {
              console.log(`   Sample: ${communities[0].name}`);
            } else {
              console.log('   ⚠️  Database is empty - need to seed data');
            }
            resolve(true);
          } catch (e) {
            console.log('❌ Cannot parse communities response');
            resolve(false);
          }
        } else {
          console.log(`❌ Communities API returned status: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Cannot call Communities API:', err.message);
      resolve(false);
    });
  });
}

// Test 3: API Clubs
function testClubsAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/clubs/public',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json'
      }
    };

    http.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const clubs = JSON.parse(data);
            console.log(`✅ Clubs API working - Found ${clubs.length} clubs`);
            resolve(true);
          } catch (e) {
            console.log('❌ Cannot parse clubs response');
            resolve(false);
          }
        } else {
          console.log(`❌ Clubs API returned status: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Cannot call Clubs API:', err.message);
      resolve(false);
    });
  });
}

// Test 4: API Rooms
function testRoomsAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/rooms',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${AUTH}`,
        'Content-Type': 'application/json'
      }
    };

    http.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const rooms = JSON.parse(data);
            console.log(`✅ Rooms API working - Found ${rooms.length} rooms`);
            resolve(true);
          } catch (e) {
            console.log('❌ Cannot parse rooms response');
            resolve(false);
          }
        } else {
          console.log(`❌ Rooms API returned status: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ Cannot call Rooms API:', err.message);
      resolve(false);
    });
  });
}

// Run all tests
async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const healthOK = await testHealthCheck();
  if (!healthOK) {
    console.log('\n❌ Backend is not running!');
    console.log('   Start it with: cd PlatformGame-be && mvn spring-boot:run');
    process.exit(1);
  }

  console.log('');
  await testCommunitiesAPI();
  console.log('');
  await testClubsAPI();
  console.log('');
  await testRoomsAPI();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All tests completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run frontend: npm run dev');
  console.log('2. Open http://localhost:5173');
  console.log('3. Navigate to Communities → Select Community → Select Club → Select Room → Chat!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

runTests();


