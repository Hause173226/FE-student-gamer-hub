import { authAxiosInstance } from './axiosInstance';
import { API_CONFIG } from '../config/apiConfig';

// ============================================
// QUEST TYPES & INTERFACES
// ============================================

export interface QuestItem {
  Code: string;
  Title: string;
  Reward: number;
  Done: boolean;
}

export interface QuestTodayResponse {
  Points: number;
  Quests: QuestItem[];
}

export interface QuestCompletionResponse {
  success: boolean;
  message: string;
}

// ============================================
// QUEST SERVICE
// ============================================

export class QuestService {
  // Get today's quests and current points
  static async getTodayQuests(): Promise<QuestTodayResponse> {
    try {
      console.log('🔄 Fetching today\'s quests...');
      const response = await authAxiosInstance.get<QuestTodayResponse>(API_CONFIG.ENDPOINTS.QUESTS.TODAY);
      console.log('✅ Today\'s quests fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching today\'s quests:', error);
      throw new Error('Không thể tải danh sách quests');
    }
  }

  // Complete check-in quest (+5 points)
  static async completeCheckIn(): Promise<QuestCompletionResponse> {
    try {
      console.log('🔄 Completing check-in quest...');
      const response = await authAxiosInstance.post(API_CONFIG.ENDPOINTS.QUESTS.CHECK_IN);
      console.log('✅ Check-in quest completed:', response.status);
      return {
        success: true,
        message: 'Check-in thành công! +5 điểm'
      };
    } catch (error: any) {
      console.error('❌ Error completing check-in quest:', error);
      
      // Handle idempotent error (already completed today)
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Bạn đã check-in hôm nay rồi!'
        };
      }
      
      throw new Error('Không thể hoàn thành quest check-in');
    }
  }

  // Mark join room quest (+5 points)
  static async markJoinRoom(roomId: string): Promise<QuestCompletionResponse> {
    try {
      console.log(`🔄 Marking join room quest for room ${roomId}...`);
      const response = await authAxiosInstance.post(API_CONFIG.ENDPOINTS.QUESTS.JOIN_ROOM(roomId));
      console.log('✅ Join room quest completed:', response.status);
      return {
        success: true,
        message: 'Quest tham gia phòng hoàn thành! +5 điểm'
      };
    } catch (error: any) {
      console.error(`❌ Error completing join room quest for room ${roomId}:`, error);
      
      // Handle idempotent error (already completed today)
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Bạn đã hoàn thành quest tham gia phòng hôm nay!'
        };
      }
      
      throw new Error('Không thể hoàn thành quest tham gia phòng');
    }
  }

  // Mark attend event quest (+20 points)
  static async markAttendEvent(eventId: string): Promise<QuestCompletionResponse> {
    try {
      console.log(`🔄 Marking attend event quest for event ${eventId}...`);
      const response = await authAxiosInstance.post(API_CONFIG.ENDPOINTS.QUESTS.ATTEND_EVENT(eventId));
      console.log('✅ Attend event quest completed:', response.status);
      return {
        success: true,
        message: 'Quest tham gia sự kiện hoàn thành! +20 điểm'
      };
    } catch (error: any) {
      console.error(`❌ Error completing attend event quest for event ${eventId}:`, error);
      
      // Handle idempotent error (already completed today)
      if (error.response?.status === 400) {
        return {
          success: false,
          message: 'Bạn đã hoàn thành quest tham gia sự kiện hôm nay!'
        };
      }
      
      throw new Error('Không thể hoàn thành quest tham gia sự kiện');
    }
  }

  // Get quest icon based on quest code
  static getQuestIcon(code: string): string {
    switch (code) {
      case 'CHECK_IN_DAILY':
        return '📅';
      case 'JOIN_ANY_ROOM':
        return '💬';
      case 'INVITE_ACCEPTED':
        return '👥';
      case 'ATTEND_EVENT':
        return '🎉';
      default:
        return '🎯';
    }
  }

  // Get quest color based on quest code
  static getQuestColor(code: string): string {
    switch (code) {
      case 'CHECK_IN_DAILY':
        return 'from-blue-500 to-cyan-600';
      case 'JOIN_ANY_ROOM':
        return 'from-green-500 to-emerald-600';
      case 'INVITE_ACCEPTED':
        return 'from-purple-500 to-pink-600';
      case 'ATTEND_EVENT':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  }

  // Get quest description based on quest code
  static getQuestDescription(code: string): string {
    switch (code) {
      case 'CHECK_IN_DAILY':
        return 'Đăng nhập và check-in hàng ngày để nhận điểm thưởng';
      case 'JOIN_ANY_ROOM':
        return 'Tham gia bất kỳ phòng chat nào để kết nối với cộng đồng';
      case 'INVITE_ACCEPTED':
        return 'Có người chấp nhận lời mời kết bạn của bạn';
      case 'ATTEND_EVENT':
        return 'Tham gia và điểm danh tại các sự kiện của cộng đồng';
      default:
        return 'Hoàn thành nhiệm vụ để nhận điểm thưởng';
    }
  }

  // Get quest type based on quest code
  static getQuestType(code: string): string {
    switch (code) {
      case 'CHECK_IN_DAILY':
        return 'Daily';
      case 'JOIN_ANY_ROOM':
        return 'Social';
      case 'INVITE_ACCEPTED':
        return 'Social';
      case 'ATTEND_EVENT':
        return 'Event';
      default:
        return 'General';
    }
  }
}

export default QuestService;

