import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Star, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Camera,
  Award,
  Trophy,
  Activity,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
0
const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    userName: '',
    email: '',
    university: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        fullName: user.fullName || '',
        userName: user.userName || '',
        email: user.email || '',
        university: user.university || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({
      fullName: user?.fullName || '',
      userName: user?.userName || '',
      email: user?.email || '',
      university: user?.university || '',
      bio: user?.bio || ''
    });
    setIsEditing(false);
  };

  const handleSave = () => {
    // TODO: Implement profile update API
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'moderator':
        return <Shield className="w-5 h-5 text-blue-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'text-red-400';
      case 'moderator':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">User not found</h2>
          <p className="text-gray-400">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
          <Link
            to="/profile-settings"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {user.fullName?.charAt(0)?.toUpperCase() || user.userName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-1">
                  {user.fullName || user.userName || 'Unknown User'}
                </h2>
                <p className="text-gray-400 text-sm">@{user.userName || 'username'}</p>
              </div>

              {/* Role & Level */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <span className="text-sm font-medium text-gray-300">Role</span>
                  </div>
                  <span className={`text-sm font-semibold ${getRoleColor(user.role)}`}>
                    {user.role || 'Member'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-300">Level</span>
                  </div>
                  <span className="text-sm font-semibold text-yellow-400">
                    {user.level || 1}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-300">University</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-400">
                    {user.university || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{user.fullName || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.userName}
                      onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="Enter your username"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-white">@{user.userName || 'username'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-white">{user.email || 'Not specified'}</span>
                  </div>
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    University
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.university}
                      onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none"
                      placeholder="Enter your university"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{user.university || 'Not specified'}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={4}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-white">
                        {user.bio || 'No bio available'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Games Played</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                  <div className="bg-blue-600/20 rounded-full p-3">
                    <Trophy className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Quests Completed</p>
                    <p className="text-2xl font-bold text-white">45</p>
                  </div>
                  <div className="bg-green-600/20 rounded-full p-3">
                    <Award className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Events Attended</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                  <div className="bg-purple-600/20 rounded-full p-3">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
