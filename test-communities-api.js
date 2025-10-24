// Test script for Communities API
const axios = require('axios');

const API_BASE_URL = 'https://localhost:7227/api/Communities';

// Test function to get communities
async function testGetCommunities() {
  try {
    console.log('🔄 Testing Communities API...');
    
    // You need to replace this with a real token from login
    const token = 'YOUR_ACCESS_TOKEN_HERE';
    
    const response = await axios.get(API_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Communities API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check response structure
    if (response.data.Items && Array.isArray(response.data.Items)) {
      console.log(`✅ Found ${response.data.Items.length} communities`);
      
      // Display first few communities
      response.data.Items.slice(0, 3).forEach((community, index) => {
        console.log(`\n📋 Community ${index + 1}:`);
        console.log(`   ID: ${community.Id}`);
        console.log(`   Name: ${community.Name}`);
        console.log(`   School: ${community.School}`);
        console.log(`   Members: ${community.MembersCount}`);
        console.log(`   Public: ${community.IsPublic}`);
      });
    } else {
      console.log('❌ Invalid response structure');
    }
    
  } catch (error) {
    console.error('❌ Error testing Communities API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Authentication failed - please check your token');
    } else if (error.response?.status === 404) {
      console.log('🔍 API endpoint not found - check the URL');
    }
  }
}

// Instructions for getting token
function showInstructions() {
  console.log('\n📋 Instructions to get Access Token:');
  console.log('1. Login to your application');
  console.log('2. Open browser DevTools (F12)');
  console.log('3. Go to Application/Storage tab');
  console.log('4. Find localStorage and look for "token" key');
  console.log('5. Copy the token value');
  console.log('6. Replace "YOUR_ACCESS_TOKEN_HERE" in this script');
  console.log('7. Run: node test-communities-api.js');
}

// Run test
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showInstructions();
} else {
  testGetCommunities();
}
