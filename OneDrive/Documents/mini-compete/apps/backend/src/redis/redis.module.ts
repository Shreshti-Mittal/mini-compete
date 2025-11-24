import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        
        const store = await redisStore({
          url: redisUrl,
        });

        return {
          store: () => store,
          ttl: 3600, // Default TTL in seconds
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}

