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
  votes: { 
    optionIndex: number; 
    count: string;
    userId?: number;
  }[];
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
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log("🔐 Logging in with:", { email });
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    console.log("✅ Login success:", response.data);
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    console.log("📩 Registering user:", userData);
    const response = await api.post<AuthResponse>('/auth/register', userData);
    console.log("✅ Registration success:", response.data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    console.log("🙋‍♂️ Fetched current user:", response.data);
    return response.data;
  },

  getCurrentUserId: (): number | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("🧠 Retrieved user from localStorage:", user);
        return user.id;
      } catch (err) {
        console.warn("⚠️ Failed to parse user from localStorage");
        return null;
      }
    }
    return null;
  },

  createPoll: async (data: CreatePollData): Promise<{ id: number }> => {
    console.log("📝 Creating poll:", data);
    const response = await api.post<{ id: number }>('/poll', data);
    console.log("✅ Poll created:", response.data);
    return response.data;
  },

  getPolls: async (): Promise<Poll[]> => {
    console.log("📡 Fetching all polls...");
    const response = await api.get<Poll[]>('/poll');
    console.log("✅ Polls received:", response.data);
    return response.data;
  },

  getPoll: async (id: number): Promise<Poll> => {
    console.log(`📡 Fetching poll with ID: ${id}`);
    const response = await api.get<Poll>(`/poll/${id}`);
    console.log("✅ Poll received:", response.data);
    return response.data;
  },

  vote: async (pollId: number, data: VoteData): Promise<void> => {
    console.log(`🗳️ Voting on poll ${pollId} with:`, data);
    await api.post(`/poll/${pollId}/vote`, data);
    console.log("✅ Vote sent");
  },

  deletePoll: async (id: number): Promise<void> => {
    console.log(`🗑️ Deleting poll ID: ${id}`);
    await api.delete(`/poll/${id}`);
    console.log("✅ Poll deleted");
  }
};