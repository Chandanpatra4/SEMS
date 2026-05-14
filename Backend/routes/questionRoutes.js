import express from 'express';
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('teacher'), createQuestion);
router.get('/', authorizeRoles('teacher', 'admin'), getQuestions);
router.put('/:id', authorizeRoles('teacher'), updateQuestion);
router.delete('/:id', authorizeRoles('teacher'), deleteQuestion);

export default router;
