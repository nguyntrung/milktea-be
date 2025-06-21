import mongoose, { Schema, Document } from 'mongoose';

export interface IUserVerify extends Document {
  _id: string;
  maNguoiDung: string;
  email: string;
  tenNguoiDung?: string;
  OTP: string;
  daXacNhan: boolean;
  soLanThu: number;
  thoiGianXacNhan: Date;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface UserVerifyInput {
  OTP: string;
}

const userVerifySchema = new Schema<IUserVerify>({
  maNguoiDung: { type: String, ref: 'NguoiDung', required: true },
  email: { type: String, ref: 'NguoiDung', required: true },
  tenNguoiDung: { type: String },
  OTP: { type: String, required: true },
  daXacNhan: { type: Boolean, default: false },
  soLanThu: { type: Number, default: 0 },
  thoiGianXacNhan: { type: Date, default: Date.now },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

export default mongoose.model<IUserVerify>('XacThucNguoiDung', userVerifySchema);
