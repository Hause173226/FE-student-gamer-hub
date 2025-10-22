// Test script for Rooms API
const axios = require('axios');

const API_BASE_URL = 'https://localhost:7227';

// Test function to get rooms by club ID
async function testGetRoomsByClubId(clubId) {
  try {
    console.log(`🔄 Testing Rooms API for club ${clubId}...`);
    
    // You need to replace this with a real token from login
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const response = await axios.get(`${API_BASE_URL}/api/clubs/${clubId}/rooms`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Rooms API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check response structure
    if (response.data.Items && Array.isArray(response.data.Items)) {
      console.log(`✅ Found ${response.data.Items.length} rooms`);
      
      // Display rooms with details
      response.data.Items.forEach((room, index) => {
        console.log(`\n📋 Room ${index + 1}:`);
        console.log(`   ID: ${room.Id}`);
        console.log(`   Name: ${room.Name}`);
        console.log(`   Club ID: ${room.ClubId}`);
        console.log(`   Description: ${room.Description}`);
        console.log(`   Join Policy: ${room.JoinPolicy} (${getJoinPolicyName(room.JoinPolicy)})`);
        console.log(`   Capacity: ${room.Capacity || 'Unlimited'}`);
        console.log(`   Members: ${room.MembersCount}`);
        console.log(`   Owner ID: ${room.OwnerId}`);
        console.log(`   Is Member: ${room.IsMember}`);
        console.log(`   Is Owner: ${room.IsOwner}`);
        console.log(`   Membership Status: ${room.MembershipStatus || 'None'}`);
        console.log(`   Created: ${room.CreatedAtUtc}`);
      });
      
      // Display pagination info
      if (response.data.Page !== undefined) {
        console.log(`\n📊 Pagination Info:`);
        console.log(`   Page: ${response.data.Page}`);
        console.log(`   Size: ${response.data.Size}`);
        console.log(`   Total Count: ${response.data.TotalCount}`);
        console.log(`   Total Pages: ${response.data.TotalPages}`);
        console.log(`   Has Previous: ${response.data.HasPrevious}`);
        console.log(`   Has Next: ${response.data.HasNext}`);
        console.log(`   Sort: ${response.data.Sort}`);
        console.log(`   Desc: ${response.data.Desc}`);
      }
    } else {
      console.log('❌ Invalid response structure');
    }
    
  } catch (error) {
    console.error('❌ Error testing Rooms API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Authentication failed - please check your token');
    } else if (error.response?.status === 404) {
      console.log('🔍 Club not found - check the clubId');
    }
  }
}

// Helper function to get join policy name
function getJoinPolicyName(policy) {
  switch (policy) {
    case 0: return 'Open';
    case 1: return 'Requires Approval';
    case 2: return 'Requires Password';
    default: return 'Unknown';
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
  console.log('8. Run: node test-rooms-api.js');
  console.log('\n🔍 Sample Club ID: e7d6faa6-f30e-4ca9-8897-2d67cf3d9187');
  console.log('\n📝 Available commands:');
  console.log('  node test-rooms-api.js [clubId]                    - Test get rooms by club');
  console.log('  node test-rooms-api.js --help                     - Show this help');
}

// Run test based on arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showInstructions();
} else {
  // Default: test get rooms by club
  const clubId = args[0] || 'e7d6faa6-f30e-4ca9-8897-2d67cf3d9187';
  testGetRoomsByClubId(clubId);
}
