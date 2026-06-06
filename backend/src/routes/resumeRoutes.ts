import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  generateSample,
} from '../controllers/resumeController';

const router = Router();

router.use(authMiddleware);

router.get('/', getResumes);
router.get('/:id', getResume);
router.post('/', createResume);
router.post('/generate', generateSample);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post('/:id/duplicate', duplicateResume);

export default router;
