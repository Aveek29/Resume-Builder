import { create } from 'zustand';
import { resumesApi } from '../api/resumes';
import type { Resume } from '../types';
import { emptyResume } from '../types';

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  currentStep: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchResumes: () => Promise<void>;
  fetchResume: (id: string) => Promise<void>;
  createResume: (data: Partial<Resume>) => Promise<Resume>;
  updateResume: (id: string, data: Partial<Resume>) => Promise<void>;
  deleteResume: (id: string) => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
  setCurrentResume: (resume: Resume | null) => void;
  updateCurrentResume: (data: Partial<Resume>) => void;
  setCurrentStep: (step: number) => void;
  clearError: () => void;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  resumes: [],
  currentResume: null,
  currentStep: 0,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await resumesApi.getAll();
      set({ resumes: data.resumes, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch resumes', isLoading: false });
    }
  },

  fetchResume: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await resumesApi.getOne(id);
      set({ currentResume: data.resume, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch resume', isLoading: false });
    }
  },

  createResume: async (data: Partial<Resume>) => {
    set({ isSaving: true, error: null });
    try {
      const { data: res } = await resumesApi.create(data);
      const updatedResumes = get().resumes;
      set({
        resumes: [res.resume, ...updatedResumes],
        currentResume: res.resume,
        isSaving: false,
      });
      return res.resume;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create resume', isSaving: false });
      throw err;
    }
  },

  updateResume: async (id: string, data: Partial<Resume>) => {
    set({ isSaving: true, error: null });
    try {
      const { data: res } = await resumesApi.update(id, data);
      set((state) => ({
        resumes: state.resumes.map((r) => (r._id === id ? res.resume : r)),
        currentResume: res.resume,
        isSaving: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update resume', isSaving: false });
    }
  },

  deleteResume: async (id: string) => {
    try {
      await resumesApi.delete(id);
      set((state) => ({
        resumes: state.resumes.filter((r) => r._id !== id),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete resume' });
    }
  },

  duplicateResume: async (id: string) => {
    try {
      const { data: res } = await resumesApi.duplicate(id);
      set((state) => ({
        resumes: [res.resume, ...state.resumes],
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to duplicate resume' });
    }
  },

  setCurrentResume: (resume) => set({ currentResume: resume }),

  updateCurrentResume: (data) => {
    const current = get().currentResume;
    set({ currentResume: { ...(current || emptyResume), ...data } });
  },

  setCurrentStep: (step) => set({ currentStep: step }),

  clearError: () => set({ error: null }),
}));
