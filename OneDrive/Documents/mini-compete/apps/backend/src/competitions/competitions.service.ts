import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { CompetitionResponseDto } from './dto/competition-response.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CompetitionsService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateCompetitionDto, userId: string) {
    // Verify user is organizer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== Role.ORGANIZER) {
      throw new ForbiddenException('Only organizers can create competitions');
    }

    // Create competition
    const competition = await this.prisma.competition.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        tags: createDto.tags || [],
        capacity: createDto.capacity,
        regDeadline: new Date(createDto.regDeadline),
        organizerId: userId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    return this.transformCompetition(competition);
  }

  async findAll(userId?: string, role?: Role) {
    const where: any = {};

    // If organizer, return only their competitions
    if (role === Role.ORGANIZER && userId) {
      where.organizerId = userId;
    }

    const competitions = await this.prisma.competition.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return competitions.map((comp) => this.transformCompetition(comp));
  }

  async findOne(id: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!competition) {
      throw new NotFoundException('Competition not found');
    }

    return this.transformCompetition(competition);
  }

  private transformCompetition(competition: any): CompetitionResponseDto {
    const registrationCount = competition._count?.registrations || 0;
    const seatsLeft = competition.capacity - registrationCount;
    const now = new Date();
    const deadline = new Date(competition.regDeadline);

    let status = 'OPEN';
    if (seatsLeft <= 0) {
      status = 'FULL';
    } else if (deadline < now) {
      status = 'CLOSED';
    } else if (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      status = 'CLOSING_SOON';
    }

    return {
      id: competition.id,
      title: competition.title,
      description: competition.description,
      tags: competition.tags,
      capacity: competition.capacity,
      regDeadline: competition.regDeadline,
      organizerId: competition.organizerId,
      createdAt: competition.createdAt,
      updatedAt: competition.updatedAt,
      organizer: competition.organizer,
      registrationCount,
      seatsLeft,
      status,
      isExpired: deadline < now,
    };
  }
}

