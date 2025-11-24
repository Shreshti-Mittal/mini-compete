import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class IdempotencyService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkAndStore(key: string, value: any, ttl: number): Promise<any> {
    const existing = await this.cacheManager.get(key);
    if (existing) return existing;
    await this.cacheManager.set(key, value, ttl);
    return null;
  }

  async get(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }
}