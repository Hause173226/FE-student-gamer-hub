import { toast } from "react-hot-toast";

// Flag to prevent multiple notifications
let isHandlingExpiration = false;

// Function to handle token expiration globally
export const handleTokenExpiration = () => {
  // Prevent multiple calls from showing multiple notifications
  if (isHandlingExpiration) return;
  isHandlingExpiration = true;

  // Clear tokens and user data
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('profile');
  
  // Show notification
  const toastId = toast.error('Phiên đăng nhập của bạn đã hết hạn sau 1 giờ không hoạt động. Vui lòng đăng nhập lại.', {
    duration: 4000,
    style: {
      background: '#ef4444',
      color: 'white',
    },
  });
  
  // Redirect to login page after a short delay
  setTimeout(() => {
    // Dismiss the toast before redirecting
    toast.dismiss(toastId);
    // Reset the flag
    isHandlingExpiration = false;
    // Use window.location.href to ensure full page reload and context reset
    window.location.href = '/login';
  }, 2000); // Increased to 2 seconds to ensure users can read the message
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  return !!(token && refreshToken);
};

// Function to get current user data from localStorage
export const getCurrentUser = () => {
  const profileData = localStorage.getItem('profile');
  return profileData ? JSON.parse(profileData) : null;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 số');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*(),.?":{}|<>)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
