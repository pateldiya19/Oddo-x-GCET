import { Response, NextFunction } from 'express';
import Attendance from '../models/Attendance';
import User from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { calculateWorkHours, paginate } from '../utils/helpers';

export const checkIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today },
    });

    if (existingAttendance && existingAttendance.checkIn) {
      throw new AppError('Already checked in today', 400);
    }

    const checkInTime = new Date();
    const { latitude, longitude } = req.body;

    const attendance = existingAttendance || new Attendance({
      userId: req.user._id,
      employeeId: req.user.employeeId,
      employeeName: req.user.name,
      date: today,
    });

    attendance.checkIn = checkInTime;
    attendance.status = 'Present';
    
    if (latitude && longitude) {
      attendance.location = {
        ...attendance.location,
        checkIn: { latitude, longitude },
      };
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today },
    });

    if (!attendance || !attendance.checkIn) {
      throw new AppError('Please check in first', 400);
    }

    if (attendance.checkOut) {
      throw new AppError('Already checked out today', 400);
    }

    const checkOutTime = new Date();
    const { latitude, longitude } = req.body;

    attendance.checkOut = checkOutTime;
    attendance.hours = calculateWorkHours(attendance.checkIn, checkOutTime);
    
    // Determine status based on hours worked
    if (attendance.hours >= 8) {
      attendance.status = 'Present';
    } else if (attendance.hours >= 4) {
      attendance.status = 'Half-Day';
    }

    if (latitude && longitude) {
      attendance.location = {
        ...attendance.location,
        checkOut: { latitude, longitude },
      };
    }

    await attendance.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { startDate, endDate, page = 1, limit = 31 } = req.query;
    
    const query: any = { userId: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const { skip, limit: pageLimit } = paginate(Number(page), Number(limit));
    
    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId')
      .skip(skip)
      .limit(pageLimit)
      .sort({ date: -1 });
    
    const total = await Attendance.countDocuments(query);

    // Calculate statistics
    const stats = await Attendance.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = stats.reduce((acc: Record<string, number>, curr: any) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as any);

    res.json({
      success: true,
      data: {
        attendance,
        stats: {
          present: statsMap.Present || 0,
          absent: statsMap.Absent || 0,
          leave: statsMap.Leave || 0,
          halfDay: statsMap['Half-Day'] || 0,
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

export const getAllAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, employeeId, status, page = 1, limit = 50 } = req.query;
    
    const query: any = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    
    if (employeeId) {
      query.employeeId = employeeId;
    }
    
    if (status) {
      query.status = status;
    }

    const { skip, limit: pageLimit } = paginate(Number(page), Number(limit));
    
    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId')
      .skip(skip)
      .limit(pageLimit)
      .sort({ date: -1 });
    
    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: {
        attendance,
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

export const getTodayAttendance = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: { $gte: today },
    })
      .populate('userId', 'name email employeeId')
      .sort({ checkIn: -1 });

    const stats = {
      total: await User.countDocuments({ status: 'active' }),
      present: attendance.filter((a: any) => a.status === 'Present').length,
      absent: 0,
      leave: attendance.filter((a: any) => a.status === 'Leave').length,
      halfDay: attendance.filter((a: any) => a.status === 'Half-Day').length,
    };
    
    stats.absent = stats.total - stats.present - stats.leave - stats.halfDay;

    res.json({
      success: true,
      data: {
        attendance,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTodayAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: today },
    });

    res.json({
      success: true,
      data: {
        attendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, date, remarks } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      userId,
      date: attendanceDate,
    });

    if (existingAttendance) {
      existingAttendance.status = 'Leave';
      existingAttendance.remarks = remarks;
      await existingAttendance.save();
    } else {
      await Attendance.create({
        userId,
        employeeId: user.employeeId,
        employeeName: user.name,
        date: attendanceDate,
        status: 'Leave',
        remarks,
      });
    }

    res.json({
      success: true,
      message: 'Leave marked successfully',
    });
  } catch (error) {
    next(error);
  }
};
