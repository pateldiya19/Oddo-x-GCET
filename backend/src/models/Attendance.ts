import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  employeeName: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'Present' | 'Absent' | 'Leave' | 'Half-Day';
  hours: number;
  location?: {
    checkIn?: { latitude: number; longitude: number };
    checkOut?: { latitude: number; longitude: number };
  };
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      uppercase: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Half-Day'],
      default: 'Absent',
    },
    hours: {
      type: Number,
      default: 0,
      min: 0,
      max: 24,
    },
    location: {
      checkIn: {
        latitude: Number,
        longitude: Number,
      },
      checkOut: {
        latitude: Number,
        longitude: Number,
      },
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
attendanceSchema.index({ userId: 1, date: -1 });
attendanceSchema.index({ employeeId: 1, date: -1 });

export default mongoose.model<IAttendance>('Attendance', attendanceSchema);
