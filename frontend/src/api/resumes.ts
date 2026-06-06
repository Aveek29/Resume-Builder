import api from './client';
import type { Resume } from '../types';

interface ResumesResponse {
  resumes: Resume[];
}

interface ResumeResponse {
  resume: Resume;
}

interface MessageResponse {
  message: string;
  resume: Resume;
}

export const resumesApi = {
  getAll: () => api.get<ResumesResponse>('/resumes'),
  getOne: (id: string) => api.get<ResumeResponse>(`/resumes/${id}`),
  create: (data: Partial<Resume>) => api.post<MessageResponse>('/resumes', data),
  update: (id: string, data: Partial<Resume>) => api.put<MessageResponse>(`/resumes/${id}`, data),
  delete: (id: string) => api.delete(`/resumes/${id}`),
  duplicate: (id: string) => api.post<MessageResponse>(`/resumes/${id}/duplicate`),
  generateSample: () => api.post<MessageResponse>('/resumes/generate'),
};
