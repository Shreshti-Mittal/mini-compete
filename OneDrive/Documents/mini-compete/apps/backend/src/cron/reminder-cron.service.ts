import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReminderCronService {
  private readonly logger = new Logger(ReminderCronService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('registrations') private queue: Queue,
  ) {}

  // Run every minute in dev, daily at midnight in production
  @Cron(process.env.NODE_ENV === 'production' ? '0 0 * * *' : '* * * * *')
  async sendUpcomingReminders() {
    this.logger.log('Starting reminder cron job...');

    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find competitions starting in next 24 hours
      const upcomingCompetitions = await this.prisma.competition.findMany({
        where: {
          regDeadline: {
            gte: now,
            lte: tomorrow,
          },
        },
        include: {
          registrations: {
            where: { status: 'CONFIRMED' },
            include: { user: true },
          },
        },
      });

      this.logger.log(`Found ${upcomingCompetitions.length} competitions starting soon`);

      let reminderCount = 0;

      for (const competition of upcomingCompetitions) {
        for (const registration of competition.registrations) {
          // Check if reminder already sent (optional: add reminderSent field)
          const existingReminder = await this.prisma.mailBox.findFirst({
            where: {
              userId: registration.userId,
              subject: { contains: `Reminder: ${competition.title}` },
              sentAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            },
          });

          if (!existingReminder) {
            await this.queue.add(
              'reminder:notify',
              {
                userId: registration.userId,
                competitionId: competition.id,
              },
              {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
              },
            );
            reminderCount++;
          }
        }
      }

      this.logger.log(`Enqueued ${reminderCount} reminder jobs`);
    } catch (error: any) {
      this.logger.error(`Reminder cron failed: ${error.message}`);
    }
  }
}

