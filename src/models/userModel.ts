import mongoose, { Schema, Document } from 'mongoose';
import { GioiTinh, VaiTro, LoaiGiaoDich } from '../types/common';

// Define types
export interface IUser extends Document {
  _id: string;
  email: string;
  matKhau: string;
  ten: string;
  ngaySinh: Date;
  gioiTinh: GioiTinh;
  soDienThoai?: string;
  diemTichLuy: number;
  lichSuDiem: {
    thoiGian: Date;
    diem: number;
    noiDung: string;
    diemConLai: number;
    loaiGiaoDich: LoaiGiaoDich;
  }[];
  diaChi?: string;
  khuyenMaiDaSuDung: string[];
  hoatDong: boolean;
  vaiTro: VaiTro;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface RegisterInput {
  email: string;
  matKhau: string;
  ten: string;
  ngaySinh: Date;
  gioiTinh: GioiTinh;
  soDienThoai?: string;
  vaiTro?: VaiTro;
}

export interface LoginInput {
  email: string;
  matKhau: string;
}

// Define schema
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  matKhau: { type: String, required: true },
  ten: { type: String },
  ngaySinh: { type: Date },
  gioiTinh: { type: String, enum: Object.values(GioiTinh) },
  soDienThoai: { type: String },
  diemTichLuy: { type: Number, default: 0 },
  lichSuDiem: [
    {
      thoiGian: { type: Date, default: Date.now },
      diem: { type: Number, required: false },
      noiDung: { type: String, required: false },
      diemConLai: { type: Number, required: false },
      loaiGiaoDich: { type: String, enum: Object.values(LoaiGiaoDich), required: false },
    },
  ],
  diaChi: { type: String },
  khuyenMaiDaSuDung: [{ type: String, ref: 'KhuyenMai' }],
  hoatDong: { type: Boolean, default: true },
  vaiTro: { type: String, enum: Object.values(VaiTro), default: VaiTro.USER },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

userSchema.index({ vaiTro: 1 });
userSchema.index({ hoatDong: 1 });
userSchema.index({ diemTichLuy: 1 });

export default mongoose.model<IUser>('NguoiDung', userSchema);
