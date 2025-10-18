import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Gamepad2, Crown, Shield } from 'lucide-react';
import { testUsers, loginAsTestUser } from '../data/testUsers';

export function TestLogin() {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const handleLogin = (userId: number) => {
    const testUser = loginAsTestUser(userId);
    if (testUser) {
      // Set user in localStorage
      localStorage.setItem('user', JSON.stringify(testUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard
      navigate('/dashboard');
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return 'text-purple-400';
    if (level >= 5) return 'text-blue-400';
    if (level >= 3) return 'text-green-400';
    return 'text-gray-400';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 8) return <Crown className="w-4 h-4" />;
    if (level >= 5) return <Shield className="w-4 h-4" />;
    return <Gamepad2 className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Test Chat System
          </h1>
          <p className="text-gray-400">
            Chọn tài khoản để test chat real-time giữa 2 browser
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
          <h3 className="text-blue-400 font-semibold mb-2">📋 Hướng dẫn test:</h3>
          <ol className="text-blue-300 text-sm space-y-1">
            <li>1. Mở 2 browser khác nhau (Chrome + Firefox hoặc 2 tab incognito)</li>
            <li>2. Mỗi browser chọn 1 tài khoản khác nhau</li>
            <li>3. Vào "Phòng chat" → Chọn nhóm → Chat với nhau!</li>
            <li>4. Messages sẽ hiện real-time giữa 2 browser</li>
          </ol>
        </div>

        {/* Test Users */}
        <div className="grid md:grid-cols-3 gap-6">
          {testUsers.map((user) => (
            <div
              key={user.id}
              className={`bg-gray-800 rounded-xl p-6 border-2 transition-all cursor-pointer ${
                selectedUser === user.id
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedUser(user.id)}
            >
              <div className="text-center">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-white">{user.avatar}</span>
                </div>

                {/* User Info */}
                <h3 className="text-lg font-bold text-white mb-1">
                  {user.fullName}
                </h3>
                <p className="text-gray-400 text-sm mb-2">
                  @{user.userName}
                </p>
                <p className="text-gray-500 text-xs mb-3">
                  {user.university}
                </p>

                {/* Level */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {getLevelIcon(user.level)}
                  <span className={`text-sm font-medium ${getLevelColor(user.level)}`}>
                    Level {user.level}
                  </span>
                </div>

                {/* Login Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogin(user.id);
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Current Selection */}
        {selectedUser && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Đã chọn: <span className="text-white font-medium">
                {testUsers.find(u => u.id === selectedUser)?.fullName}
              </span>
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-gray-800 rounded-xl p-4">
          <h4 className="text-white font-semibold mb-2">💡 Tips:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Mở 2 browser để test chat real-time</li>
            <li>• Messages sẽ sync giữa các browser</li>
            <li>• Có auto-simulate messages từ fake users</li>
            <li>• Test voice channels và text channels</li>
          </ul>
        </div>
      </div>
    </div>
  );
}


