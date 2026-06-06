import Groq from 'groq-sdk';
import { config } from '../config/env';

const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPTS = {
  summary: 'You are a professional resume writer. Generate concise, impactful professional summaries. Keep it to 3-4 sentences. Focus on key skills, experience level, and career objectives. Do not use any markdown formatting.',
  project: 'You are a professional resume writer. Enhance project descriptions to be more impactful and professional. Keep it concise (2-3 sentences). Highlight technical achievements and impact. Do not use any markdown formatting.',
  achievement: 'You are a professional resume writer. Convert simple achievement statements into professional, impactful resume bullet points. Use action verbs and quantify when possible. Return a single sentence. Do not use any markdown formatting.',
  skills: 'You are a career advisor. Suggest relevant technical and soft skills for a given career role. Return ONLY a JSON array of strings with 10-15 skill names. No explanation, no markdown, just the JSON array.',
  enhance: `You are a professional resume content enhancer. Your job is to improve the given text to make it sound more professional, impactful, and well-written for a resume.
- If the input is valid JSON (an object or array), you MUST return valid JSON of the exact same structure with improved values.
- If the input is plain text, return improved plain text.
- Do NOT add markdown formatting, code blocks, or extra commentary.
- Return ONLY the improved content, nothing else.`,
  chat: `You are ResumeForge AI Assistant, a multilingual career and resume advisor. You can help with:
1. Resume writing and review
2. Career guidance and suggestions
3. Interview preparation tips
4. Skill recommendations and learning roadmaps
5. Resume content improvements

You support: English, Spanish, French, German, Italian, Portuguese, Hindi, Bengali, Arabic, Japanese, Chinese, Russian.
ALWAYS detect the user's language from their message and respond in the SAME language. Example: if user writes in Spanish, respond in Spanish. If user writes in French, respond in French. Never switch languages mid-conversation.
Be friendly, professional, and concise. Provide actionable advice. If asked about something outside your expertise, politely redirect to resume and career topics.`,
};

let groqClient: Groq | null = null;

const getGroq = (): Groq => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: config.groqApiKey });
  }
  return groqClient;
};

const complete = async (
  system: string,
  user: string,
  maxTokens = 300,
  temperature = 0.7,
): Promise<string> => {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    model: MODEL,
    temperature,
    max_tokens: maxTokens,
  });
  return completion.choices[0]?.message?.content || '';
};

export const generateSummary = (context: string) =>
  complete(SYSTEM_PROMPTS.summary, `Generate a professional resume summary for the following context: ${context}`, 300);

export const enhanceProject = (description: string) =>
  complete(SYSTEM_PROMPTS.project, `Enhance this project description for a resume: ${description}`, 200);

export const generateAchievement = (input: string) =>
  complete(SYSTEM_PROMPTS.achievement, `Convert this into a professional achievement statement: ${input}`, 150);

export const suggestSkills = async (role: string): Promise<string[]> => {
  const content = await complete(SYSTEM_PROMPTS.skills, `Suggest skills for a ${role} role`, 300, 0.5);
  try {
    return JSON.parse(content);
  } catch {
    return content.split(/[,\n]/).map(s => s.replace(/[\[\]"']/g, '').trim()).filter(s => s.length > 0);
  }
};

export const enhanceText = (text: string, prompt: string) =>
  complete(SYSTEM_PROMPTS.enhance, prompt, 600, 0.6);

export const chat = async (messages: { role: string; content: string }[]) => {
  const groq = getGroq();
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.chat },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ],
    model: MODEL,
    temperature: 0.7,
    max_tokens: 500,
  });
  return completion.choices[0]?.message?.content || 'I apologize, I was unable to process that request. Please try again.';
};
