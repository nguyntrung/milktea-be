import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface IUser extends Document {
  _id: string;
  email: string;
  matKhau: string;
  ten: string;
  soDienThoai?: string;
  diaChi?: string;
  vaiTro: 'user' | 'admin';
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface RegisterInput {
  email: string;
  matKhau: string;
  ten: string;
  soDienThoai?: string;
  diaChi?: string;
}

export interface LoginInput {
  email: string;
  matKhau: string;
}

// Define schema
const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  matKhau: { type: String, required: true },
  ten: { type: String, required: true },
  soDienThoai: { type: String },
  diaChi: { type: String },
  vaiTro: { type: String, enum: ['user', 'admin'], default: 'user' },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ vaiTro: 1 });

export default mongoose.model<IUser>('NguoiDung', userSchema);
