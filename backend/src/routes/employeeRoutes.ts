import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEmployeeSchema } from '../validators';

const router = Router();

router.use(authenticate);

// Get all employees and stats
router.get('/', authorize('hr', 'manager'), getAllEmployees);
router.get('/stats', authorize('hr', 'manager'), getEmployeeStats);

// CRUD operations
router.post('/', authorize('hr'), validate(createEmployeeSchema), createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', authorize('hr', 'manager'), updateEmployee);
router.delete('/:id', authorize('hr'), deleteEmployee);

export default router;
