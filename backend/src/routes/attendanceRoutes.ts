import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getTodayAttendance,
  getMyTodayAttendance,
  markLeave,
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkInSchema, checkOutSchema } from '../validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/check-in', validate(checkInSchema), checkIn);
router.post('/check-out', validate(checkOutSchema), checkOut);
router.get('/my-attendance', getMyAttendance);
router.get('/my-today', getMyTodayAttendance);

// HR/Manager routes
router.get('/all', authorize('hr', 'manager'), getAllAttendance);
router.get('/today', authorize('hr', 'manager'), getTodayAttendance);
router.post('/mark-leave', authorize('hr', 'manager'), markLeave);

export default router;
