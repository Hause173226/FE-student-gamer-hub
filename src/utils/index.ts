import { LEVEL_THRESHOLDS } from '../constants';

export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

export const formatTime = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} phút`;
  }
  return `${Math.round(hours)}h`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString: string, timeString: string): string => {
  return `${formatDate(dateString)} lúc ${timeString}`;
};

export const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} tuần trước`;
};

export const calculateLevel = (xp: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
};

export const getXpForNextLevel = (currentXp: number): { current: number; required: number; percentage: number } => {
  const currentLevel = calculateLevel(currentXp);
  const currentLevelXp = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const progressXp = currentXp - currentLevelXp;
  const requiredXp = nextLevelXp - currentLevelXp;
  const percentage = Math.round((progressXp / requiredXp) * 100);
  
  return {
    current: progressXp,
    required: requiredXp,
    percentage: Math.min(percentage, 100)
  };
};

export const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin': return '👑';
    case 'moderator': return '🛡️';
    default: return '';
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin': return 'text-yellow-400';
    case 'moderator': return 'text-blue-400';
    default: return 'text-white';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Đang đăng ký': return 'bg-emerald-500/20 text-emerald-400';
    case 'Còn chỗ': return 'bg-blue-500/20 text-blue-400';
    case 'Đầy': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export const generateAvatar = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUniversityEmail = (email: string): boolean => {
  const universityDomains = [
    'fpt.edu.vn',
    'hcmut.edu.vn',
    'ueh.edu.vn',
    'neu.edu.vn',
    'hust.edu.vn',
    'vnu.edu.vn'
  ];
  
  return universityDomains.some(domain => email.endsWith(`@${domain}`));
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};