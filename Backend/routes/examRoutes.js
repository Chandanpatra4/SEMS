import express from 'express';
import {
  createExam,
  getAvailableExams,
  getAllExams,
  getExamById,
  updateExam,
} from '../controllers/examController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('teacher'), createExam);
router.get('/available', authorizeRoles('student'), getAvailableExams);
router.get('/', authorizeRoles('teacher', 'student', 'admin'), getAllExams);
router.get('/:id', authorizeRoles('teacher', 'student', 'admin'), getExamById);
router.put('/:id', authorizeRoles('teacher'), updateExam);

export default router;
