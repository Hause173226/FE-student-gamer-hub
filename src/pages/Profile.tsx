import  { useState } from 'react';
import { 
  Settings, 
  Trophy, 
  Star, 
  Calendar, 
  MapPin, 
  Mail, 
  GamepadIcon,
  Crown,
  Target,
  Clock,
  Users,
  TrendingUp,
  Award,
  Zap,
  Edit3,
  Camera,
  Shield
} from 'lucide-react';

export function Profile() {
  const [activeTab, setActiveTab] = useState('overview');

  const achievements = [
    { id: 1, title: 'First Blood', description: 'Thắng trận đầu tiên', icon: Trophy, color: 'text-yellow-500', earned: true },
    { id: 2, title: 'Team Player', description: 'Chơi 50 trận cùng team', icon: Users, color: 'text-blue-500', earned: true },
    { id: 3, title: 'Rank Climber', description: 'Thăng hạng 3 tier', icon: TrendingUp, color: 'text-emerald-500', earned: true },
    { id: 4, title: 'Community Leader', description: 'Tạo cộng đồng có 100+ thành viên', icon: Crown, color: 'text-purple-500', earned: false },
    { id: 5, title: 'Tournament Winner', description: 'Vô địch giải đấu', icon: Award, color: 'text-orange-500', earned: false },
    { id: 6, title: 'Streamer', description: 'Stream 10 trận', icon: Zap, color: 'text-pink-500', earned: false },
  ];

  const gameStats = [
    { game: 'League of Legends', rank: 'Gold II', winRate: '68%', matches: 156, hours: 234, icon: '🏆' },
    { game: 'Valorant', rank: 'Platinum I', winRate: '72%', matches: 89, hours: 127, icon: '🎯' },
    { game: 'Dota 2', rank: 'Ancient III', winRate: '61%', matches: 45, hours: 98, icon: '⚔️' },
  ];

  const recentMatches = [
    { id: 1, game: 'League of Legends', result: 'Thắng', rank: '+23 LP', time: '2 giờ trước', duration: '28:45' },
    { id: 2, game: 'Valorant', result: 'Thắng', rank: '+25 RR', time: '4 giờ trước', duration: '35:12' },
    { id: 3, game: 'League of Legends', result: 'Thua', rank: '-18 LP', time: '1 ngày trước', duration: '42:33' },
    { id: 4, game: 'Dota 2', result: 'Thắng', rank: '+28 MMR', time: '2 ngày trước', duration: '51:20' },
  ];

  const tabs = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'stats', label: 'Thống kê' },
    { id: 'achievements', label: 'Thành tích' },
    { id: 'matches', label: 'Lịch sử' },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 border-white/20">
                MN
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Minh Nguyễn</h1>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">Level 12</span>
                </div>
                <button className="text-white/80 hover:text-white">
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-3">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>FPT University</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>minhnguyen@fpt.edu.vn</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia từ tháng 3, 2024</span>
                </div>
              </div>

              {/* XP Progress */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">XP Progress</span>
                  <span className="text-white text-sm">2,450 / 3,000 XP</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                </div>
                <p className="text-white/80 text-xs mt-1">550 XP để lên Level 13</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors">
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tổng trận</p>
              <p className="text-white font-bold text-xl">290</p>
            </div>
            <GamepadIcon className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tỷ lệ thắng</p>
              <p className="text-white font-bold text-xl">67%</p>
            </div>
            <Target className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Giờ chơi</p>
              <p className="text-white font-bold text-xl">459h</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Rank cao nhất</p>
              <p className="text-white font-bold text-xl">Plat I</p>
            </div>
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Game Stats */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Game yêu thích</h2>
            <div className="space-y-4">
              {gameStats.map((game, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{game.icon}</span>
                      <div>
                        <h3 className="text-white font-medium">{game.game}</h3>
                        <p className="text-gray-400 text-sm">{game.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">{game.winRate}</p>
                      <p className="text-gray-400 text-sm">Tỷ lệ thắng</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Trận đấu</p>
                      <p className="text-white font-medium">{game.matches}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Giờ chơi</p>
                      <p className="text-white font-medium">{game.hours}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Đạt thành tích Team Player</p>
                  <p className="text-gray-400 text-sm">1 giờ trước</p>
                </div>
                <span className="text-emerald-400 text-sm font-medium">+100 XP</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Lên Level 12</p>
                  <p className="text-gray-400 text-sm">2 giờ trước</p>
                </div>
                <span className="text-blue-400 text-sm font-medium">Level Up!</span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Tham gia FPT LoL Community</p>
                  <p className="text-gray-400 text-sm">1 ngày trước</p>
                </div>
                <span className="text-purple-400 text-sm font-medium">+50 XP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id} 
                className={`bg-gray-800 rounded-xl p-6 border border-gray-700 transition-all ${
                  achievement.earned 
                    ? 'hover:border-gray-600' 
                    : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 ${achievement.earned ? 'bg-gray-700' : 'bg-gray-800'} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${achievement.earned ? achievement.color : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${achievement.earned ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    {achievement.earned && (
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 text-xs">Đã đạt được</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className={`text-sm ${achievement.earned ? 'text-gray-400' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Lịch sử trận đấu</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {recentMatches.map((match) => (
              <div key={match.id} className="p-4 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      match.result === 'Thắng' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      <span className="font-bold text-sm">{match.result === 'Thắng' ? 'W' : 'L'}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{match.game}</h3>
                      <p className="text-gray-400 text-sm">{match.time} • {match.duration}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      match.result === 'Thắng' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {match.rank}
                    </p>
                    <p className="text-gray-400 text-sm">{match.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}