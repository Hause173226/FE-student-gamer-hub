// API Configuration - Centralized URL management
export const API_CONFIG = {
  // Main API URLs
  STUDENT_GAMER_HUB_URL: 'https://localhost:7227',
  PLATFORM_GAME_URL: 'http://localhost:8080',
  
  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/Auth/login',
      REGISTER: '/api/Auth/user-register',
      GOOGLE_LOGIN: '/api/GoogleAuth/login',
      PROFILE: '/api/Auth/me',
      LOGOUT: '/api/Auth/revoke',
      REFRESH: '/api/Auth/refresh'
    },
    
    // Community endpoints
    COMMUNITIES: {
      BASE: '/api/Communities',
      BY_ID: (id: string) => `/api/Communities/${id}`,
      JOIN: (id: string) => `/api/Communities/${id}/join`,
      LEAVE: (id: string) => `/api/Communities/${id}/leave`
    },
    
    // Club endpoints
    CLUBS: {
      BASE: '/api/clubs',
      BY_ID: (id: string) => `/api/clubs/${id}`,
      BY_COMMUNITY: (communityId: string) => `/api/communities/${communityId}/clubs`,
      PUBLIC: '/api/clubs/public',
      PRIVATE: '/api/clubs/private',
      JOIN: (id: string) => `/api/Clubs/${id}/join`,
      LEAVE: (id: string) => `/api/Clubs/${id}/leave`
    },
    
    // Room endpoints
    ROOMS: {
      BASE: '/api/Rooms',
      BY_ID: (id: string) => `/api/Rooms/${id}`,
      BY_CLUB: (clubId: string) => `/api/clubs/${clubId}/rooms`,
      JOIN: (id: string) => `/api/Rooms/${id}/join`,
      LEAVE: (id: string) => `/api/Rooms/${id}/leave`,
      MEMBERS: (id: string) => `/api/Rooms/${id}/members`
    },
    
    // User endpoints
    USERS: {
      BASE: '/api/Users',
      BY_ID: (id: string) => `/api/Users/${id}`,
      PROFILE: '/api/Users/profile'
    },
    
    // Membership endpoints
    MEMBERSHIPS: {
      TREE: '/api/Memberships/tree'
    }
  }
};

// Helper function to get full URL
export const getApiUrl = (baseUrl: string, endpoint: string): string => {
  return `${baseUrl}${endpoint}`;
};

// Helper function to get StudentGamerHub URL
export const getStudentGamerHubUrl = (endpoint: string): string => {
  return getApiUrl(API_CONFIG.STUDENT_GAMER_HUB_URL, endpoint);
};

// Helper function to get PlatformGame URL
export const getPlatformGameUrl = (endpoint: string): string => {
  return getApiUrl(API_CONFIG.PLATFORM_GAME_URL, endpoint);
};

export default API_CONFIG;
