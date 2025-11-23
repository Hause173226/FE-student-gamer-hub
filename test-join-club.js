// Test script for Join Club API
const axios = require('axios');

const API_BASE_URL = 'https://localhost:7227';

// Test function to join club
async function testJoinClub(clubId) {
  try {
    console.log(`🔄 Testing Join Club API for club ${clubId}...`);
    
    // You need to replace this with a real token from login
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const response = await axios.post(`${API_BASE_URL}/api/Clubs/${clubId}/join`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Join Club API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('🎉 Successfully joined the club!');
    } else {
      console.log('❌ Failed to join the club');
    }
    
  } catch (error) {
    console.error('❌ Error testing Join Club API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Authentication failed - please check your token');
    } else if (error.response?.status === 404) {
      console.log('🔍 Club not found - check the clubId');
    } else if (error.response?.status === 400) {
      console.log('⚠️ Bad request - you might already be a member or club is full');
    }
  }
}

// Test function to get club details
async function testGetClubDetails(clubId) {
  try {
    console.log(`🔄 Testing Get Club Details API for club ${clubId}...`);
    
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const response = await axios.get(`${API_BASE_URL}/api/Clubs/${clubId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Club Details API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Club Details API:', error.response?.data || error.message);
  }
}

// Instructions for getting token and IDs
function showInstructions() {
  console.log('\n📋 Instructions:');
  console.log('1. Login to your application');
  console.log('2. Open browser DevTools (F12)');
  console.log('3. Go to Application/Storage tab');
  console.log('4. Find localStorage and look for "token" key');
  console.log('5. Copy the token value');
  console.log('6. Replace "YOUR_ACCESS_TOKEN_HERE" in this script');
  console.log('7. Get a club ID from Communities API or use a sample one');
  console.log('8. Run: node test-join-club.js');
  console.log('\n🔍 Sample Club ID: e7d6faa6-f30e-4ca9-8897-2d67cf3d9187');
  console.log('\n📝 Available commands:');
  console.log('  node test-join-club.js [clubId]                    - Test join club');
  console.log('  node test-join-club.js --details [clubId]         - Test get club details');
  console.log('  node test-join-club.js --help                     - Show this help');
}

// Run test based on arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showInstructions();
} else if (args.includes('--details')) {
  const clubId = args[args.indexOf('--details') + 1];
  if (clubId) {
    testGetClubDetails(clubId);
  } else {
    console.log('❌ Please provide club ID: node test-join-club.js --details [clubId]');
  }
} else {
  // Default: test join club
  const clubId = args[0] || 'e7d6faa6-f30e-4ca9-8897-2d67cf3d9187';
  testJoinClub(clubId);
}

