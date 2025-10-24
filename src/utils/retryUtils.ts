// Retry utility for handling rate limiting and temporary failures
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on 4xx errors except 429
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Rate limiter to prevent too many requests
export class RateLimiter {
  private lastRequestTime: number = 0;
  private minInterval: number;
  
  constructor(minIntervalMs: number = 1000) {
    this.minInterval = minIntervalMs;
  }
  
  canMakeRequest(): boolean {
    const now = Date.now();
    return (now - this.lastRequestTime) >= this.minInterval;
  }
  
  getTimeUntilNextRequest(): number {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    return Math.max(0, this.minInterval - timeSinceLastRequest);
  }
  
  recordRequest(): void {
    this.lastRequestTime = Date.now();
  }
}
