import React, { createContext, useContext, useState, useEffect } from "react";
import userService from "../services/userService";

// JWT decode function
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    const storedToken = localStorage.getItem("token");
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const testUser = localStorage.getItem("user");
    
    // Check for test user first (for testing)
    if (isAuthenticated === "true" && testUser) {
      try {
        const userData = JSON.parse(testUser);
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      } catch (error) {
        console.error("Error parsing test user:", error);
      }
    }
    
    // If we have a token but no test user, decode JWT to get user info
    if (storedToken && !testUser) {
      console.log('🔄 No test user found, decoding JWT token for user info');
      const decodedToken = decodeJWT(storedToken);
      
      if (decodedToken) {
        console.log('🔍 Decoded JWT payload:', decodedToken);
        
        // Extract user info from JWT claims
        const userFromToken = {
          id: decodedToken.sub || decodedToken.userId || 'unknown',
          email: decodedToken.email || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'unknown@example.com',
          userName: decodedToken.userName || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
          fullName: decodedToken.fullName || decodedToken.name || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
          university: decodedToken.university || decodedToken.organization || 'Student',
          level: decodedToken.level || decodedToken.rank || 1,
          role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User'
        };
        
        console.log('👤 User info from JWT:', userFromToken);
        setUser(userFromToken);
        setToken(storedToken);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      } else {
        console.error('❌ Failed to decode JWT token');
      }
    }
    
    // Check for real token
    if (!storedToken) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Checking auth with token:', storedToken?.substring(0, 20) + '...');
      const userData = await userService.getProfile();
      console.log('✅ User profile loaded:', userData);
      setUser(userData);
      setToken(storedToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: error instanceof Error && 'response' in error ? (error as any).response?.status : 'No status',
        data: error instanceof Error && 'response' in error ? (error as any).response?.data : 'No data'
      });
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string, refreshToken?: string) => {
    localStorage.setItem("token", token);
    setToken(token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    setIsAuthenticated(true);
    
    // Decode JWT immediately for faster user info display
    const decodedToken = decodeJWT(token);
    if (decodedToken) {
      console.log('🔍 Login - Decoded JWT payload:', decodedToken);
      
      const userFromToken = {
        id: decodedToken.sub || decodedToken.userId || 'unknown',
        email: decodedToken.email || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'unknown@example.com',
        userName: decodedToken.userName || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
        fullName: decodedToken.fullName || decodedToken.name || decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'User',
        university: decodedToken.university || decodedToken.organization || 'Student',
        level: decodedToken.level || decodedToken.rank || 1,
        role: decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User'
      };
      
      console.log('👤 Login - User info from JWT:', userFromToken);
      setUser(userFromToken);
    }
    
    checkAuth();
  };

  const logout = async () => {
    try {
      await userService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, loading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
