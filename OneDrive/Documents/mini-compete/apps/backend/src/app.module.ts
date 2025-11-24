import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { QueueModule } from './queue/queue.module';
import { MailboxModule } from './mailbox/mailbox.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompetitionsModule,
    RegistrationsModule,
    QueueModule,
    MailboxModule,
    CronModule,
  ],
})
export class AppModule {}

