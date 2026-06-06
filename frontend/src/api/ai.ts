import api from './client';

interface SummaryResponse {
  summary: string;
}

interface EnhancedResponse {
  enhanced: string;
}

interface AchievementResponse {
  achievement: string;
}

interface SkillsResponse {
  skills: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatResponse {
  response: string;
  messages: ChatMessage[];
}

interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export const aiApi = {
  generateSummary: (context: string) => api.post<SummaryResponse>('/ai/summary', { context }),
  enhanceProject: (description: string) => api.post<EnhancedResponse>('/ai/project', { description }),
  generateAchievement: (input: string) => api.post<AchievementResponse>('/ai/achievement', { input }),
  suggestSkills: (role: string) => api.post<SkillsResponse>('/ai/skills', { role }),
  enhanceText: (text: string, type: string) => api.post<EnhancedResponse>('/ai/enhance', { text, type }),
  chat: (message: string, lang?: string) => api.post<ChatResponse>('/ai/chat', { message, lang }),
  getChatHistory: () => api.get<ChatHistoryResponse>('/ai/chat/history'),
};
