import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface ISupplier extends Document {
  _id: string;
  ten: string;
  diaChi: string;
  lienHe: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface SupplierInput {
  ten: string;
  diaChi: string;
  lienHe: string;
}

// Define schema
const supplierSchema = new Schema<ISupplier>({
  ten: { 
    type: String, 
    required: [true, 'Tên nhà cung cấp là bắt buộc'],
    trim: true
  },
  diaChi: { 
    type: String, 
    required: [true, 'Địa chỉ nhà cung cấp là bắt buộc'],
    trim: true
  },
  lienHe: { 
    type: String, 
    required: [true, 'Thông tin liên hệ là bắt buộc'],
    trim: true
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Tự động cập nhật ngayCapNhat khi document được cập nhật
supplierSchema.pre('findOneAndUpdate', function() {
  this.set({ ngayCapNhat: new Date() });
});

supplierSchema.index({ ten: 1 });

export default mongoose.model<ISupplier>('NhaCungCap', supplierSchema);
