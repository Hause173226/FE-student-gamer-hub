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
    if (response.data.data && Array.isArray(response.data.data)) {
      console.log(`✅ Found ${response.data.data.length} rooms`);
      
      // Display first few rooms
      response.data.data.slice(0, 3).forEach((room, index) => {
        console.log(`\n📋 Room ${index + 1}:`);
        console.log(`   ID: ${room.id}`);
        console.log(`   Name: ${room.name}`);
        console.log(`   Club ID: ${room.clubId}`);
        console.log(`   Description: ${room.description}`);
        console.log(`   Join Policy: ${room.joinPolicy}`);
        console.log(`   Members: ${room.membersCount}`);
        console.log(`   Is Member: ${room.isMember}`);
        console.log(`   Is Owner: ${room.isOwner}`);
      });
    } else {
      console.log('❌ Invalid response structure');
    }
    
  } catch (error) {
    console.error('❌ Error testing Rooms API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Authentication failed - please check your token');
    } else if (error.response?.status === 404) {
      console.log('🔍 API endpoint not found - check the URL and clubId');
    }
  }
}

// Test function to get room by ID
async function testGetRoomById(roomId) {
  try {
    console.log(`🔄 Testing Room Detail API for room ${roomId}...`);
    
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const response = await axios.get(`${API_BASE_URL}/api/Rooms/${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Room Detail API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Room Detail API:', error.response?.data || error.message);
  }
}

// Test function to create room
async function testCreateRoom(clubId) {
  try {
    console.log(`🔄 Testing Create Room API for club ${clubId}...`);
    
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const roomData = {
      clubId: clubId,
      name: 'Test Room',
      description: 'A test room created via API',
      joinPolicy: 'Open',
      capacity: 50
    };
    
    const response = await axios.post(`${API_BASE_URL}/api/Rooms`, roomData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Create Room API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Create Room API:', error.response?.data || error.message);
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
  console.log('7. Get a club ID from Clubs API or use a sample one');
  console.log('8. Run: node test-rooms-api.js');
  console.log('\n🔍 Sample Club ID: e7d6faa6-f30e-4ca9-8897-2d67cf3d9187');
  console.log('\n📝 Available commands:');
  console.log('  node test-rooms-api.js [clubId]                    - Test get rooms by club');
  console.log('  node test-rooms-api.js --room [roomId]            - Test get room detail');
  console.log('  node test-rooms-api.js --create [clubId]          - Test create room');
  console.log('  node test-rooms-api.js --help                     - Show this help');
}

// Run test based on arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showInstructions();
} else if (args.includes('--room')) {
  const roomId = args[args.indexOf('--room') + 1];
  if (roomId) {
    testGetRoomById(roomId);
  } else {
    console.log('❌ Please provide room ID: node test-rooms-api.js --room [roomId]');
  }
} else if (args.includes('--create')) {
  const clubId = args[args.indexOf('--create') + 1];
  if (clubId) {
    testCreateRoom(clubId);
  } else {
    console.log('❌ Please provide club ID: node test-rooms-api.js --create [clubId]');
  }
} else {
  // Default: test get rooms by club
  const clubId = args[0] || 'e7d6faa6-f30e-4ca9-8897-2d67cf3d9187';
  testGetRoomsByClubId(clubId);
}


