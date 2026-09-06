import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  patchStudent,
  deleteStudent,
  getStudentStats,
} from '../controllers/student.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createStudentSchema, updateStudentSchema } from '../validators/student.validator';

const router = Router();

// Public / Authenticated Routes (Both User and Admin can view)
router.get('/', authenticate, authorize('user', 'admin'), getStudents);
router.get('/stats', authenticate, authorize('admin'), getStudentStats);
router.get('/:id', authenticate, authorize('user', 'admin'), getStudentById);

// Admin-Only Operations
router.post('/', authenticate, authorize('admin'), validate(createStudentSchema), createStudent);
router.put('/:id', authenticate, authorize('admin'), validate(createStudentSchema), updateStudent);
router.patch('/:id', authenticate, authorize('admin'), validate(updateStudentSchema), patchStudent);
router.delete('/:id', authenticate, authorize('admin'), deleteStudent);

export default router;