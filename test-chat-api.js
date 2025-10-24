const fetch = require('node-fetch');
const { HubConnectionBuilder } = require('@microsoft/signalr');

const API_BASE_URL = 'https://localhost:7227';
const HUB_URL = 'https://localhost:7227/ws/chat';

// Test user credentials
const TEST_USER = {
  email: 'admin@studentgamerhub.com',
  password: 'Admin@123'
};

let accessToken = '';

async function login() {
  try {
    console.log('🔄 Logging in...');
    
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.accessToken;
    console.log('✅ Login successful');
    console.log('User ID:', data.user.id);
    
    return data.user;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

async function testChatConnection() {
  try {
    console.log('🔄 Testing SignalR connection...');
    
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken,
        skipNegotiation: true,
        transport: 1 // WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(1) // Information level
      .build();

    // Event handlers
    connection.on('msg', (message) => {
      console.log('📨 Message received:', message);
    });

    connection.on('history', (response) => {
      console.log('📚 History received:', response);
    });

    connection.onreconnecting((error) => {
      console.log('🔄 Reconnecting...', error?.message);
    });

    connection.onreconnected((connectionId) => {
      console.log('✅ Reconnected:', connectionId);
    });

    connection.onclose((error) => {
      console.log('❌ Connection closed:', error?.message);
    });

    // Connect
    await connection.start();
    console.log('✅ Connected to ChatHub');

    // Test room message
    const testRoomId = 'test-room-123';
    const testChannel = `room:${testRoomId}`;
    
    console.log('🔄 Joining test room...');
    await connection.invoke('JoinChannels', [testChannel]);
    
    console.log('🔄 Sending test message...');
    await connection.invoke('SendMessage', testChannel, 'Hello from test!');
    
    console.log('🔄 Loading history...');
    await connection.invoke('LoadHistory', testChannel, null, 10);

    // Wait a bit for messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Disconnect
    await connection.stop();
    console.log('✅ Disconnected from ChatHub');

  } catch (error) {
    console.error('❌ Chat test failed:', error.message);
    throw error;
  }
}

async function testRoomAPI() {
  try {
    console.log('🔄 Testing Room API...');
    
    // Get rooms for a club (you'll need to replace with actual club ID)
    const response = await fetch(`${API_BASE_URL}/api/rooms`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Room API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Room API working');
    console.log('Rooms found:', data.items?.length || 0);
    
    return data;
  } catch (error) {
    console.error('❌ Room API test failed:', error.message);
    throw error;
  }
}

async function runTests() {
  try {
    console.log('🚀 Starting Chat API Tests...\n');
    
    // Step 1: Login
    const user = await login();
    console.log('');
    
    // Step 2: Test Room API
    await testRoomAPI();
    console.log('');
    
    // Step 3: Test Chat Connection
    await testChatConnection();
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
