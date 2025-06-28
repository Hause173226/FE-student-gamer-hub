import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  User,
  Trophy,
  Star,
  Settings,
  LogOut,
  Crown,
  Shield,
  Gamepad2,
  Target,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Flame
} from 'lucide-react';

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Trang chủ', icon: Home },
  { id: 'communities', label: 'Cộng đồng', icon: Users },
  { id: 'rooms', label: 'Phòng chat', icon: MessageSquare },
  { id: 'events', label: 'Sự kiện', icon: Calendar },
  { id: 'profile', label: 'Hồ sơ', icon: User },
];

export const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Trang chủ', icon: Home },
  { id: 'communities', label: 'Cộng đồng', icon: Users },
  { id: 'rooms', label: 'Chat', icon: MessageSquare },
  { id: 'events', label: 'Sự kiện', icon: Calendar },
  { id: 'profile', label: 'Hồ sơ', icon: User },
];

export const COLORS = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  emerald: {
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
  },
  purple: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  yellow: {
    400: '#fbbf24',
    500: '#f59e0b',
  },
  red: {
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  gray: {
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

export const GRADIENTS = {
  primary: 'from-indigo-500 to-purple-600',
  emerald: 'from-emerald-500 to-teal-600',
  purple: 'from-purple-500 to-indigo-600',
  yellow: 'from-yellow-400 to-orange-500',
  red: 'from-red-500 to-rose-600',
  blue: 'from-blue-500 to-indigo-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-500 to-pink-600',
};

export const ROLE_ICONS = {
  admin: { icon: Crown, color: 'text-yellow-400' },
  moderator: { icon: Shield, color: 'text-blue-400' },
  member: { icon: null, color: 'text-white' },
};

export const ROLE_COLORS = {
  admin: 'text-yellow-400',
  moderator: 'text-blue-400',
  member: 'text-white',
};

export const STATUS_COLORS = {
  'Đang đăng ký': 'bg-emerald-500/20 text-emerald-400',
  'Còn chỗ': 'bg-blue-500/20 text-blue-400',
  'Đầy': 'bg-red-500/20 text-red-400',
  'Đã kết thúc': 'bg-gray-500/20 text-gray-400',
};

export const UNIVERSITIES = [
  'FPT University',
  'HCMUT',
  'UEH',
  'NEU',
  'HUST',
  'VNU',
  'UIT',
  'PTIT',
];

export const GAMES = [
  { name: 'League of Legends', icon: '🏆', color: GRADIENTS.blue },
  { name: 'Valorant', icon: '🎯', color: GRADIENTS.red },
  { name: 'Dota 2', icon: '⚔️', color: GRADIENTS.purple },
  { name: 'Mobile Legends', icon: '📱', color: GRADIENTS.amber },
  { name: 'CS:GO', icon: '🔫', color: GRADIENTS.emerald },
];

export const ACHIEVEMENT_ICONS = {
  'First Blood': Trophy,
  'Team Player': Users,
  'Rank Climber': TrendingUp,
  'Community Leader': Crown,
  'Tournament Winner': Award,
  'Streamer': Zap,
};

export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  MATCH_WIN: 25,
  MATCH_LOSS: 10,
  COMMUNITY_JOIN: 50,
  EVENT_PARTICIPATE: 100,
  ACHIEVEMENT_UNLOCK: 200,
  LEVEL_UP: 500,
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950
];