import express from 'express';
import {
  submitExam,
  getMyResults,
  getExamResults,
} from '../controllers/resultController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/submit', protect, authorizeRoles('student'), submitExam);
router.get('/my-results', protect, authorizeRoles('student'), getMyResults);
router.get('/exam/:examId', protect, authorizeRoles('teacher', 'admin'), getExamResults);

export default router;
