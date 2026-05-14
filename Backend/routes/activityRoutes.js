import express from 'express';
import { getActivityLogs, logActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('admin', 'teacher'), getActivityLogs);
router.post('/log', protect, authorizeRoles('student'), logActivity);

export default router;
