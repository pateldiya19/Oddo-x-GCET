import { Router } from 'express';
import {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
  deleteLeaveRequest,
  getLeaveStats,
} from '../controllers/leaveController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createLeaveSchema, updateLeaveStatusSchema } from '../validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', validate(createLeaveSchema), createLeaveRequest);
router.get('/my-leaves', getMyLeaveRequests);
router.delete('/:id', deleteLeaveRequest);

// HR/Manager routes
router.get('/all', authorize('hr', 'manager'), getAllLeaveRequests);
router.get('/stats', authorize('hr', 'manager'), getLeaveStats);
router.patch('/:id/status', authorize('hr', 'manager'), validate(updateLeaveStatusSchema), updateLeaveStatus);

export default router;
