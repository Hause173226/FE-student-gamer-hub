// Mock API service - replace with real API calls
import { User, Community, Event, GameStats, Achievement, Match, Message } from '../types';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockUser: User = {
  id: '1',
  name: 'Minh Nguyễn',
  email: 'minhnguyen@fpt.edu.vn',
  avatar: 'MN',
  university: 'FPT University',
  level: 12,
  xp: 2450,
  role: 'member',
  status: 'online'
};

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    await delay(500);
    return mockUser;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await delay(1000);
    return { ...mockUser, ...data };
  },

  uploadAvatar: async (file: File): Promise<string> => {
    await delay(2000);
    return 'https://example.com/avatar.jpg';
  }
};

export const communityService = {
  getMyCommunities: async (): Promise<Community[]> => {
    await delay(500);
    return [
      {
        id: '1',
        name: 'FPT University - League of Legends',
        members: 1247,
        university: 'FPT University',
        verified: true,
        role: 'Admin',
        lastActivity: '5 phút trước',
        avatar: 'FPT',
        color: 'from-blue-500 to-indigo-600',
        unreadMessages: 12
      }
    ];
  },

  getPopularCommunities: async (): Promise<Community[]> => {
    await delay(500);
    return [];
  },

  joinCommunity: async (communityId: string): Promise<void> => {
    await delay(1000);
  },

  leaveCommunity: async (communityId: string): Promise<void> => {
    await delay(1000);
  }
};

export const eventService = {
  getUpcomingEvents: async (): Promise<Event[]> => {
    await delay(500);
    return [];
  },

  getMyEvents: async (): Promise<Event[]> => {
    await delay(500);
    return [];
  },

  registerForEvent: async (eventId: string): Promise<void> => {
    await delay(1000);
  },

  unregisterFromEvent: async (eventId: string): Promise<void> => {
    await delay(1000);
  }
};

export const gameService = {
  getGameStats: async (): Promise<GameStats[]> => {
    await delay(500);
    return [
      {
        game: 'League of Legends',
        rank: 'Gold II',
        winRate: '68%',
        matches: 156,
        hours: 234,
        icon: '🏆'
      }
    ];
  },

  getMatchHistory: async (): Promise<Match[]> => {
    await delay(500);
    return [];
  }
};

export const achievementService = {
  getAchievements: async (): Promise<Achievement[]> => {
    await delay(500);
    return [];
  }
};

export const chatService = {
  getMessages: async (roomId: string): Promise<Message[]> => {
    await delay(500);
    return [];
  },

  sendMessage: async (roomId: string, content: string): Promise<Message> => {
    await delay(500);
    return {
      id: Date.now(),
      user: {
        name: mockUser.name,
        avatar: mockUser.avatar,
        role: mockUser.role
      },
      content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      reactions: []
    };
  }
};