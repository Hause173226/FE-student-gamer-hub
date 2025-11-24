import React, { createContext, useContext, useState, useEffect } from "react";
import userService from "../services/userService";

// JWT decode function
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Check if JWT token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return true;

    // If token doesn't have exp field, consider it valid (some tokens don't expire)
    if (!decoded.exp) {
      console.warn("⚠️ Token has no expiration field, assuming valid");
      return false;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Consider token expired if less than 5 minutes remaining (buffer time)
    return currentTime >= expirationTime - 5 * 60 * 1000;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

// Extract user info from JWT token
const extractUserFromToken = (decodedToken: any) => {
  return {
    id: decodedToken.sub || decodedToken.userId || "unknown",
    email:
      decodedToken.email ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] ||
      "unknown@example.com",
    userName:
      decodedToken.userName ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
      "User",
    fullName:
      decodedToken.fullName ||
      decodedToken.name ||
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] ||
      "User",
    university:
      decodedToken.university || decodedToken.organization || "Student",
    level: decodedToken.level || decodedToken.rank || 1,
    role:
      decodedToken.role ||
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      "User",
  };
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

    // No token found - user not authenticated
    if (!storedToken) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    // Try to decode JWT token first (fast, no API call)
    const decodedToken = decodeJWT(storedToken);

    if (decodedToken) {
      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        console.warn("⚠️ Token expired, attempting to refresh...");
        // Token expired, try to refresh or clear
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isAuthenticated");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      // Token is valid, extract user info from JWT (no API call needed)
      const userFromToken = extractUserFromToken(decodedToken);

      setUser(userFromToken);
      setToken(storedToken);
      setIsAuthenticated(true);
      setLoading(false);

      // Optionally fetch fresh profile data in background (non-blocking)
      // This ensures we have the latest data but doesn't block the UI
      userService
        .getProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch((error) => {
          console.warn(
            "⚠️ Failed to fetch fresh profile (using JWT data):",
            error
          );
          // Keep using JWT data, don't clear auth state
        });

      return;
    }

    // Token exists but can't be decoded - might be invalid format
    // Try API call as last resort
    try {
      const userData = await userService.getProfile();
      setUser(userData);
      setToken(storedToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("❌ Auth check failed:", error);
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
    // Store tokens immediately
    localStorage.setItem("token", token);
    setToken(token);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // Decode JWT immediately for instant user info display (no API call)
    const decodedToken = decodeJWT(token);
    if (decodedToken) {
      const userFromToken = extractUserFromToken(decodedToken);

      // Set user and authenticated state immediately (no expiration check on fresh login)
      setUser(userFromToken);
      setIsAuthenticated(true);
      setLoading(false); // Ensure loading is false after login

      // Fetch fresh profile data in background (non-blocking)
      // This ensures we have complete user data but doesn't delay login
      userService
        .getProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch((error) => {
          console.warn(
            "⚠️ Failed to fetch fresh profile (using JWT data):",
            error
          );
          // Keep using JWT data, user is still authenticated
        });
    } else {
      // Fallback: if JWT decode fails, still authenticate user (token is valid from server)
      // and try to fetch profile from API
      console.warn(
        "⚠️ Failed to decode JWT, but token is valid - fetching profile from API"
      );
      setIsAuthenticated(true);
      setLoading(false);

      // Try to get user profile from API
      userService
        .getProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch((error) => {
          console.error("❌ Failed to load user profile from API:", error);
          // Still keep user authenticated since token is valid
          // User info will be fetched later or can use minimal info
          console.warn(
            "⚠️ Keeping user authenticated with token, profile will be fetched later"
          );
        });
    }

    // Don't call checkAuth() - we've already handled everything above
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
      value={{
        isAuthenticated,
        user,
        token,
        loading,
        login,
        logout,
        checkAuth,
      }}
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
