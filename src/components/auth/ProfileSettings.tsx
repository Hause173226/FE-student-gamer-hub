import React, { useState } from 'react';
import { User, Lock, Mail, Save, Eye, EyeOff } from 'lucide-react';
import userService, { UpdateProfilePayload, ChangePasswordPayload } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const ProfileSettings: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'email'>('profile');
  
  // Profile form
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    university: user?.university || '',
    phoneNumber: user?.phoneNumber || '',
    avatarUrl: user?.avatarUrl || '',
    coverUrl: user?.coverUrl || ''
  });
  
  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Email form
  const [emailData, setEmailData] = useState({
    newEmail: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const payload: UpdateProfilePayload = {
        fullName: profileData.fullName.trim() || undefined,
        university: profileData.university.trim() || undefined,
        phoneNumber: profileData.phoneNumber.trim() || undefined,
        avatarUrl: profileData.avatarUrl.trim() || undefined,
        coverUrl: profileData.coverUrl.trim() || undefined
      };
      
      await userService.updateProfile(payload);
      await checkAuth(); // Refresh user data
      
      toast.success('Cập nhật thông tin thành công!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể cập nhật thông tin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    
    if (!passwordData.newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const payload: ChangePasswordPayload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };
      
      await userService.changePassword(payload);
      
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Đổi mật khẩu thành công!');
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể đổi mật khẩu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.newEmail.trim()) {
      toast.error('Vui lòng nhập email mới');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: user?.id || '',
        newEmail: emailData.newEmail.trim()
      };
      
      const callbackBaseUrl = `${window.location.origin}/confirm-email`;
      await userService.sendEmailChange(payload, callbackBaseUrl);
      
      setEmailData({ newEmail: '' });
      toast.success('Email xác nhận đổi email đã được gửi!');
    } catch (error: any) {
      console.error('Change email error:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể gửi email xác nhận';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
    { id: 'email', label: 'Đổi email', icon: Mail }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Cài đặt tài khoản</h1>
            <p className="text-gray-300 mt-1">Quản lý thông tin cá nhân và bảo mật</p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 bg-gray-700">
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Thông tin cá nhân</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Trường đại học
                      </label>
                      <input
                        type="text"
                        value={profileData.university}
                        onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập tên trường"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Avatar URL
                      </label>
                      <input
                        type="url"
                        value={profileData.avatarUrl}
                        onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cover URL
                    </label>
                    <input
                      type="url"
                      value={profileData.coverUrl}
                      onChange={(e) => setProfileData({ ...profileData, coverUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Đổi mật khẩu</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                        placeholder="Nhập mật khẩu hiện tại"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                        placeholder="Nhập lại mật khẩu mới"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              )}

              {/* Email Tab */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Đổi email</h2>
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-300 text-sm mb-2">Email hiện tại:</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email mới
                    </label>
                    <input
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({ newEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nhập email mới"
                      required
                    />
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      <strong>Lưu ý:</strong> Sau khi đổi email, bạn sẽ nhận được email xác nhận tại địa chỉ email mới. 
                      Vui lòng kiểm tra hộp thư và làm theo hướng dẫn để hoàn tất việc đổi email.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    {loading ? 'Đang gửi...' : 'Gửi email xác nhận'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
