import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, forgotPassword, getMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], login);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email'),
], forgotPassword);

router.get('/me', authMiddleware, getMe);

export default router;
