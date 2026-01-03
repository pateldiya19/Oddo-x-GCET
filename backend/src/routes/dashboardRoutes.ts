import { Router } from 'express';
import {
  getEmployeeDashboard,
  getAdminDashboard,
  getReports,
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee dashboard
router.get('/employee', getEmployeeDashboard);

// Admin dashboard
router.get('/admin', authorize('hr', 'manager'), getAdminDashboard);

// Reports
router.get('/reports', authorize('hr', 'manager'), getReports);

export default router;
