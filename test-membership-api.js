// Test script for Membership Tree API
const axios = require('axios');

const API_BASE_URL = 'https://localhost:7227';

// Test function to get membership tree
async function testGetMembershipTree() {
  try {
    console.log(`🔄 Testing Membership Tree API...`);
    
    // You need to replace this with a real token from login
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const response = await axios.get(`${API_BASE_URL}/api/Memberships/tree`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Membership Tree API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check response structure
    if (response.data.Clubs && Array.isArray(response.data.Clubs)) {
      console.log(`✅ Found ${response.data.Clubs.length} clubs`);
      
      // Display clubs and rooms
      response.data.Clubs.forEach((club, index) => {
        console.log(`\n📋 Club ${index + 1}:`);
        console.log(`   ID: ${club.ClubId}`);
        console.log(`   Name: ${club.ClubName}`);
        console.log(`   Rooms: ${club.Rooms?.length || 0}`);
        
        if (club.Rooms && club.Rooms.length > 0) {
          console.log(`   Room Details:`);
          club.Rooms.forEach((room, roomIndex) => {
            console.log(`     ${roomIndex + 1}. ${room.RoomName} (${room.RoomId})`);
          });
        }
      });
      
      // Display overview
      if (response.data.Overview) {
        console.log(`\n📊 Overview:`);
        console.log(`   Total Clubs: ${response.data.Overview.ClubCount}`);
        console.log(`   Total Rooms: ${response.data.Overview.RoomCount}`);
      }
    } else {
      console.log('❌ Invalid response structure');
    }
    
  } catch (error) {
    console.error('❌ Error testing Membership Tree API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Authentication failed - please check your token');
    } else if (error.response?.status === 404) {
      console.log('🔍 API endpoint not found - check the URL');
    }
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
  console.log('7. Run: node test-membership-api.js');
  console.log('\n📝 Available commands:');
  console.log('  node test-membership-api.js                    - Test get membership tree');
  console.log('  node test-membership-api.js --help             - Show this help');
}

// Run test based on arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showInstructions();
} else {
  // Default: test get membership tree
  testGetMembershipTree();
}
