import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/apiConfig';

export function DebugInfo() {
  const { isAuthenticated, user } = useAuth();
  const token = localStorage.getItem('token');
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm text-xs">
      <h3 className="font-bold mb-2">🔧 Debug Info</h3>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Auth Status:</span>
          <span className={`ml-2 ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Token:</span>
          <span className={`ml-2 ${token ? 'text-green-400' : 'text-red-400'}`}>
            {token ? `✅ ${token.substring(0, 20)}...` : '❌ No Token'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">User:</span>
          <span className="ml-2 text-blue-400">
            {user ? (user.fullName || user.userName || 'Unknown') : 'None'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">API Base:</span>
          <span className="ml-2 text-yellow-400">{API_CONFIG.STUDENT_GAMER_HUB_URL}</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600">
        <button
          onClick={() => {
            console.log('🔍 Full Debug Info:');
            console.log('Auth:', { isAuthenticated, user });
            console.log('Token:', token);
            console.log('LocalStorage:', {
              token: localStorage.getItem('token'),
              refreshToken: localStorage.getItem('refreshToken'),
              isAuthenticated: localStorage.getItem('isAuthenticated'),
              user: localStorage.getItem('user')
            });
          }}
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Log Full Info
        </button>
      </div>
    </div>
  );
}
