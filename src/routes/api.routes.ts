import { Router } from 'express';
import { getUserProfile } from '../controllers/user.controller';
import { 
  createQuestion, 
  getQuestions, 
  updateQuestion,   
  deleteQuestion    
} from '../controllers/question.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { 
  createQuestionSchema, 
  updateQuestionSchema 
} from '../validators/authAndQuestion.validator';

const router = Router();
/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Retrieve all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: List of questions retrieved successfully
 */

router.get('/questions', getQuestions);
/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 */

router.post('/questions', authenticate, validate(createQuestionSchema), createQuestion);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Update an existing question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 */
router.put('/questions/:id', authenticate, validate(updateQuestionSchema), updateQuestion);
     /**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 */
router.delete('/questions/:id', authenticate, deleteQuestion); 
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 */
router.get('/users/profile', authenticate, getUserProfile);                               

export default router;