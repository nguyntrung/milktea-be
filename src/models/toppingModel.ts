import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh, DonViTinhSchema } from '../types/common';

// Define types
export interface ITopping extends Document {
  _id: string;
  ten: string;
  gia: number;
  donViTinh: DonViTinh;
  soLuongMotPhan: number;
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface ToppingInput {
  ten: string;
  gia: number;
  donViTinh: string;
  soLuongMotPhan?: number;
  hoatDong?: boolean;
}

// Define schema
const toppingSchema = new Schema<ITopping>({
  ten: { 
    type: String, 
    required: [true, 'Tên topping là bắt buộc'],
    trim: true
  },
  gia: { 
    type: Number, 
    required: [true, 'Giá topping là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  donViTinh: {
    type: String, 
    ref: 'DonVi',
    required: [true, 'Đơn vị tính là bắt buộc']
  },
  soLuongMotPhan: { type: Number, default: 1 },
  hoatDong: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Tự động cập nhật ngayCapNhat khi document được cập nhật
toppingSchema.pre('findOneAndUpdate', function() {
  this.set({ ngayCapNhat: new Date() });
});

toppingSchema.index({ hoatDong: 1 });
toppingSchema.index({ ten: 1 });

export default mongoose.model<ITopping>('Topping', toppingSchema);
