// Test script for Login API
const axios = require('axios');

const API_BASE_URL = 'https://localhost:7227';

// Test function to login
async function testLogin(username, password) {
  try {
    console.log(`🔄 Testing Login API...`);
    
    const loginData = {
      userNameOrEmail: username,
      password: password
    };
    
    const response = await axios.post(`${API_BASE_URL}/api/Auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.AccessToken) {
      console.log('🎉 Login successful!');
      console.log(`🔑 Access Token: ${response.data.AccessToken.substring(0, 20)}...`);
      console.log(`⏰ Expires At: ${response.data.AccessExpiresAtUtc}`);
      
      // Save token to localStorage (for testing)
      console.log('\n📝 To use this token in your app:');
      console.log('1. Open browser DevTools (F12)');
      console.log('2. Go to Application/Storage tab');
      console.log('3. Find localStorage');
      console.log('4. Add new key "token" with value:', response.data.AccessToken);
      
      return response.data.AccessToken;
    } else {
      console.log('❌ Login failed - no token received');
    }
    
  } catch (error) {
    console.error('❌ Error testing Login API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Authentication failed - check username/password');
    } else if (error.response?.status === 400) {
      console.log('⚠️ Bad request - check your login data format');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🌐 Connection refused - make sure server is running on port 5277');
    }
  }
}

// Test function to get profile (requires token)
async function testGetProfile(token) {
  try {
    console.log(`🔄 Testing Get Profile API...`);
    
    const response = await axios.get(`${API_BASE_URL}/api/Auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Profile API:', error.response?.data || error.message);
  }
}

// Test function to register
async function testRegister(userData) {
  try {
    console.log(`🔄 Testing Register API...`);
    
    const response = await axios.post(`${API_BASE_URL}/api/Auth/user-register`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Register API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Register API:', error.response?.data || error.message);
  }
}

// Instructions
function showInstructions() {
  console.log('\n📋 Instructions:');
  console.log('1. Make sure your server is running on http://localhost:5277');
  console.log('2. Run: node test-login-api.js [username] [password]');
  console.log('3. Or run: node test-login-api.js --register [email] [fullName] [password]');
  console.log('4. Or run: node test-login-api.js --profile [token]');
  console.log('\n📝 Available commands:');
  console.log('  node test-login-api.js [username] [password]           - Test login');
  console.log('  node test-login-api.js --register [email] [fullName] [password] [gender] [phone] [university] - Test register');
  console.log('  node test-login-api.js --profile [token]              - Test get profile');
  console.log('  node test-login-api.js --help                         - Show this help');
  console.log('\n🔍 Sample usage:');
  console.log('  node test-login-api.js admin@example.com password123');
  console.log('  node test-login-api.js --register test@example.com "Test User" password123 1 "0123456789" "FPT University"');
}

// Run test based on arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showInstructions();
} else if (args.includes('--register')) {
  const [email, fullName, password, gender = 1, phone = '', university = ''] = args.slice(1);
  if (email && fullName && password) {
    testRegister({
      email,
      fullName,
      password,
      gender: parseInt(gender),
      phoneNumber: phone || null,
      university: university || null
    });
  } else {
    console.log('❌ Please provide email, fullName, and password');
  }
} else if (args.includes('--profile')) {
  const token = args[args.indexOf('--profile') + 1];
  if (token) {
    testGetProfile(token);
  } else {
    console.log('❌ Please provide token: node test-login-api.js --profile [token]');
  }
} else {
  // Default: test login
  const [username, password] = args;
  if (username && password) {
    testLogin(username, password);
  } else {
    console.log('❌ Please provide username and password');
    console.log('Usage: node test-login-api.js [username] [password]');
    console.log('Example: node test-login-api.js admin@example.com password123');
  }
}

