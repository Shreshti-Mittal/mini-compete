import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupCronService {
  private readonly logger = new Logger(CleanupCronService.name);

  constructor(private prisma: PrismaService) {}

  // Run daily at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldData() {
    this.logger.log('Starting cleanup cron job...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Soft delete old cancelled registrations
      const result = await this.prisma.registration.updateMany({
        where: {
          status: 'CANCELLED',
          updatedAt: { lt: thirtyDaysAgo },
        },
        data: {
          // Add deletedAt field if you want soft delete
          // Or just leave as is
        },
      });

      this.logger.log(`Cleaned up ${result.count} old registrations`);

      // Clean up old failed jobs (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deletedJobs = await this.prisma.failedJob.deleteMany({
        where: {
          createdAt: { lt: ninetyDaysAgo },
        },
      });

      this.logger.log(`Deleted ${deletedJobs.count} old failed jobs`);
    } catch (error: any) {
      this.logger.error(`Cleanup cron failed: ${error.message}`);
    }
  }
}

