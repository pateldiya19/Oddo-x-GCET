import { Response, NextFunction } from 'express';
import User from '../models/User';
import Attendance from '../models/Attendance';
import Leave from '../models/Leave';
import Payroll from '../models/Payroll';
import Notification from '../models/Notification';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getEmployeeDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today },
    });

    // Attendance statistics (this month)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthAttendance = await Attendance.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const attendanceStats = monthAttendance.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Leave balance
    const approvedLeaves = await Leave.find({
      userId: req.user._id,
      status: 'Approved',
      startDate: { $gte: new Date(new Date().getFullYear(), 0, 1) },
    });
    
    const usedLeaves = approvedLeaves.reduce((sum: number, leave: any) => sum + leave.days, 0);
    const totalLeaves = 20; // Should come from settings

    // Pending leave requests
    const pendingLeaves = await Leave.countDocuments({
      userId: req.user._id,
      status: 'Pending',
    });

    // Recent notifications
    const notifications = await Notification.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Current month payroll
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const currentPayroll = await Payroll.findOne({
      userId: req.user._id,
      month: currentMonth,
    });

    res.json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          employeeId: req.user.employeeId,
          department: req.user.department,
          position: req.user.position,
          email: req.user.email,
          avatar: req.user.avatar,
        },
        todayAttendance,
        stats: {
          attendance: {
            present: attendanceStats.Present || 0,
            absent: attendanceStats.Absent || 0,
            leave: attendanceStats.Leave || 0,
            halfDay: attendanceStats['Half-Day'] || 0,
          },
          leaves: {
            total: totalLeaves,
            used: usedLeaves,
            remaining: totalLeaves - usedLeaves,
            pending: pendingLeaves,
          },
          payroll: currentPayroll ? {
            month: currentPayroll.month,
            netSalary: currentPayroll.netSalary,
            status: currentPayroll.status,
          } : null,
        },
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Employee statistics
    const totalEmployees = await User.countDocuments();
    const activeEmployees = await User.countDocuments({ status: 'active' });
    const onLeave = await User.countDocuments({ status: 'on-leave' });

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.find({
      date: { $gte: today },
    });

    const presentToday = todayAttendance.filter((a: any) => a.status === 'Present').length;
    const leaveToday = todayAttendance.filter((a: any) => a.status === 'Leave').length;
    const absentToday = activeEmployees - presentToday - leaveToday;

    // Pending leave requests
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // Recent leave requests
    const recentLeaves = await Leave.find()
      .populate('userId', 'name department')
      .sort({ appliedDate: -1 })
      .limit(5);

    // Department-wise employee count
    const departmentStats = await User.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly attendance trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const attendanceTrend = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Current month payroll summary
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const payrollStats = await Payroll.aggregate([
      { $match: { month: currentMonth } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$netSalary' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          onLeave,
        },
        attendance: {
          today: {
            total: activeEmployees,
            present: presentToday,
            absent: absentToday,
            leave: leaveToday,
          },
          trend: attendanceTrend,
        },
        leaves: {
          pending: pendingLeaves,
          recent: recentLeaves,
        },
        departments: departmentStats,
        payroll: payrollStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate, employeeId, department } = req.query;

    let report: any = {};

    switch (type) {
      case 'attendance':
        report = await generateAttendanceReport(startDate as string, endDate as string, employeeId as string);
        break;
      case 'leave':
        report = await generateLeaveReport(startDate as string, endDate as string, employeeId as string);
        break;
      case 'payroll':
        report = await generatePayrollReport(startDate as string, endDate as string, department as string);
        break;
      case 'employee':
        report = await generateEmployeeReport(department as string);
        break;
      default:
        throw new AppError('Invalid report type', 400);
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions for report generation
async function generateAttendanceReport(startDate: string, endDate: string, employeeId?: string) {
  const query: any = {};
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  if (employeeId) {
    query.employeeId = employeeId;
  }

  const attendance = await Attendance.find(query).sort({ date: -1 });
  
  const summary = await Attendance.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalHours: { $sum: '$hours' },
      },
    },
  ]);

  return {
    type: 'attendance',
    period: { startDate, endDate },
    data: attendance,
    summary,
  };
}

async function generateLeaveReport(startDate: string, endDate: string, employeeId?: string) {
  const query: any = {};
  
  if (startDate || endDate) {
    query.appliedDate = {};
    if (startDate) query.appliedDate.$gte = new Date(startDate);
    if (endDate) query.appliedDate.$lte = new Date(endDate);
  }
  
  if (employeeId) {
    query.employeeId = employeeId;
  }

  const leaves = await Leave.find(query)
    .populate('userId', 'name department')
    .sort({ appliedDate: -1 });
  
  const summary = await Leave.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$leaveType',
        count: { $sum: 1 },
        totalDays: { $sum: '$days' },
      },
    },
  ]);

  return {
    type: 'leave',
    period: { startDate, endDate },
    data: leaves,
    summary,
  };
}

async function generatePayrollReport(startDate: string, endDate: string, department?: string) {
  const query: any = {};
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const payrolls = await Payroll.find(query)
    .populate('userId', 'name department position')
    .sort({ createdAt: -1 });

  let filteredPayrolls = payrolls;
  if (department) {
    filteredPayrolls = payrolls.filter((p: any) => p.userId.department === department);
  }

  const summary = {
    totalEmployees: filteredPayrolls.length,
    totalPayroll: filteredPayrolls.reduce((sum: number, p: any) => sum + p.netSalary, 0),
    avgSalary: filteredPayrolls.length > 0 
      ? filteredPayrolls.reduce((sum: number, p: any) => sum + p.netSalary, 0) / filteredPayrolls.length 
      : 0,
  };

  return {
    type: 'payroll',
    period: { startDate, endDate },
    department,
    data: filteredPayrolls,
    summary,
  };
}

async function generateEmployeeReport(department?: string) {
  const query: any = {};
  
  if (department) {
    query.department = department;
  }

  const employees = await User.find(query).sort({ createdAt: -1 });
  
  const summary = {
    total: employees.length,
    active: employees.filter((e: any) => e.status === 'active').length,
    inactive: employees.filter((e: any) => e.status === 'inactive').length,
    onLeave: employees.filter((e: any) => e.status === 'on-leave').length,
  };

  return {
    type: 'employee',
    department,
    data: employees,
    summary,
  };
}
