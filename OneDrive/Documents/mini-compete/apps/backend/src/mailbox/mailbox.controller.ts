import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/mailbox')
@UseGuards(JwtAuthGuard)
export class MailboxController {
  constructor(private readonly service: MailboxService) {}

  @Get()
  async getMailbox(@Request() req) {
    return await this.service.getUserMailbox(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.service.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    return await this.service.markAsRead(id, req.user.id);
  }
}

