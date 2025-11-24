import axios, { AxiosError } from 'axios';
import { Competition, CreateCompetitionDto } from '@/types/competition';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      const message = data?.message || data?.error || error.message || 'An error occurred';
      const customError = new Error(message);
      (customError as any).status = error.response.status;
      (customError as any).response = error.response;
      return Promise.reject(customError);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// Competition API functions
export const competitionsApi = {
  getAll: async (organizerId?: string): Promise<Competition[]> => {
    const params = organizerId ? { organizerId } : {};
    const response = await api.get<Competition[]>('/competitions', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Competition> => {
    const response = await api.get<Competition>(`/competitions/${id}`);
    return response.data;
  },

  create: async (data: CreateCompetitionDto): Promise<Competition> => {
    const response = await api.post<Competition>('/competitions', data);
    return response.data;
  },
};

// Registration API functions
export interface RegistrationResponse {
  registrationId: string;
  status: number;
  message?: string;
}

export interface UserRegistration {
  id: string;
  userId: string;
  competitionId: string;
  registeredAt: string;
  status: string;
  competition: Competition;
  createdAt: string;
  updatedAt: string;
}

export const registerForCompetition = async (
  competitionId: string,
  idempotencyKey: string,
): Promise<RegistrationResponse> => {
  const response = await api.post<RegistrationResponse>(
    `/competitions/${competitionId}/register`,
    {},
    { headers: { 'Idempotency-Key': idempotencyKey } },
  );
  return response.data;
};

export const getMyRegistrations = async (): Promise<UserRegistration[]> => {
  const response = await api.get<UserRegistration[]>('/users/me/registrations');
  return response.data;
};

export const checkRegistration = async (
  competitionId: string,
): Promise<{ isRegistered: boolean }> => {
  const response = await api.get<{ isRegistered: boolean }>(
    `/users/me/registrations/${competitionId}/check`,
  );
  return response.data;
};

// Mailbox API functions
export interface MailboxEmail {
  id: string;
  userId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  read: boolean;
  createdAt: string;
}

export const getMailbox = async (): Promise<MailboxEmail[]> => {
  const response = await api.get<MailboxEmail[]>('/mailbox');
  return response.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await api.get<{ count: number }>('/mailbox/unread-count');
  return response.data;
};

export const markEmailAsRead = async (id: string): Promise<MailboxEmail> => {
  const response = await api.patch<MailboxEmail>(`/mailbox/${id}/read`);
  return response.data;
};

// Competition registrations for organizers
export interface CompetitionRegistration {
  id: string;
  userId: string;
  competitionId: string;
  registeredAt: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const getCompetitionRegistrations = async (
  competitionId: string,
): Promise<CompetitionRegistration[]> => {
  const response = await api.get<CompetitionRegistration[]>(
    `/competitions/${competitionId}/registrations`,
  );
  return response.data;
};

export default api;

