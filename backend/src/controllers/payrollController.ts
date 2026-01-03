import { Response, NextFunction } from 'express';
import Payroll from '../models/Payroll';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getCurrentMonth, paginate } from '../utils/helpers';

export const createPayroll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId, month, baseSalary, allowances, deductions, bonus, breakdown } = req.body;

    const user = await User.findOne({ employeeId });
    if (!user) {
      throw new AppError('Employee not found', 404);
    }

    // Check if payroll already exists for this month
    const existingPayroll = await Payroll.findOne({ employeeId, month });
    if (existingPayroll) {
      throw new AppError('Payroll for this month already exists', 400);
    }

    // Calculate tax (simplified - 10% of gross salary)
    const grossSalary = baseSalary + (allowances || 0) + (bonus || 0);
    const tax = grossSalary * 0.1;

    const payroll = await Payroll.create({
      userId: user._id,
      employeeId: user.employeeId,
      employeeName: user.name,
      month,
      baseSalary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      bonus: bonus || 0,
      tax,
      breakdown,
    });

    res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      data: {
        payroll,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayroll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { month, page = 1, limit = 12 } = req.query;
    
    const query: any = { userId: req.user._id };
    
    if (month) {
      query.month = month;
    }

    const { skip, limit: pageLimit } = paginate(Number(page), Number(limit));
    
    const payrolls = await Payroll.find(query)
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });
    
    const total = await Payroll.countDocuments(query);

    // Get current month payroll
    const currentMonth = getCurrentMonth();
    const currentPayroll = await Payroll.findOne({
      userId: req.user._id,
      month: currentMonth,
    });

    res.json({
      success: true,
      data: {
        payrolls,
        currentPayroll,
        pagination: {
          total,
          page: Number(page),
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayrolls = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { month, employeeId, status, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    
    if (month) {
      query.month = month;
    }
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (status) {
      query.status = status;
    }

    const { skip, limit: pageLimit } = paginate(Number(page), Number(limit));
    
    const payrolls = await Payroll.find(query)
      .populate('userId', 'name email department')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });
    
    const total = await Payroll.countDocuments(query);

    // Get statistics
    const stats = await Payroll.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalPayroll: { $sum: '$netSalary' },
          totalEmployees: { $sum: 1 },
          avgSalary: { $avg: '$netSalary' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        payrolls,
        stats: stats[0] || { totalPayroll: 0, totalEmployees: 0, avgSalary: 0 },
        pagination: {
          total,
          page: Number(page),
          limit: pageLimit,
          totalPages: Math.ceil(total / pageLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPayrollById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const payroll = await Payroll.findById(id).populate('userId', 'name email department position');
    
    if (!payroll) {
      throw new AppError('Payroll not found', 404);
    }

    // Check if user is accessing their own payroll or is HR
    if (
      req.user &&
      req.user._id.toString() !== payroll.userId._id.toString() &&
      req.user.role !== 'hr'
    ) {
      throw new AppError('You can only view your own payroll', 403);
    }

    res.json({
      success: true,
      data: {
        payroll,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayroll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const payroll = await Payroll.findById(id);
    
    if (!payroll) {
      throw new AppError('Payroll not found', 404);
    }

    if (payroll.status === 'Paid') {
      throw new AppError('Cannot update paid payroll', 400);
    }

    const allowedUpdates = ['baseSalary', 'allowances', 'deductions', 'bonus', 'breakdown', 'remarks'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(payroll, updates);
    
    // Recalculate tax
    const grossSalary = payroll.baseSalary + payroll.allowances + payroll.bonus;
    payroll.tax = grossSalary * 0.1;
    
    await payroll.save();

    res.json({
      success: true,
      message: 'Payroll updated successfully',
      data: {
        payroll,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    
    const payroll = await Payroll.findById(id);
    
    if (!payroll) {
      throw new AppError('Payroll not found', 404);
    }

    if (payroll.status === 'Paid') {
      throw new AppError('Payroll already paid', 400);
    }

    payroll.status = 'Paid';
    payroll.paymentDate = new Date();
    payroll.paymentMethod = paymentMethod || 'Bank Transfer';
    
    await payroll.save();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payroll,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generatePayslip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const payroll = await Payroll.findById(id).populate('userId', 'name email employeeId department position');
    
    if (!payroll) {
      throw new AppError('Payroll not found', 404);
    }

    // Check if user is accessing their own payslip or is HR
    if (
      req.user &&
      req.user._id.toString() !== payroll.userId._id.toString() &&
      req.user.role !== 'hr'
    ) {
      throw new AppError('You can only generate your own payslip', 403);
    }

    // In a real application, this would generate a PDF
    // For now, we'll return the data in a structured format
    const payslip = {
      company: {
        name: 'DayFlow Inc.',
        address: '123 Business St, City, State 12345',
      },
      employee: {
        name: payroll.employeeName,
        employeeId: payroll.employeeId,
        department: (payroll.userId as any).department,
        position: (payroll.userId as any).position,
      },
      payPeriod: payroll.month,
      earnings: {
        baseSalary: payroll.baseSalary,
        allowances: payroll.allowances,
        bonus: payroll.bonus,
        gross: payroll.baseSalary + payroll.allowances + payroll.bonus,
      },
      deductions: {
        tax: payroll.tax,
        other: payroll.deductions,
        total: payroll.tax + payroll.deductions,
      },
      netSalary: payroll.netSalary,
      breakdown: payroll.breakdown,
      paymentDate: payroll.paymentDate,
      paymentMethod: payroll.paymentMethod,
    };

    res.json({
      success: true,
      data: {
        payslip,
      },
    });
  } catch (error) {
    next(error);
  }
};
