import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/apiConfig';

// ============================================
// DASHBOARD TYPES & INTERFACES
// ============================================

export interface DashboardStats {
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  questsCompletedToday: number;
  totalQuestsToday: number;
  friendsOnline: number;
  totalFriends: number;
  eventsToday: number;
  roomsJoined: number;
  lastActivity: string;
}

export interface TodayQuest {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  completedAt?: string;
  type: 'daily' | 'weekly' | 'special';
  icon: string;
}

export interface TodayEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isRegistered: boolean;
  maxParticipants: number;
  currentParticipants: number;
  type: 'tournament' | 'meetup' | 'workshop';
  icon: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  todayQuests: TodayQuest[];
  todayEvents: TodayEvent[];
  recentActivity: {
    type: 'quest_completed' | 'event_joined' | 'friend_online' | 'room_joined';
    message: string;
    timestamp: string;
    icon: string;
  }[];
}

// ============================================
// DASHBOARD SERVICE
// ============================================

export class DashboardService {
  // Get today's dashboard data
  static async getTodayDashboard(): Promise<DashboardResponse> {
    try {
      console.log('🔄 Fetching today dashboard...');
      const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD.TODAY);
      console.log('✅ Dashboard API response:', response.data);
      console.log('🔍 API response structure:', JSON.stringify(response.data, null, 2));
      console.log('🔍 Quest fields available:', {
        TodayQuests: response.data.TodayQuests,
        todayQuests: response.data.todayQuests,
        QuestsToday: response.data.QuestsToday,
        questsToday: response.data.questsToday,
        Quests: response.data.Quests,
        quests: response.data.quests
      });
      
      // Transform API response to match our interface
      const apiData = response.data;
      
      // Handle different response formats
      const transformedData: DashboardResponse = {
        stats: {
          totalPoints: typeof apiData.Points === 'number' ? apiData.Points : 
                      typeof apiData.TotalPoints === 'number' ? apiData.TotalPoints : 
                      typeof apiData.totalPoints === 'number' ? apiData.totalPoints : 0,
          level: typeof apiData.Level === 'number' ? apiData.Level : 
                 typeof apiData.level === 'number' ? apiData.level : 1,
          pointsToNextLevel: typeof apiData.PointsToNextLevel === 'number' ? apiData.PointsToNextLevel : 
                            typeof apiData.pointsToNextLevel === 'number' ? apiData.pointsToNextLevel : 0,
          questsCompletedToday: apiData.Quests?.Quests ? apiData.Quests.Quests.filter((q: any) => q.Done).length : 
                               typeof apiData.QuestsCompletedToday === 'number' ? apiData.QuestsCompletedToday : 
                               typeof apiData.questsCompletedToday === 'number' ? apiData.questsCompletedToday : 0,
          totalQuestsToday: apiData.Quests?.Quests ? apiData.Quests.Quests.length : 
                           typeof apiData.TotalQuestsToday === 'number' ? apiData.TotalQuestsToday : 
                           typeof apiData.totalQuestsToday === 'number' ? apiData.totalQuestsToday : 0,
          friendsOnline: typeof apiData.Activity?.OnlineFriends === 'number' ? apiData.Activity.OnlineFriends : 
                        typeof apiData.FriendsOnline === 'number' ? apiData.FriendsOnline : 
                        typeof apiData.friendsOnline === 'number' ? apiData.friendsOnline : 0,
          totalFriends: typeof apiData.TotalFriends === 'number' ? apiData.TotalFriends : 
                       typeof apiData.totalFriends === 'number' ? apiData.totalFriends : 0,
          eventsToday: Array.isArray(apiData.EventsToday) ? apiData.EventsToday.length : 
                      typeof apiData.EventsToday === 'number' ? apiData.EventsToday : 
                      typeof apiData.eventsToday === 'number' ? apiData.eventsToday : 0,
          roomsJoined: typeof apiData.RoomsJoined === 'number' ? apiData.RoomsJoined : 
                      typeof apiData.roomsJoined === 'number' ? apiData.roomsJoined : 0,
          lastActivity: typeof apiData.LastActivity === 'string' ? apiData.LastActivity : 
                       typeof apiData.lastActivity === 'string' ? apiData.lastActivity : new Date().toISOString()
        },
        todayQuests: (apiData.Quests?.Quests || apiData.Quests || []).map((quest: any) => ({
          id: typeof quest.Code === 'string' ? quest.Code : 
              typeof quest.Id === 'string' ? quest.Id : 
              typeof quest.id === 'string' ? quest.id : '',
          title: typeof quest.Title === 'string' ? quest.Title : 
                 typeof quest.title === 'string' ? quest.title : 'Untitled Quest',
          description: quest.Code === 'CHECK_IN_DAILY' ? 'Check-in hàng ngày để nhận điểm' :
                       quest.Code === 'JOIN_ANY_ROOM' ? 'Tham gia bất kỳ phòng nào' :
                       quest.Code === 'INVITE_ACCEPTED' ? 'Chấp nhận lời mời kết bạn' :
                       quest.Code === 'ATTEND_EVENT' ? 'Tham gia sự kiện' :
                       'No description available',
          points: typeof quest.Reward === 'number' ? quest.Reward : 
                  typeof quest.Points === 'number' ? quest.Points : 
                  typeof quest.points === 'number' ? quest.points : 0,
          isCompleted: quest.Done === true || quest.IsCompleted === true || quest.isCompleted === true,
          completedAt: quest.Done ? new Date().toISOString() : undefined,
          type: 'daily' as const,
          icon: quest.Code === 'CHECK_IN_DAILY' ? '📅' :
                quest.Code === 'JOIN_ANY_ROOM' ? '🚪' :
                quest.Code === 'INVITE_ACCEPTED' ? '👥' :
                quest.Code === 'ATTEND_EVENT' ? '🎪' :
                '📋'
        })),
        todayEvents: (apiData.EventsToday || apiData.eventsToday || []).map((event: any) => ({
          id: typeof event.Id === 'string' ? event.Id : 
              typeof event.id === 'string' ? event.id : '',
          title: typeof event.Title === 'string' ? event.Title : 
                 typeof event.title === 'string' ? event.title : 'Untitled Event',
          description: typeof event.Location === 'string' ? event.Location : 
                       typeof event.location === 'string' ? event.location : 'No location',
          startTime: typeof event.StartsAt === 'string' ? event.StartsAt : 
                     typeof event.startsAt === 'string' ? event.startsAt : '',
          endTime: typeof event.EndsAt === 'string' ? event.EndsAt : 
                   typeof event.endsAt === 'string' ? event.endsAt : '',
          isRegistered: false, // Default to false since API doesn't provide this
          maxParticipants: 50, // Default value since API doesn't provide this
          currentParticipants: 0, // Default value since API doesn't provide this
          type: typeof event.Mode === 'string' ? event.Mode.toLowerCase() : 
                typeof event.mode === 'string' ? event.mode.toLowerCase() : 'meetup',
          icon: typeof event.Mode === 'string' ? 
                (event.Mode.toLowerCase() === 'online' ? '💻' : '🏢') : '📅'
        })),
        recentActivity: (apiData.RecentActivity || apiData.recentActivity || []).map((activity: any) => ({
          type: typeof activity.Type === 'string' ? activity.Type : 
                typeof activity.type === 'string' ? activity.type : 'quest_completed',
          message: typeof activity.Message === 'string' ? activity.Message : 
                   typeof activity.message === 'string' ? activity.message : 'No message',
          timestamp: typeof activity.Timestamp === 'string' ? activity.Timestamp : 
                     typeof activity.timestamp === 'string' ? activity.timestamp : new Date().toISOString(),
          icon: typeof activity.Icon === 'string' ? activity.Icon : 
                typeof activity.icon === 'string' ? activity.icon : '📋'
        }))
      };
      
      console.log('✅ Transformed dashboard data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      
      // Return mock data if API fails
      return this.getMockDashboardData();
    }
  }

