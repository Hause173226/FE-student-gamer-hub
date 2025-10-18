import React from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Gamepad2, 
  Trophy, 
  Star,
  MapPin,
  Play,
  MessageCircle,
  Calendar,
  TrendingUp,
  Zap,
  Flame,
  Target,
  Crown
} from 'lucide-react';

export function Dashboard() {
  // Simplified dashboard - no mock data, will be populated from API later
  const onlineTeammates: any[] = [];
  const todayEvents: any[] = [];
  const dailyMissions: any[] = [];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Chào mừng trở lại, Minh! 
          </h1>
          <div className="flex space-x-2">
            <span className="text-2xl">🎮</span>
            <span className="text-2xl animate-bounce">🔥</span>
          </div>
        </div>
        <p className="text-gray-400">Hôm nay có <span className="text-emerald-400 font-medium">247 sinh viên</span> đang online và sẵn sàng chơi</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Rank hiện tại</p>
                <p className="text-white font-bold text-lg">Gold II</p>
              </div>
              <Trophy className="w-8 h-8 text-emerald-100" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-100 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>+2 hạng tuần này</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-purple-100 text-sm font-medium">Level</p>
                <p className="text-white font-bold text-lg">12</p>
              </div>
              <Star className="w-8 h-8 text-purple-100" />
            </div>
            <div className="w-full bg-purple-400/30 rounded-full h-2">
              <div className="bg-purple-100 h-2 rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-rose-100 text-sm font-medium">Trận thắng tuần</p>
                <p className="text-white font-bold text-lg">12/18</p>
              </div>
              <Target className="w-8 h-8 text-rose-100" />
            </div>
            <div className="text-rose-100 text-xs">
              <span className="text-emerald-200">67%</span> tỷ lệ thắng
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-amber-100 text-sm font-medium">XP tích lũy</p>
                <p className="text-white font-bold text-lg">2,450</p>
              </div>
              <Flame className="w-8 h-8 text-amber-100" />
            </div>
            <div className="text-amber-100 text-xs">
              +150 XP hôm nay
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Missions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-white">Nhiệm vụ hàng ngày</h2>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                  🎯 NEW
                </span>
              </div>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                Xem thêm
              </button>
            </div>
            
            <div className="space-y-3">
              {dailyMissions.map((mission) => (
                <div key={mission.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{mission.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 text-sm font-bold">+{mission.xp} XP</span>
                      {mission.completed && <Crown className="w-4 h-4 text-yellow-400" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">{mission.progress}/{mission.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matchmaking Section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Tìm đồng đội ngay 🔥</h2>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                Xem tất cả
              </button>
            </div>
            
            {/* Quick Match Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105">
                <div className="text-center">
                  <Gamepad2 className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">League of Legends</p>
                  <p className="text-xs text-blue-100">15 người online</p>
                </div>
              </button>
              
              <button className="bg-gradient-to-r from-red-600 to-rose-600 p-4 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all transform hover:scale-105">
                <div className="text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Valorant</p>
                  <p className="text-xs text-red-100">23 người online</p>
                </div>
              </button>
              
              <button className="bg-gradient-to-r from-purple-600 to-violet-600 p-4 rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all transform hover:scale-105 col-span-2 lg:col-span-1">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">Dota 2</p>
                  <p className="text-xs text-purple-100">8 người online</p>
                </div>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm theo game, rank, trường... (VD: 'FPT Gold Valorant')"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Online Teammates */}
            <div className="space-y-3">
              {onlineTeammates.map((teammate) => (
                <div key={teammate.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-all transform hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{teammate.avatar}</span>
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${teammate.isPlaying ? 'bg-red-500' : 'bg-emerald-500'} rounded-full border-2 border-gray-700`}></div>
                        {teammate.isPlaying && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-gray-700 flex items-center justify-center">
                            <Play className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{teammate.name}</h3>
                        <p className="text-gray-300 text-sm">{teammate.game} • {teammate.rank}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          <span>{teammate.university}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>Online {teammate.time} trước</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        {teammate.isPlaying ? 'Theo dõi' : 'Mời chơi'}
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Thắng trận Ranked Valorant vs HCMUT team</p>
                  <p className="text-gray-400 text-sm">+25 RR • 2 giờ trước • MVP với 24/8/12</p>
                </div>
                <span className="text-emerald-400 text-sm font-medium">+50 XP</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Tham gia cộng đồng FPT LoL - Chào mừng! 🎉</p>
                  <p className="text-gray-400 text-sm">1 ngày trước • Giờ có thể tham gia các sự kiện độc quyền</p>
                </div>
                <span className="text-blue-400 text-sm font-medium">+20 XP</span>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Đạt thành tích "Team Player" 🤝</p>
                  <p className="text-gray-400 text-sm">2 ngày trước • Đã chơi 50 trận cùng team</p>
                </div>
                <span className="text-purple-400 text-sm font-medium">+100 XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Sự kiện hôm nay</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div key={event.id} className="bg-gray-700 rounded-lg p-3 hover:bg-gray-650 transition-colors">
                  <h3 className="text-white font-medium text-sm">{event.title}</h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{event.time}</span>
                    <span>{event.participants} người</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{event.university}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.type === 'tournament' ? 'bg-yellow-500/20 text-yellow-400' :
                      event.type === 'friendly' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {event.type === 'tournament' ? '🏆 Giải đấu' :
                       event.type === 'friendly' ? '🤝 Giao hữu' :
                       '⚔️ Scrimmage'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Xem thêm sự kiện
            </button>
          </div>

          {/* University Leaderboard */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-4">BXH trường tuần này 🏆</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-bold text-lg">👑</span>
                  <span className="text-white text-sm font-medium">FPT University</span>
                </div>
                <span className="text-yellow-400 text-sm font-bold">2,450 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-bold">2.</span>
                  <span className="text-white text-sm">HCMUT</span>
                </div>
                <span className="text-gray-300 text-sm font-medium">2,180 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600 font-bold">3.</span>
                  <span className="text-white text-sm">UEH</span>
                </div>
                <span className="text-amber-600 text-sm font-medium">1,920 XP</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 font-bold">4.</span>
                  <span className="text-white text-sm">NEU</span>
                </div>
                <span className="text-gray-400 text-sm font-medium">1,650 XP</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-4">Thao tác nhanh</h2>
            <div className="space-y-2">
              <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-lg text-sm font-medium transition-all transform hover:scale-105">
                🎮 Tạo phòng chơi
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-sm font-medium transition-colors">
                📚 Tìm coach
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-sm font-medium transition-colors">
                🏆 Đăng ký giải đấu
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg text-sm font-medium transition-colors">
                💬 Join Discord server
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}