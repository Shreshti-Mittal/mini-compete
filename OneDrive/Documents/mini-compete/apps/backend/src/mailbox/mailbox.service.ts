import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailboxService {
  constructor(private prisma: PrismaService) {}

  async getUserMailbox(userId: string) {
    return await this.prisma.mailBox.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    const mailbox = await this.prisma.mailBox.findUnique({
      where: { id },
    });

    if (!mailbox) {
      throw new NotFoundException('Email not found');
    }

    if (mailbox.userId !== userId) {
      throw new NotFoundException('Email not found');
    }

    return await this.prisma.mailBox.update({
      where: { id },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.prisma.mailBox.count({
      where: { userId, read: false },
    });
  }
}

