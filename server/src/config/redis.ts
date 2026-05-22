import Redis from 'ioredis';
import { getEnv } from './env';

const env = getEnv();

let redis: Redis | null = null;

export const connectRedis = (): Redis | null => {
  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 0,
      enableReadyCheck: false,
      enableOfflineQueue: false,
      retryStrategy: () => null, // Don't retry - Redis is optional
      lazyConnect: true // Don't connect until explicitly called
    });

    redis.on('connect', () => console.log('✅ Redis connected'));
    redis.on('error', () => {
      // Silently handle errors - Redis is optional
      redis = null;
    });

    // Try to connect but don't block if it fails
    redis.connect().catch(() => {
      console.warn('⚠️ Redis unavailable - operating without cache');
      redis = null;
    });

    return redis;
  } catch (error) {
    console.warn('⚠️ Redis connection failed - operating without cache');
    return null;
  }
};

export const getRedis = (): Redis | null => {
  return redis;
};

export default {
  connectRedis,
  getRedis
};
