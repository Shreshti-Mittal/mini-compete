import { Processor, OnWorkerEvent, WorkerHost } from "@nestjs/bullmq";
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('registrations')
export class RegistrationProcessor extends WorkerHost {
  private readonly logger = new Logger(RegistrationProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'registration:confirmation':
        return this.handleConfirmation(job);
      case 'reminder:notify':
        return this.handleReminder(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleConfirmation(job: Job) {
    const { registrationId, userId, competitionId } = job.data;

    this.logger.log(`Processing confirmation for registration ${registrationId}`);

    try {
      // 1. Verify registration still exists and is valid
      const registration = await this.prisma.registration.findUnique({
        where: { id: registrationId },
        include: {
          user: true,
          competition: { include: { organizer: true } },
        },
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      if (registration.status === 'CANCELLED') {
        throw new Error('Registration cancelled');
      }

      // 2. Create confirmation email in mailbox
      const mailbox = await this.prisma.mailBox.create({
        data: {
          userId: registration.userId,
          to: registration.user.email,
          subject: `Registration Confirmed - ${registration.competition.title}`,
          body: `Hello ${registration.user.name},

You have been successfully registered for "${registration.competition.title}".

Competition Details:
- Title: ${registration.competition.title}
- Description: ${registration.competition.description}
- Organizer: ${registration.competition.organizer.name}
- Deadline: ${new Date(registration.competition.regDeadline).toLocaleString()}

Thank you for registering!

Best regards,
Mini Compete Team`,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Confirmation email sent to ${registration.user.email}`);

      return { success: true, mailboxId: mailbox.id };
    } catch (error: any) {
      this.logger.error(`Failed to process confirmation: ${error.message}`);

      // If final attempt, save to FailedJobs
      if (job.attemptsMade >= (job.opts?.attempts || 3)) {
        await this.prisma.failedJob.create({
          data: {
            jobType: 'registration:confirmation',
            payload: job.data,
            error: error.message,
            attempts: job.attemptsMade,
          },
        });
        this.logger.error(`Job moved to DLQ after ${job.attemptsMade} attempts`);
      }

      throw error; // Re-throw to trigger retry
    }
  }

  private async handleReminder(job: Job) {
    const { userId, competitionId } = job.data;

    this.logger.log(`Processing reminder for user ${userId}`);

    try {
      const registration = await this.prisma.registration.findFirst({
        where: {
          userId,
          competitionId,
          status: 'CONFIRMED',
        },
        include: {
          user: true,
          competition: true,
        },
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      await this.prisma.mailBox.create({
        data: {
          userId: registration.userId,
          to: registration.user.email,
          subject: `Reminder: ${registration.competition.title} Starts Tomorrow`,
          body: `Hello ${registration.user.name},

This is a friendly reminder that "${registration.competition.title}" starts in 24 hours!

Competition Details:
- Title: ${registration.competition.title}
- Start Date: ${new Date(registration.competition.regDeadline).toLocaleString()}

Be prepared and good luck!

Best regards,
Mini Compete Team`,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Reminder sent to ${registration.user.email}`);

      return { success: true };
    } catch (error: any) {
      this.logger.error(`Failed to send reminder: ${error.message}`);

      if (job.attemptsMade >= (job.opts?.attempts || 3)) {
        await this.prisma.failedJob.create({
          data: {
            jobType: 'reminder:notify',
            payload: job.data,
            error: error.message,
            attempts: job.attemptsMade,
          },
        });
      }

      throw error;
    }
  }
}

