import mongoose, { Document, Schema } from 'mongoose';

export interface IPayroll extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  tax: number;
  netSalary: number;
  status: 'Pending' | 'Paid' | 'Failed';
  paymentDate?: Date;
  paymentMethod?: string;
  remarks?: string;
  breakdown: {
    hra?: number;
    travelAllowance?: number;
    medicalAllowance?: number;
    providentFund?: number;
    insurance?: number;
    otherDeductions?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
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
    month: {
      type: String,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    breakdown: {
      hra: { type: Number, default: 0 },
      travelAllowance: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate net salary before saving
payrollSchema.pre<IPayroll>('save', function (this: IPayroll, next: () => void) {
  this.netSalary = this.baseSalary + this.allowances + this.bonus - this.deductions - this.tax;
  next();
});

// Index for faster queries
payrollSchema.index({ userId: 1, month: 1 });
payrollSchema.index({ employeeId: 1, month: 1 });

export default mongoose.model<IPayroll>('Payroll', payrollSchema);
