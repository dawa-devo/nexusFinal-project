import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/user.controller';
import { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../config/cloudinary';
import { validate } from '../middlewares/validate.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  createQuestionSchema,
  updateQuestionSchema,
  updateProfileSchema,
} from '../validators/authAndQuestion.validator';

const router = Router();

// --- AUTHENTICATION ROUTES ---
/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new KnowledgeHub user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Dawud Temam" }
 *               email: { type: string, example: "dawud@example.com" }
 *               password: { type: string, example: "Secret123!" }
 *     responses:
 *       201: { description: User created successfully }
 */
router.post('/auth/register', validate(registerSchema), register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate and obtain Access & Refresh tokens
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "dawud@example.com" }
 *               password: { type: string, example: "Secret123!" }
 *     responses:
 *       200: { description: Authenticated successfully }
 */
router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/refresh', validate(refreshSchema), refresh);
router.post('/auth/logout', authenticate, logout);

// --- USER PROFILE ROUTES ---
/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     summary: Fetch user profile, badges, and platform statistics
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User profile details retrieved }
 */
router.get('/users/:id', getProfile);
router.patch('/users/profile', authenticate, validate(updateProfileSchema), updateProfile);
router.post('/users/avatar', authenticate, upload.single('avatar'), uploadAvatar);

// --- QUESTION ROUTES ---
/**
 * @openapi
 * /api/v1/questions:
 *   get:
 *     summary: Get questions with pagination, search, and sorting filters
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, popular, unanswered] }
 *     responses:
 *       200: { description: List of paginated questions }
 *   post:
 *     summary: Publish a new question
 *     tags: [Questions]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, tags]
 *             properties:
 *               title: { type: string, example: "How does JWT work in Express?" }
 *               description: { type: string, example: "Looking for an explanation of JWT token setup..." }
 *               tags: { type: array, items: { type: string }, example: ["nodejs", "jwt"] }
 *     responses:
 *       201: { description: Question published successfully }
 */
router.get('/questions', getQuestions);
router.get('/questions/:id', getQuestionById);
router.post('/questions', authenticate, validate(createQuestionSchema), createQuestion);
router.patch('/questions/:id', authenticate, validate(updateQuestionSchema), updateQuestion);
router.delete('/questions/:id', authenticate, deleteQuestion);

export default router;