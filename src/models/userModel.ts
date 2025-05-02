import mongoose, { Schema, Document } from 'mongoose';
import { VaiTro, GioiTinh } from '../types/common';

// Define types
export interface IUser extends Document {
  _id: string;
  email: string;
  matKhau: string;
  ten: string;
  ngaySinh?: Date;
  gioiTinh?: GioiTinh;
  soDienThoai?: string;
  diaChi?: string;
  diemTichLuy: number;
  lichSuDiem?: {
    thoiGian: Date;
    diem: number;
    noiDung: string;
    diemConLai: number;
  }[];
  vaiTro: VaiTro;
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface RegisterInput {
  email: string;
  matKhau: string;
  ten: string;
  ngaySinh?: Date;
  soDienThoai?: string;
  diaChi?: string;
}

export interface LoginInput {
  email: string;
  matKhau: string;
}

// Define schema
const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  matKhau: { 
    type: String, 
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  ten: { 
    type: String, 
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Tên không được vượt quá 50 ký tự']
  },
  ngaySinh: { 
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v <= new Date();
      },
      message: 'Ngày sinh không hợp lệ'
    }
  },
  gioiTinh: {
    type: String,
    enum: Object.values(GioiTinh),
    default: GioiTinh.KHAC
  },
  soDienThoai: { 
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Số điện thoại không hợp lệ']
  },
  diaChi: { 
    type: String,
    trim: true
  },
  diemTichLuy: { 
    type: Number, 
    default: 0,
    min: [0, 'Điểm tích lũy không được âm']
  },
  lichSuDiem: [{
    thoiGian: { type: Date, default: Date.now },
    diem: { type: Number, required: true },
    noiDung: { type: String, required: true },
    diemConLai: { type: Number, required: true }
  }],
  vaiTro: { 
    type: String, 
    enum: Object.values(VaiTro),
    default: VaiTro.USER
  },
  hoatDong: { 
    type: Boolean, 
    default: true
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Middleware
userSchema.pre('save', function(next) {
  this.ngayCapNhat = new Date();
  next();
});

userSchema.pre('findOneAndUpdate', function() {
  this.set({ ngayCapNhat: new Date() });
});

// Methods
userSchema.methods.themDiem = function(diem: number, noiDung: string) {
  const diemMoi = this.diemTichLuy + diem;
  if (diemMoi < 0) {
    throw new Error('Không đủ điểm để trừ');
  }
  
  if (!this.lichSuDiem) {
    this.lichSuDiem = [];
  }
  
  this.lichSuDiem.push({
    thoiGian: new Date(),
    diem: diem,
    noiDung: noiDung,
    diemConLai: diemMoi
  });
  
  this.diemTichLuy = diemMoi;
  return this.save();
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ vaiTro: 1 });
userSchema.index({ trangThai: 1 });
userSchema.index({ diemTichLuy: -1 });

export default mongoose.model<IUser>('NguoiDung', userSchema);
