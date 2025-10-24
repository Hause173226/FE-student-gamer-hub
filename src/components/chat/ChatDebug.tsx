import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../hooks/useChat';
import { chatService } from '../../services/chatService';

export const ChatDebug: React.FC = () => {
  const { user, token } = useAuth();
  const { connectionState, isConnecting, error, connect, disconnect } = useChat();

  const handleTestConnection = async () => {
    console.log('🧪 Testing connection...');
    try {
      await connect();
    } catch (err) {
      console.error('Test connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    console.log('🔌 Disconnecting...');
    await disconnect();
  };

  const handleTestRoom = async () => {
    if (!chatService.isConnected()) {
      console.log('❌ Not connected to chat');
      return;
    }

    try {
      console.log('🧪 Testing room message...');
      await chatService.sendRoomMessage('test-room-123', 'Hello from debug!');
    } catch (err) {
      console.error('Test room message failed:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Chat Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>User:</strong> {user ? `${user.email || user.userName || 'Unknown'} (${user.id})` : 'Not logged in'}
        </div>
        
        <div>
          <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}
        </div>
        
        <div>
          <strong>Connection:</strong> 
          <span className={`ml-1 ${
            connectionState === 'Connected' ? 'text-green-400' : 
            connectionState === 'Connecting' ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {connectionState}
          </span>
        </div>
        
        {isConnecting && (
          <div className="text-yellow-400">Connecting...</div>
        )}
        
        {error && (
          <div className="text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {!user && (
          <div className="text-yellow-400 text-xs">
            Please login first to enable chat
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-2">
        <button
          onClick={handleTestConnection}
          disabled={!user || isConnecting || connectionState === 'Connected'}
          className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
        >
          {isConnecting ? 'Connecting...' : 'Test Connect'}
        </button>
        
        <button
          onClick={handleDisconnect}
          disabled={!user || connectionState === 'Disconnected'}
          className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm"
        >
          Disconnect
        </button>
        
        <button
          onClick={handleTestRoom}
          disabled={!user || connectionState !== 'Connected'}
          className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
        >
          Test Room Message
        </button>
      </div>
    </div>
  );
};

export default ChatDebug;
