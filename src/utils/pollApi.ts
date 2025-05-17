import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreatePollData {
  question: string;
  options: string[];
  expiresAt: string;
}

export interface Poll {
  id: number;
  question: string;
  options: string[];
  expiresAt: string;
  votes: { optionIndex: number; count: string }[];
  isExpired: boolean;
  totalVotes?: number;
}

export interface VoteData {
  optionIndex: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthResponse {
  token: string;
  user: User;
}

export const pollApi = {
  // Auth methods
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  // Poll methods
  createPoll: async (data: CreatePollData): Promise<{ id: number }> => {
    const response = await api.post<{ id: number }>('/poll', data);
    return response.data;
  },

  getPolls: async (): Promise<Poll[]> => {
    const response = await api.get<Poll[]>('/poll');
    return response.data;
  },

  getPoll: async (id: number): Promise<Poll> => {
    const response = await api.get<Poll>(`/poll/${id}`);
    return response.data;
  },

  vote: async (pollId: number, data: VoteData): Promise<void> => {
    await api.post(`/poll/${pollId}/vote`, data);
  },

  deletePoll: async (id: number): Promise<void> => {
    await api.delete(`/poll/${id}`);
  }
}; 