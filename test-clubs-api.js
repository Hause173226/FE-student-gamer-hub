// Test script for Clubs API
const axios = require('axios');

const API_BASE_URL = 'https://localhost:7227';

// Test function to get clubs by community ID
async function testGetClubsByCommunityId(communityId) {
  try {
    console.log(`🔄 Testing Clubs API for community ${communityId}...`);
    
    // You need to replace this with a real token from login
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const response = await axios.get(`${API_BASE_URL}/api/communities/${communityId}/clubs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Clubs API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check response structure
    if (response.data.Items && Array.isArray(response.data.Items)) {
      console.log(`✅ Found ${response.data.Items.length} clubs`);
      
      // Display first few clubs
      response.data.Items.slice(0, 3).forEach((club, index) => {
        console.log(`\n📋 Club ${index + 1}:`);
        console.log(`   ID: ${club.Id}`);
        console.log(`   Name: ${club.Name}`);
        console.log(`   Community ID: ${club.CommunityId}`);
        console.log(`   Description: ${club.Description}`);
        console.log(`   Members: ${club.MembersCount}`);
        console.log(`   Public: ${club.IsPublic}`);
      });
    } else {
      console.log('❌ Invalid response structure');
    }
    
  } catch (error) {
    console.error('❌ Error testing Clubs API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Authentication failed - please check your token');
    } else if (error.response?.status === 404) {
      console.log('🔍 API endpoint not found - check the URL and communityId');
    }
  }
}

// Test with sample community ID
const sampleCommunityId = 'd4bd29fa-69bb-463e-b493-0b897b5ed384';

// Instructions for getting token and community ID
function showInstructions() {
  console.log('\n📋 Instructions:');
  console.log('1. Login to your application');
  console.log('2. Open browser DevTools (F12)');
  console.log('3. Go to Application/Storage tab');
  console.log('4. Find localStorage and look for "token" key');
  console.log('5. Copy the token value');
  console.log('6. Replace "YOUR_ACCESS_TOKEN_HERE" in this script');
  console.log('7. Get a community ID from Communities API or use the sample one');
  console.log('8. Run: node test-clubs-api.js');
  console.log('\n🔍 Sample Community ID:', sampleCommunityId);
}

// Run test
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showInstructions();
} else {
  // Use community ID from command line or default sample
  const communityId = process.argv[2] || sampleCommunityId;
  testGetClubsByCommunityId(communityId);
}