  // Complete a quest
  static async completeQuest(questId: string): Promise<{ success: boolean; pointsEarned: number }> {
    try {
      console.log(`🔄 Completing quest ${questId}...`);
      const response = await axiosInstance.post(`/api/quests/${questId}/complete`);
      console.log('✅ Quest completed:', response.data);
      
      return {
        success: true,
        pointsEarned: response.data.pointsEarned || 5
      };
    } catch (error) {
      console.error(`❌ Error completing quest ${questId}:`, error);
      throw new Error('Không thể hoàn thành nhiệm vụ');
    }
  }

  // Register for an event
  static async registerEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 Registering for event ${eventId}...`);
      const response = await axiosInstance.post(`/api/events/${eventId}/register`);
      console.log('✅ Event registered:', response.data);
      
      return {
        success: true,
        message: 'Đăng ký sự kiện thành công!'
      };
    } catch (error) {
      console.error(`❌ Error registering for event ${eventId}:`, error);
      throw new Error('Không thể đăng ký sự kiện');
    }
  }

  // Get mock data for development
  static getMockDashboardData(): DashboardResponse {
    return {
      stats: {
        totalPoints: 1250,
        level: 8,
        pointsToNextLevel: 250,
        questsCompletedToday: 2,
        totalQuestsToday: 4,
        friendsOnline: 12,
        totalFriends: 45,
        eventsToday: 3,
        roomsJoined: 5,
        lastActivity: new Date().toISOString()
      },
      todayQuests: [
        {
          id: '1',
          title: 'Daily Check-in',
          description: 'Đăng nhập vào hệ thống',
          points: 5,
          isCompleted: true,
          completedAt: new Date().toISOString(),
          type: 'daily',
          icon: '✅'
        },
        {
          id: '2',
          title: 'Join a Room',
          description: 'Tham gia vào một room chat',
          points: 10,
          isCompleted: false,
          type: 'daily',
          icon: '💬'
        },
        {
          id: '3',
          title: 'Attend Event',
          description: 'Tham gia một sự kiện hôm nay',
          points: 20,
          isCompleted: false,
          type: 'daily',
          icon: '🎉'
        },
        {
          id: '4',
          title: 'Make a Friend',
          description: 'Kết bạn với một người mới',
          points: 15,
          isCompleted: false,
          type: 'daily',
          icon: '👥'
        }
      ],
      todayEvents: [
        {
          id: '1',
          title: 'Valorant Tournament',
          description: 'Giải đấu Valorant hàng tuần',
          startTime: '19:00',
          endTime: '22:00',
          isRegistered: true,
          maxParticipants: 16,
          currentParticipants: 12,
          type: 'tournament',
          icon: '🏆'
        },
        {
          id: '2',
          title: 'Gaming Meetup',
          description: 'Gặp gỡ và chia sẻ kinh nghiệm',
          startTime: '20:00',
          endTime: '21:30',
          isRegistered: false,
          maxParticipants: 50,
          currentParticipants: 25,
          type: 'meetup',
          icon: '🎮'
        },
        {
          id: '3',
          title: 'Code Workshop',
          description: 'Workshop lập trình game',
          startTime: '14:00',
          endTime: '16:00',
          isRegistered: false,
          maxParticipants: 30,
          currentParticipants: 18,
          type: 'workshop',
          icon: '💻'
        }
      ],
      recentActivity: [
        {
          type: 'quest_completed',
          message: 'Hoàn thành nhiệm vụ Daily Check-in',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          icon: '✅'
        },
        {
          type: 'friend_online',
          message: 'Nguyễn Văn A đã online',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          icon: '🟢'
        },
        {
          type: 'room_joined',
          message: 'Tham gia room Valorant Team',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          icon: '💬'
        }
      ]
    };
  }
}

export default DashboardService;
