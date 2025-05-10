import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

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
  donViTinh: DonViTinh;
  soLuongMotPhan: number;
}

// Define schema
const toppingSchema = new Schema<ITopping>({
  ten: { type: String, required: true, unique: true },
  gia: { type: Number, required: true, min: 0 },
  donViTinh: { type: String, enum: Object.values(DonViTinh), required: true },
  soLuongMotPhan: { type: Number, required: true, min: 0 },
  hoatDong: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

toppingSchema.index({ hoatDong: 1 });
toppingSchema.index({ gia: 1 });

export default mongoose.model<ITopping>('Topping', toppingSchema);
