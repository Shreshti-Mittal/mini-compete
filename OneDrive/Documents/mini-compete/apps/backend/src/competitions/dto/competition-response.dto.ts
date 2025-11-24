import { Exclude, Expose, Transform } from 'class-transformer';

export class OrganizerInfoDto {
  id: string;
  name: string;
  email: string;
}

export class CompetitionResponseDto {
  id: string;
  title: string;
  description: string;
  tags: string[];
  capacity: number;
  regDeadline: Date;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.organizer)
  organizer?: OrganizerInfoDto;

  @Expose()
  @Transform(({ obj }) => obj._count?.registrations || 0)
  registrationCount?: number;

  @Expose()
  @Transform(({ obj }) => {
    const registrationCount = obj._count?.registrations || 0;
    return obj.capacity - registrationCount;
  })
  seatsLeft?: number;

  @Expose()
  @Transform(({ obj }) => {
    const registrationCount = obj._count?.registrations || 0;
    const seatsLeft = obj.capacity - registrationCount;
    const now = new Date();
    const deadline = new Date(obj.regDeadline);
    
    if (seatsLeft <= 0) return 'FULL';
    if (deadline < now) return 'CLOSED';
    if (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'CLOSING_SOON';
    return 'OPEN';
  })
  status?: string;

  @Expose()
  @Transform(({ obj }) => {
    const deadline = new Date(obj.regDeadline);
    return deadline < new Date();
  })
  isExpired?: boolean;
}

