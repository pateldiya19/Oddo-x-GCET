import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { paginate } from '../utils/helpers';

export const getAllEmployees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search, department, status } = req.query;
    
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }

    const { skip, limit: pageLimit } = paginate(Number(page), Number(limit));
    
    const employees = await User.find(query)
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        employees,
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

export const getEmployeeById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const employee = await User.findById(id);
    
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    res.json({
      success: true,
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeId, name, email, password, department, position, role, salary, phone, address } = req.body;

    const existingEmployee = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingEmployee) {
      throw new AppError('Employee with this email or employee ID already exists', 400);
    }

    const employee = await User.create({
      employeeId,
      name,
      email,
      password,
      department,
      position,
      role: role || 'employee',
      salary,
      phone,
      address,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const employee = await User.findById(id);
    
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const allowedUpdates = ['name', 'department', 'position', 'role', 'salary', 'phone', 'address', 'status'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    Object.assign(employee, updates);
    await employee.save();

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const employee = await User.findById(id);
    
    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    // Soft delete by setting status to inactive
    employee.status = 'inactive';
    await employee.save();

    res.json({
      success: true,
      message: 'Employee deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalEmployees = await User.countDocuments();
    const activeEmployees = await User.countDocuments({ status: 'active' });
    const inactiveEmployees = await User.countDocuments({ status: 'inactive' });
    const onLeave = await User.countDocuments({ status: 'on-leave' });

    const departmentStats = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
          onLeave,
        },
        departmentStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
