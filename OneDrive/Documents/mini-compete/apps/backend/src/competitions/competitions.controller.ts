import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('competitions')
@UseGuards(JwtAuthGuard)
export class CompetitionsController {
  constructor(
    private readonly competitionsService: CompetitionsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZER)
  async create(@Body() createDto: CreateCompetitionDto, @Request() req) {
    // Validate deadline is in the future
    const deadline = new Date(createDto.regDeadline);
    if (deadline <= new Date()) {
      throw new BadRequestException('Registration deadline must be in the future');
    }

    return this.competitionsService.create(createDto, req.user.id);
  }

  @Get()
  async findAll(@Request() req, @Query('organizerId') organizerId?: string) {
    const userId = req.user?.id;
    const role = req.user?.role as Role;

    // If organizerId query param is provided, filter by it
    if (organizerId) {
      const competitions = await this.competitionsService.findAll();
      return competitions.filter((c) => c.organizerId === organizerId);
    }

    return this.competitionsService.findAll(userId, role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.competitionsService.findOne(id);
  }

  @Get(':id/registrations')
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZER)
  async getCompetitionRegistrations(@Param('id') id: string, @Request() req) {
    // Verify organizer owns this competition
    const competition = await this.competitionsService.findOne(id);
    if (competition.organizerId !== req.user.id) {
      throw new ForbiddenException('Not your competition');
    }

    const registrations = await this.prisma.registration.findMany({
      where: { competitionId: id, status: 'CONFIRMED' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    return registrations;
  }
}

