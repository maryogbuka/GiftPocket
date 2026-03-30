// lib/rate-limit.js - FIXED VERSION
import { LRUCache } from 'lru-cache';

class RateLimiter {
  constructor() {
    this.cache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 60 // 1 hour
    });
  }

  async check(key, maxRequests, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests
    const requests = this.cache.get(key) || [];
    
    // Filter out old requests
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.max(...recentRequests) + windowMs
      };
    }
    
    // Add new request
    recentRequests.push(now);
    this.cache.set(key, recentRequests);
    
    return {
      allowed: true,
      remaining: maxRequests - recentRequests.length,
      resetTime: now + windowMs
    };
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Simple function to use
export async function rateLimit(identifier, maxRequests = 5, window = '10m') {
  // Parse window time
  const windowMs = parseTime(window);
  const key = `rate-limit:${identifier}`;
  
  return await rateLimiter.check(key, maxRequests, windowMs);
}

function parseTime(timeStr) {
  const num = parseInt(timeStr);
  
  if (timeStr.includes('s')) return num * 1000; // seconds
  if (timeStr.includes('m')) return num * 60 * 1000; // minutes
  if (timeStr.includes('h')) return num * 60 * 60 * 1000; // hours
  if (timeStr.includes('d')) return num * 24 * 60 * 60 * 1000; // days
  
  return 10 * 60 * 1000; // Default 10 minutes
}

// Alternative: simple in-memory rate limiter without classes
export function simpleRateLimit(ip, maxRequests = 3, windowMinutes = 10) {
  const cacheKey = `ratelimit:register:${ip}`;
  const windowMs = windowMinutes * 60 * 1000;
  
  // Get existing requests from global cache
  global.rateLimitCache = global.rateLimitCache || {};
  const now = Date.now();
  
  if (!global.rateLimitCache[cacheKey]) {
    global.rateLimitCache[cacheKey] = [];
  }
  
  // Clean old requests
  global.rateLimitCache[cacheKey] = global.rateLimitCache[cacheKey].filter(
    timestamp => now - timestamp < windowMs
  );
  
  // Check if limited
  if (global.rateLimitCache[cacheKey].length >= maxRequests) {
    return {
      isLimited: true,
      remaining: 0,
      resetIn: Math.ceil((global.rateLimitCache[cacheKey][0] + windowMs - now) / 1000 / 60)
    };
  }
  
  // Add new request
  global.rateLimitCache[cacheKey].push(now);
  
  return {
    isLimited: false,
    remaining: maxRequests - global.rateLimitCache[cacheKey].length,
    resetIn: windowMinutes
  };
}