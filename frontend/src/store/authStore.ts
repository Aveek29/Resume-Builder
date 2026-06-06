import { create } from 'zustand';
import { authApi } from '../api/auth';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: !!localStorage.getItem('rf_token'),
  user: JSON.parse(localStorage.getItem('rf_user') || 'null'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('rf_token', data.token);
      localStorage.setItem('rf_user', JSON.stringify(data.user));
      set({ isAuthenticated: true, user: data.user, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register({ name, email, password });
      localStorage.setItem('rf_token', data.token);
      localStorage.setItem('rf_user', JSON.stringify(data.user));
      set({ isAuthenticated: true, user: data.user, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('rf_token');
    localStorage.removeItem('rf_user');
    set({ isAuthenticated: false, user: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('rf_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    try {
      const { data } = await authApi.getMe();
      set({ user: data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('rf_token');
      localStorage.removeItem('rf_user');
      set({ isAuthenticated: false, user: null });
    }
  },

  checkAuth: () => {
    return get().isAuthenticated;
  },
}));
