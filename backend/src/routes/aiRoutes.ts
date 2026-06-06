import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../middleware/auth';
import {
  generateSummary,
  enhanceProject,
  generateAchievement,
  suggestSkills,
  enhanceText,
  chatWithAI,
  getChatHistory,
} from '../controllers/aiController';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many AI requests, please try again later' },
});

router.use(authMiddleware);
router.use(aiLimiter);

router.post('/summary', generateSummary);
router.post('/project', enhanceProject);
router.post('/achievement', generateAchievement);
router.post('/skills', suggestSkills);
router.post('/enhance', enhanceText);
router.post('/chat', chatWithAI);
router.get('/chat/history', getChatHistory);

export default router;
