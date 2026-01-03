import { Router } from 'express';
import {
  createPayroll,
  getMyPayroll,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  processPayment,
  generatePayslip,
} from '../controllers/payrollController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPayrollSchema } from '../validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.get('/my-payroll', getMyPayroll);
router.get('/:id/payslip', generatePayslip);

// HR routes
router.post('/', authorize('hr'), validate(createPayrollSchema), createPayroll);
router.get('/all', authorize('hr'), getAllPayrolls);
router.get('/:id', getPayrollById);
router.put('/:id', authorize('hr'), updatePayroll);
router.post('/:id/process-payment', authorize('hr'), processPayment);

export default router;
