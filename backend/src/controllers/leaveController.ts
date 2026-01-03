import { Response, NextFunction } from 'express';
import Leave from '../models/Leave';
import Attendance from '../models/Attendance';
import Notification from '../models/Notification';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { calculateLeaveDays, paginate, getDateRange } from '../utils/helpers';

export const createLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      throw new AppError('End date must be after start date', 400);
    }

    const days = calculateLeaveDays(start, end);

    const leave = await Leave.create({
      userId: req.user._id,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      reason,
    });

    // Create notification for HR/managers
    // This is simplified - in production, you'd notify specific HR users
    await Notification.create({
      userId: req.user._id,
      title: 'Leave Request Submitted',
      message: `Your leave request for ${days} day(s) has been submitted`,
      type: 'info',
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: {
        leave,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaveRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { status, page = 1, limit = 10 } = req.query;
    
    const query: any = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const { skip, limit: pageLimit } = paginate(Number(page), Number(limit));
    
    const leaves = await Leave.find(query)
      .skip(skip)
      .limit(pageLimit)
      .sort({ appliedDate: -1 });
    
    const total = await Leave.countDocuments(query);

    // Calculate leave balance
    const approvedLeaves = await Leave.find({
      userId: req.user._id,
      status: 'Approved',
    });
    
    const totalLeaveDays = approvedLeaves.reduce((sum: number, leave: any) => sum + leave.days, 0);
    const annualLeaveAllowance = 20; // This should come from employee settings
    const remainingLeaves = annualLeaveAllowance - totalLeaveDays;

    res.json({
      success: true,
      data: {
        leaves,
        balance: {
          total: annualLeaveAllowance,
          used: totalLeaveDays,
          remaining: remainingLeaves,
        },
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

export const getAllLeaveRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, employeeId, page = 1, limit = 20 } = req.query;
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (employeeId) {
      query.employeeId = employeeId;
    }

    const { skip, limit: pageLimit } = paginate(Number(page), Number(limit));
    
    const leaves = await Leave.find(query)
      .populate('userId', 'name email department')
      .skip(skip)
      .limit(pageLimit)
      .sort({ appliedDate: -1 });
    
    const total = await Leave.countDocuments(query);

    // Get statistics
    const stats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$days' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        leaves,
        stats,
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

export const updateLeaveStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { id } = req.params;
    const { status, remarks } = req.body;

    const leave = await Leave.findById(id);
    
    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'Pending') {
      throw new AppError('Leave request has already been processed', 400);
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedDate = new Date();
    if (remarks) leave.remarks = remarks;
    
    await leave.save();

    // If approved, mark attendance as leave for those dates
    if (status === 'Approved') {
      const dates = getDateRange(
        leave.startDate.toISOString().split('T')[0],
        leave.endDate.toISOString().split('T')[0]
      );

      for (const date of dates) {
        await Attendance.findOneAndUpdate(
          {
            userId: leave.userId,
            date: { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) },
          },
          {
            userId: leave.userId,
            employeeId: leave.employeeId,
            employeeName: leave.employeeName,
            date,
            status: 'Leave',
            remarks: `${leave.leaveType} leave`,
          },
          { upsert: true }
        );
      }
    }

    // Create notification for employee
    await Notification.create({
      userId: leave.userId,
      title: `Leave Request ${status}`,
      message: `Your leave request has been ${status.toLowerCase()}`,
      type: status === 'Approved' ? 'success' : 'error',
    });

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: {
        leave,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLeaveRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { id } = req.params;

    const leave = await Leave.findById(id);
    
    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    // Only allow deletion if it's pending and belongs to the user
    if (leave.userId.toString() !== req.user._id.toString()) {
      throw new AppError('You can only delete your own leave requests', 403);
    }

    if (leave.status !== 'Pending') {
      throw new AppError('Only pending leave requests can be deleted', 400);
    }

    await leave.deleteOne();

    res.json({
      success: true,
      message: 'Leave request deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaveStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leaveTypeStats = await Leave.aggregate([
      { $match: { status: 'Approved' } },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$days' },
        },
      },
    ]);

    const monthlyStats = await Leave.aggregate([
      {
        $match: {
          status: 'Approved',
          startDate: { $gte: new Date(new Date().getFullYear(), 0, 1) },
        },
      },
      {
        $group: {
          _id: { $month: '$startDate' },
          count: { $sum: 1 },
          totalDays: { $sum: '$days' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        leaveTypeStats,
        monthlyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
