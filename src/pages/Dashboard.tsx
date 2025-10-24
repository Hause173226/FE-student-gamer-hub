import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Users, 
  Calendar, 
  Clock,
  CheckCircle,
  Circle,
  Activity,
  Gamepad2
} from 'lucide-react';
import DashboardService, { DashboardResponse, TodayQuest, TodayEvent } from '../services/dashboardService';
import GameService from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myGamesCount, setMyGamesCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard data and games count in parallel
      const [dashboardResult, gamesResult] = await Promise.allSettled([
        DashboardService.getTodayDashboard().catch(() => DashboardService.getMockDashboardData()),
        GameService.getMyGames().catch(() => [])
      ]);
      
      if (dashboardResult.status === 'fulfilled') {
        setDashboardData(dashboardResult.value);
        console.log('📊 Dashboard data loaded:', dashboardResult.value);
      }
      
      if (gamesResult.status === 'fulfilled') {
        setMyGamesCount(gamesResult.value.length);
        console.log('🎮 Games count loaded:', gamesResult.value.length);
      }
    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError('Không thể tải dữ liệu dashboard');
      // Set mock data as fallback
      const mockData = DashboardService.getMockDashboardData();
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (quest: TodayQuest) => {
    if (quest.isCompleted) return;
    
    try {
      const result = await DashboardService.completeQuest(quest.id);
      if (result.success) {
        // Update local state
        setDashboardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              totalPoints: prev.stats.totalPoints + result.pointsEarned,
              questsCompletedToday: prev.stats.questsCompletedToday + 1
            },
            todayQuests: (prev.todayQuests || []).map(q => 
              q.id === quest.id 
                ? { ...q, isCompleted: true, completedAt: new Date().toISOString() }
                : q
            )
          };
        });
        console.log(`✅ Quest completed: ${quest.title} (+${result.pointsEarned} points)`);
      }
    } catch (err) {
      console.error('❌ Error completing quest:', err);
      // Still update UI for better UX
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            totalPoints: prev.stats.totalPoints + quest.points,
            questsCompletedToday: prev.stats.questsCompletedToday + 1
          },
          todayQuests: (prev.todayQuests || []).map(q => 
            q.id === quest.id 
              ? { ...q, isCompleted: true, completedAt: new Date().toISOString() }
              : q
          )
        };
      });
    }
  };

  const handleRegisterEvent = async (event: TodayEvent) => {
    if (event.isRegistered) return;
    
    try {
      const result = await DashboardService.registerEvent(event.id);
      if (result.success) {
        // Update local state
        setDashboardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            todayEvents: (prev.todayEvents || []).map(e => 
              e.id === event.id 
                ? { ...e, isRegistered: true, currentParticipants: e.currentParticipants + 1 }
                : e
            )
          };
        });
        console.log(`✅ Event registered: ${event.title}`);
      }
    } catch (err) {
      console.error('❌ Error registering for event:', err);
      // Still update UI for better UX
      setDashboardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          todayEvents: (prev.todayEvents || []).map(e => 
            e.id === event.id 
              ? { ...e, isRegistered: true, currentParticipants: e.currentParticipants + 1 }
              : e
          )
        };
      });
    }
  };

  const getQuestIcon = (quest: TodayQuest) => {
    switch (quest.type) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'special': return '⭐';
      default: return quest.icon;
    }
  };

  const getEventIcon = (event: TodayEvent) => {
    switch (event.type) {
      case 'tournament': return '🏆';
      case 'meetup': return '👥';
      case 'workshop': return '💻';
      default: return event.icon;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'N/A';
    }
    
    try {
      // Handle ISO datetime string
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString; // Return original if not a valid date
      }
      
      // Format as HH:MM
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return timeString; // Return original on error
    }
  };

  const getProgressPercentage = () => {
    if (!dashboardData?.stats) return 0;
    const { level, pointsToNextLevel } = dashboardData.stats;
    const currentLevelPoints = level * 200; // Assuming 200 points per level
    const nextLevelPoints = (level + 1) * 200;
    const progress = ((nextLevelPoints - pointsToNextLevel) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Early return if dashboardData is still null
  if (!dashboardData) {
    return null;
  }

  const { stats, todayQuests, todayEvents, recentActivity } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Chào mừng trở lại, {user?.fullName || user?.userName}!
              </h1>
              <p className="text-gray-300 mt-1">
                Hôm nay là một ngày tuyệt vời để gaming! 🎮
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Hôm nay</div>
              <div className="text-lg font-semibold text-white">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          {/* Points Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Tổng điểm</p>
                <p className="text-3xl font-bold">
                  {typeof stats?.totalPoints === 'number' ? stats.totalPoints.toLocaleString() : '0'}
                </p>
              </div>
              <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span>Cấp độ {stats?.level || 0}</span>
                <span>{stats?.pointsToNextLevel || 0} điểm đến cấp tiếp theo</span>
              </div>
              <div className="mt-2 bg-indigo-400 bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Quests Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Nhiệm vụ hôm nay</p>
                <p className="text-3xl font-bold">{stats?.questsCompletedToday || 0}/{stats?.totalQuestsToday || 0}</p>
              </div>
              <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-emerald-100">
                {(stats?.questsCompletedToday || 0) === (stats?.totalQuestsToday || 0)
                  ? '🎉 Hoàn thành tất cả!' 
                  : `${(stats?.totalQuestsToday || 0) - (stats?.questsCompletedToday || 0)} nhiệm vụ còn lại`
                }
              </div>
            </div>
          </div>

          {/* Games Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Games trong thư viện</p>
                <p className="text-3xl font-bold">{myGamesCount}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                <Gamepad2 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-green-100">
                Games đã thêm vào thư viện
              </div>
            </div>
          </div>

          {/* Friends Card */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Bạn bè online</p>
                <p className="text-3xl font-bold">{stats?.friendsOnline || 0}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-purple-100">
                {stats?.totalFriends || 0} bạn bè tổng cộng
              </div>
            </div>
          </div>

          {/* Events Card */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Sự kiện hôm nay</p>
                <p className="text-3xl font-bold">{stats?.eventsToday || 0}</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-orange-100">
                {stats?.roomsJoined || 0} rooms đã tham gia
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Quests */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-emerald-500" />
                Nhiệm vụ hôm nay
              </h2>
              <span className="text-sm text-gray-400">
                {stats?.questsCompletedToday || 0}/{stats?.totalQuestsToday || 0}
              </span>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {(todayQuests || []).map((quest: TodayQuest, index: number) => (
                <div 
                  key={quest.id || `quest-${index}`}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    quest.isCompleted 
                      ? 'bg-emerald-900/30 border-emerald-500' 
                      : 'bg-gray-700 border-gray-600 hover:border-emerald-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getQuestIcon(quest)}</div>
                      <div>
                        <h3 className={`font-semibold ${quest.isCompleted ? 'text-emerald-300' : 'text-white'}`}>
                          {quest.title || 'Untitled Quest'}
                        </h3>
                        <p className={`text-sm ${quest.isCompleted ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {quest.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${quest.isCompleted ? 'text-emerald-400' : 'text-emerald-400'}`}>
                          +{quest.points || 0} điểm
                        </div>
                        {quest.isCompleted && quest.completedAt && (
                          <div className="text-xs text-emerald-500">
                            {new Date(quest.completedAt).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCompleteQuest(quest)}
                        disabled={quest.isCompleted}
                        className={`p-2 rounded-full transition-colors ${
                          quest.isCompleted
                            ? 'bg-emerald-900/50 text-emerald-300 cursor-not-allowed'
                            : 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800/50'
                        }`}
                      >
                        {quest.isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Events */}
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                Sự kiện hôm nay
              </h2>
              <span className="text-sm text-gray-400">
                {todayEvents?.filter(e => e.isRegistered).length || 0}/{todayEvents?.length || 0} đã đăng ký
              </span>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {(todayEvents || []).map((event: TodayEvent, index) => (
                <div 
                  key={event.id || `event-${index}`}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    event.isRegistered 
                      ? 'bg-orange-900/30 border-orange-500' 
                      : 'bg-gray-700 border-gray-600 hover:border-orange-400 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getEventIcon(event)}</div>
                      <div>
                        <h3 className={`font-semibold ${event.isRegistered ? 'text-orange-300' : 'text-white'}`}>
                          {event.title || 'Untitled Event'}
                        </h3>
                        <p className={`text-sm ${event.isRegistered ? 'text-orange-400' : 'text-gray-400'}`}>
                          {event.description || 'No description available'}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </div>
                          <div className="flex items-center text-xs text-gray-400">
                            <Users className="h-3 w-3 mr-1" />
                            {event.currentParticipants || 0}/{event.maxParticipants || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${event.isRegistered ? 'text-orange-400' : 'text-orange-400'}`}>
                          {event.type === 'tournament' ? 'Giải đấu' : 
                           event.type === 'meetup' ? 'Gặp gỡ' : 'Workshop'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {event.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRegisterEvent(event)}
                        disabled={event.isRegistered || event.currentParticipants >= event.maxParticipants}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          event.isRegistered
                            ? 'bg-orange-900/50 text-orange-300 cursor-not-allowed'
                            : event.currentParticipants >= event.maxParticipants
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-900/50 text-orange-300 hover:bg-orange-800/50'
                        }`}
                      >
                        {event.isRegistered ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : event.currentParticipants >= event.maxParticipants ? (
                          'Đầy'
                        ) : (
                          'Đăng ký'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-500" />
                Hoạt động gần đây
              </h2>
            <span className="text-sm text-gray-400">
              {recentActivity?.length || 0} hoạt động
            </span>
          </div>
          
          <div className="space-y-4">
            {(recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="text-2xl">{activity.icon || '📋'}</div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message || 'No message'}</p>
                  <p className="text-sm text-gray-400">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString('vi-VN') : 'No timestamp'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;