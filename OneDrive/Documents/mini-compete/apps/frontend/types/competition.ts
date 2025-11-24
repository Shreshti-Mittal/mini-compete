export interface OrganizerInfo {
  id: string;
  name: string;
  email: string;
}

export interface Competition {
  id: string;
  title: string;
  description: string;
  tags: string[];
  capacity: number;
  regDeadline: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  organizer?: OrganizerInfo;
  registrationCount?: number;
  seatsLeft?: number;
  status?: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'FULL';
  isExpired?: boolean;
}

export interface CreateCompetitionDto {
  title: string;
  description: string;
  tags?: string[];
  capacity: number;
  regDeadline: string;
}

export interface CompetitionResponse extends Competition {}

