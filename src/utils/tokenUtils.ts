/**
 * JWT Token Utilities
 * Helper functions to decode JWT token and extract user information
 */

export interface DecodedToken {
  sub?: string; // Subject (user ID)
  userId?: string;
  email?: string;
  name?: string;
  exp?: number; // Expiration time
  iat?: number; // Issued at
  [key: string]: any;
}

/**
 * Decode JWT token without verification (client-side only)
 * NOTE: This does NOT verify the token signature. Only use for reading claims.
 */
export function decodeJwtToken(token: string): DecodedToken | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("Invalid JWT token format");
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Base64 URL decode
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

/**
 * Get user ID from JWT token
 * Tries multiple common claim names
 */
export function getUserIdFromToken(token?: string | null): string | null {
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (!token) {
    console.warn("No token found");
    return null;
  }

  const decoded = decodeJwtToken(token);
  if (!decoded) {
    return null;
  }

  // Try common claim names for user ID
  const userId =
    decoded.sub ||
    decoded.userId ||
    decoded.user_id ||
    decoded.id ||
    decoded.nameid || // ASP.NET Core uses this
    decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ]; // Full claim name

  if (userId) {
    console.log("✅ User ID from token:", userId);
    return userId as string;
  }

  console.error("No user ID found in token. Token payload:", decoded);
  return null;
}

/**
 * Get user email from JWT token
 */
export function getUserEmailFromToken(token?: string | null): string | null {
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (!token) {
    return null;
  }

  const decoded = decodeJwtToken(token);
  if (!decoded) {
    return null;
  }

  return (
    decoded.email ||
    decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] ||
    null
  );
}

/**
 * Get user name from JWT token
 */
export function getUserNameFromToken(token?: string | null): string | null {
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (!token) {
    return null;
  }

  const decoded = decodeJwtToken(token);
  if (!decoded) {
    return null;
  }

  return (
    decoded.name ||
    decoded.username ||
    decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
    null
  );
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token?: string | null): boolean {
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (!token) {
    return true;
  }

  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
}

/**
 * Get all user info from token
 */
export function getUserInfoFromToken(token?: string | null): {
  userId: string | null;
  email: string | null;
  name: string | null;
  isExpired: boolean;
} {
  return {
    userId: getUserIdFromToken(token),
    email: getUserEmailFromToken(token),
    name: getUserNameFromToken(token),
    isExpired: isTokenExpired(token),
  };
}

/**
 * Hook-style: Get current user ID from token
 * Use this in React components
 */
export function useCurrentUserId(): string | null {
  const token = localStorage.getItem("token");
  return getUserIdFromToken(token);
}

/**
 * Debug: Print all token claims to console
 */
export function debugToken(token?: string | null): void {
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (!token) {
    console.log("No token found");
    return;
  }

  console.log("=== JWT Token Debug ===");
  console.log("Raw token:", token.substring(0, 50) + "...");

  const decoded = decodeJwtToken(token);
  if (decoded) {
    console.log("Decoded payload:", decoded);
    console.log("User ID:", getUserIdFromToken(token));
    console.log("Email:", getUserEmailFromToken(token));
    console.log("Name:", getUserNameFromToken(token));
    console.log("Expired:", isTokenExpired(token));

    if (decoded.exp) {
      const expDate = new Date(decoded.exp * 1000);
      console.log("Expires at:", expDate.toLocaleString());
    }
  }
  console.log("======================");
}
