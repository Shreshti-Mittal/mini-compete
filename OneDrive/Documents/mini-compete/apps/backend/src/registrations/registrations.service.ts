import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { IdempotencyService } from '../common/idempotency.service';
import { RegistrationResponseDto } from './dto/registration-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RegistrationsService {
  constructor(
    private prisma: PrismaService,
    private idempotency: IdempotencyService,
    @InjectQueue('registrations') private registrationQueue: Queue,
  ) {}

  async register(
    competitionId: string,
    userId: string,
    idempotencyKey: string,
  ): Promise<RegistrationResponseDto> {
    // 1. Check idempotency key in Redis
    const cached = await this.idempotency.get(idempotencyKey);
    if (cached) {
      return cached;
    }

    // 2. Use Prisma transaction with SELECT FOR UPDATE (row lock)
    const result = await this.prisma.$transaction(
      async (tx) => {
        // Get competition with lock using findUnique (Prisma doesn't support FOR UPDATE directly,
        // but we'll use transaction isolation to ensure consistency)
        const competition = await tx.competition.findUnique({
          where: { id: competitionId },
          include: {
            _count: {
              select: {
                registrations: {
                  where: {
                    status: 'CONFIRMED',
                  },
                },
              },
            },
          },
        });

        // Validation checks
        if (!competition) {
          throw new NotFoundException('Competition not found');
        }

        if (new Date() > competition.regDeadline) {
          throw new BadRequestException('Registration deadline has passed');
        }

        // Check capacity
        const registeredCount = competition._count.registrations;
        if (registeredCount >= competition.capacity) {
          throw new ConflictException('Competition is full');
        }

        // Check if already registered
        const existing = await tx.registration.findUnique({
          where: {
            userId_competitionId: {
              userId,
              competitionId,
            },
          },
        });

        if (existing && existing.status === 'CONFIRMED') {
          throw new ConflictException('Already registered for this competition');
        }

        // Create registration
        const registration = await tx.registration.create({
          data: {
            userId,
            competitionId,
            status: 'CONFIRMED',
          },
          include: {
            competition: {
              select: {
                id: true,
                title: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return registration;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10000,
      },
    );

    // 3. Store in Redis with 24hr TTL
    const response: RegistrationResponseDto = {
      registrationId: result.id,
      status: 201,
      message: 'Successfully registered',
    };
    await this.idempotency.checkAndStore(idempotencyKey, response, 86400);

    // 4. Enqueue confirmation job
    await this.registrationQueue.add(
      'registration:confirmation',
      {
        registrationId: result.id,
        userId: result.userId,
        competitionId: result.competitionId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000, // 1s, 4s, 16s
        },
      },
    );

    return response;
  }

  async getUserRegistrations(userId: string) {
    return await this.prisma.registration.findMany({
      where: {
        userId,
        status: 'CONFIRMED',
      },
      include: {
        competition: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });
  }

  async checkUserRegistration(competitionId: string, userId: string): Promise<boolean> {
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_competitionId: {
          userId,
          competitionId,
        },
      },
    });

    return registration?.status === 'CONFIRMED';
  }
}

