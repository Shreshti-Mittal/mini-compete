import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { IdempotencyService } from '../common/idempotency.service';

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    CacheModule.register({
      ttl: 86400, // 24 hours in seconds
      max: 100,   // maximum number of items in cache
    }),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService, IdempotencyService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}