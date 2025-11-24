import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReminderCronService } from './reminder-cron.service';
import { CleanupCronService } from './cleanup-cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), QueueModule, PrismaModule],
  providers: [ReminderCronService, CleanupCronService],
})
export class CronModule {}

