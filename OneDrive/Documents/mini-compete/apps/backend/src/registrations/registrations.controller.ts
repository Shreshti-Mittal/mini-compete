import {
  Controller,
  Get,
  Post,
  Param,
  Headers,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('competitions')
export class RegistrationsController {
  constructor(private readonly service: RegistrationsService) {}

  @Post(':id/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTICIPANT)
  async register(
    @Param('id') competitionId: string,
    @Headers('idempotency-key') idempotencyKey: string,
    @Request() req,
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    return await this.service.register(competitionId, req.user.id, idempotencyKey);
  }
}

@Controller('users')
export class UserRegistrationsController {
  constructor(private readonly service: RegistrationsService) {}

  @Get('me/registrations')
  @UseGuards(JwtAuthGuard)
  async getMyRegistrations(@Request() req) {
    return await this.service.getUserRegistrations(req.user.id);
  }

  @Get('me/registrations/:competitionId/check')
  @UseGuards(JwtAuthGuard)
  async checkRegistration(
    @Param('competitionId') competitionId: string,
    @Request() req,
  ) {
    const isRegistered = await this.service.checkUserRegistration(
      competitionId,
      req.user.id,
    );
    return { isRegistered };
  }
}

