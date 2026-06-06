import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ChatHistory } from '../models/ChatHistory';
import * as groqService from '../services/groqService';
import { asyncHandler } from '../utils/asyncHandler';

export const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  const { context } = req.body;
  if (!context) {
    res.status(400).json({ message: 'Context is required' });
    return;
  }
  const summary = await groqService.generateSummary(context);
  res.json({ summary });
});

export const enhanceProject = asyncHandler(async (req: Request, res: Response) => {
  const { description } = req.body;
  if (!description) {
    res.status(400).json({ message: 'Description is required' });
    return;
  }
  const enhanced = await groqService.enhanceProject(description);
  res.json({ enhanced });
});

export const generateAchievement = asyncHandler(async (req: Request, res: Response) => {
  const { input } = req.body;
  if (!input) {
    res.status(400).json({ message: 'Input is required' });
    return;
  }
  const achievement = await groqService.generateAchievement(input);
  res.json({ achievement });
});

export const suggestSkills = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) {
    res.status(400).json({ message: 'Role is required' });
    return;
  }
  const skills = await groqService.suggestSkills(role);
  res.json({ skills });
});

export const chatWithAI = asyncHandler(async (req: Request, res: Response) => {
  const { message, lang } = req.body;
  if (!message) {
    res.status(400).json({ message: 'Message is required' });
    return;
  }

  const langMsg = lang
    ? `\nIMPORTANT: The user's browser language is "${lang}". You MUST respond in the same language as the user's message, defaulting to the browser language if uncertain.`
    : '';
  const contextMsg = `${message}${langMsg}`;

  const dbReady = mongoose.connection.readyState === 1;

  if (dbReady) {
    let chatHistory = await ChatHistory.findOne({ userId: req.userId });
    if (!chatHistory) {
      chatHistory = await ChatHistory.create({ userId: req.userId, messages: [] });
    }

    chatHistory.messages.push({ role: 'user', content: contextMsg, timestamp: new Date() });
    const messages = chatHistory.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    const response = await groqService.chat(messages);
    chatHistory.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
    await chatHistory.save();

    res.json({ response, messages: chatHistory.messages.slice(-20) });
  } else {
    const messages = [{ role: 'user' as const, content: contextMsg }];
    const response = await groqService.chat(messages);
    res.json({
      response,
      messages: [
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: response, timestamp: new Date().toISOString() },
      ],
    });
  }
});

export const enhanceText = asyncHandler(async (req: Request, res: Response) => {
  const { text, type } = req.body;
  if (!text) {
    res.status(400).json({ message: 'Text is required' });
    return;
  }

  const isJson = text.trim().startsWith('{') || text.trim().startsWith('[');
  let prompt: string;
  if (isJson) {
    prompt = `Improve this resume ${type} data. Return valid JSON of the exact same structure with professionally enhanced values. Input: ${text}`;
  } else {
    prompt = `Improve this ${type} text for a professional resume: ${text}`;
  }

  const enhanced = await groqService.enhanceText(text, prompt);
  res.json({ enhanced });
});

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  if (mongoose.connection.readyState !== 1) {
    res.json({ messages: [] });
    return;
  }
  const chatHistory = await ChatHistory.findOne({ userId: req.userId });
  res.json({ messages: chatHistory?.messages || [] });
});
