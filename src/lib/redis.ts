import { Redis } from '@upstash/redis';

// Lazy Redis client initialization
let redis: Redis | null = null;

const getRedisClient = (): Redis | null => {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!url || !token) {
      console.warn('⚠️ Redis: Environment variables not set, Redis caching disabled');
      return null;
    }
    
    try {
      redis = new Redis({
        url,
        token,
      });
      console.log('✅ Redis: Client initialized successfully');
    } catch (error) {
      console.error('❌ Redis: Failed to initialize client:', error);
      return null;
    }
  }
  
  return redis;
};

// Cache configuration
export const CACHE_CONFIG = {
  TTL: 5 * 60, // 5 minutes in seconds
  TEMPLATE_PREFIX: 'template:',
  SELECTION_PREFIX: 'selection:',
  USER_PREFIX: 'user:',
} as const;

// Helper functions for cache operations
export class RedisCache {
  private getRedis(): Redis | null {
    return getRedisClient();
  }

  // Generate cache key
  private getKey(prefix: string, ...parts: string[]): string {
    return `${prefix}${parts.join(':')}`;
  }

  // Get template cache key
  getTemplateKey(userId: string, slug: string): string {
    return this.getKey(CACHE_CONFIG.TEMPLATE_PREFIX, CACHE_CONFIG.USER_PREFIX + userId, slug);
  }

  // Get selection cache key
  getSelectionKey(userId: string): string {
    return this.getKey(CACHE_CONFIG.SELECTION_PREFIX, CACHE_CONFIG.USER_PREFIX + userId);
  }

  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    const redisClient = this.getRedis();
    if (!redisClient) {
      console.log('⚠️ Redis: Client not available, skipping cache get');
      return null;
    }
    
    try {
      const data = await redisClient.get<T>(key);
      if (data) {
        console.log('✅ Redis: Cache hit for:', key);
      }
      return data;
    } catch (error) {
      console.error('❌ Redis: Error getting cache:', error);
      return null;
    }
  }

  // Set cached data with TTL
  async set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.TTL): Promise<void> {
    const redisClient = this.getRedis();
    if (!redisClient) {
      console.log('⚠️ Redis: Client not available, skipping cache set');
      return;
    }
    
    try {
      await redisClient.setex(key, ttl, data);
      console.log('✅ Redis: Cache set for:', key, `(TTL: ${ttl}s)`);
    } catch (error) {
      console.error('❌ Redis: Error setting cache:', error);
    }
  }

  // Delete cached data
  async delete(key: string): Promise<void> {
    const redisClient = this.getRedis();
    if (!redisClient) {
      console.log('⚠️ Redis: Client not available, skipping cache delete');
      return;
    }
    
    try {
      await redisClient.del(key);
      console.log('🗑️ Redis: Cache deleted for:', key);
    } catch (error) {
      console.error('❌ Redis: Error deleting cache:', error);
    }
  }

  // Delete multiple keys
  async deleteMultiple(keys: string[]): Promise<void> {
    const redisClient = this.getRedis();
    if (!redisClient) {
      console.log('⚠️ Redis: Client not available, skipping cache delete multiple');
      return;
    }
    
    try {
      if (keys.length > 0) {
        await redisClient.del(...keys);
        console.log('🗑️ Redis: Multiple cache keys deleted:', keys);
      }
    } catch (error) {
      console.error('❌ Redis: Error deleting multiple cache keys:', error);
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const redisClient = this.getRedis();
    if (!redisClient) {
      console.log('⚠️ Redis: Client not available, skipping cache exists check');
      return false;
    }
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('❌ Redis: Error checking key existence:', error);
      return false;
    }
  }

  // Get template data
  async getTemplate(userId: string, slug: string): Promise<any | null> {
    const key = this.getTemplateKey(userId, slug);
    return this.get(key);
  }

  // Set template data
  async setTemplate(userId: string, slug: string, data: any): Promise<void> {
    const key = this.getTemplateKey(userId, slug);
    return this.set(key, data);
  }

  // Get selection data
  async getSelection(userId: string): Promise<string | null> {
    const key = this.getSelectionKey(userId);
    return this.get<string>(key);
  }

  // Set selection data
  async setSelection(userId: string, template: string): Promise<void> {
    const key = this.getSelectionKey(userId);
    return this.set(key, template, 24 * 60 * 60); // 24 hours for selection
  }

  // Clear all user cache
  async clearUserCache(userId: string): Promise<void> {
    const redisClient = this.getRedis();
    if (!redisClient) {
      console.log('⚠️ Redis: Client not available, skipping user cache clear');
      return;
    }
    
    try {
      // Get all keys for this user
      const templatePattern = this.getTemplateKey(userId, '*');
      const selectionPattern = this.getSelectionKey(userId);
      
      // Note: Redis doesn't support wildcard deletion directly
      // We'll need to get keys first, then delete them
      const keys = await redisClient.keys(templatePattern);
      keys.push(selectionPattern);
      
      if (keys.length > 0) {
        await this.deleteMultiple(keys);
        console.log('🗑️ Redis: Cleared all cache for user:', userId);
      }
    } catch (error) {
      console.error('❌ Redis: Error clearing user cache:', error);
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache();

// Export Redis instance for direct use if needed (with null check)
export const getRedis = getRedisClient;
