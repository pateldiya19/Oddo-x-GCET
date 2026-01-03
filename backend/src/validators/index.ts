import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'hr']).optional(),
});

export const signupSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'hr']).default('employee'),
  department: z.string().optional(),
  position: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Employee Schemas
export const createEmployeeSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  role: z.enum(['employee', 'hr', 'manager']).default('employee'),
  joinDate: z.string().or(z.date()).optional(),
  salary: z.number().positive('Salary must be positive').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().omit({ password: true });

// Attendance Schemas
export const checkInSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const checkOutSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const attendanceQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  employeeId: z.string().optional(),
  status: z.enum(['Present', 'Absent', 'Leave', 'Half-Day']).optional(),
});

// Leave Schemas
export const createLeaveSchema = z.object({
  leaveType: z.enum(['paid', 'sick', 'unpaid', 'casual']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export const updateLeaveStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected']),
  remarks: z.string().optional(),
});

// Payroll Schemas
export const createPayrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  month: z.string().min(1, 'Month is required'),
  baseSalary: z.number().positive('Base salary must be positive'),
  allowances: z.number().min(0, 'Allowances cannot be negative').default(0),
  deductions: z.number().min(0, 'Deductions cannot be negative').default(0),
  bonus: z.number().min(0, 'Bonus cannot be negative').default(0),
});

export const updatePayrollSchema = createPayrollSchema.partial();

// Report Schemas
export const reportQuerySchema = z.object({
  type: z.enum(['attendance', 'leave', 'payroll', 'employee']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  employeeId: z.string().optional(),
  department: z.string().optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type UpdateLeaveStatusInput = z.infer<typeof updateLeaveStatusSchema>;
export type CreatePayrollInput = z.infer<typeof createPayrollSchema>;
export type UpdatePayrollInput = z.infer<typeof updatePayrollSchema>;
export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
