// /lib/rate-limit.js
export class RateLimiter {
  constructor(redisClient = null) {
    this.redis = redisClient;
    this.localStore = new Map();
  }

  async check(key, limit, windowMs) {
    if (this.redis) {
      return await this.checkRedis(key, limit, windowMs);
    }
    return this.checkLocal(key, limit, windowMs);
  }

  checkLocal(key, limit, windowMs) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.localStore.has(key)) {
      this.localStore.set(key, []);
    }
    
    const requests = this.localStore.get(key).filter(time => time > windowStart);
    this.localStore.set(key, requests);
    
    if (requests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(requests[0] + windowMs)
      };
    }
    
    requests.push(now);
    return {
      allowed: true,
      remaining: limit - requests.length,
      resetTime: new Date(now + windowMs)
    };
  }

  async checkRedis(key, limit, windowMs) {
    const now = Date.now();
    const pipeline = this.redis.pipeline();
    
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    pipeline.zadd(key, now, now);
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));
    
    const results = await pipeline.exec();
    const requestCount = results[2][1];
    
    if (requestCount > limit) {
      const oldest = await this.redis.zrange(key, 0, 0);
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(parseInt(oldest[0]) + windowMs)
      };
    }
    
    return {
      allowed: true,
      remaining: limit - requestCount,
      resetTime: new Date(now + windowMs)
    };
  }
}

// Create and export a default instance for auth rate limiting
export const authRateLimiter = new RateLimiter();

// Or export a more general rateLimit instance
export const rateLimit = new RateLimiter();