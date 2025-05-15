import mongoose, { Schema, Document } from 'mongoose';
import { TrangThaiDonDatNguyenLieu } from '../types/common';

export interface IOrderIngredient extends Document {
  maNhaCungCap: string;
  ngayDat: Date;
  nguoiDat: string;
  ngayNhap?: Date;
  nguoiNhap?: string;
  thoiGianCanGiao: Date;
  nguyenLieu: [
    {
      maNguyenLieu: string
      soLuong: number,
      donGia: number,
      thanhTien: number,
    },
  ],
  trangThai: TrangThaiDonDatNguyenLieu;
  tongTien: number;
  ghiChu?: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface OrderIngredientInput {
  maNhaCungCap: string;
  nguoiDat: string;
  ngayDat: Date;
  thoiGianCanGiao: Date;
  nguyenLieu: {
    maNguyenLieu: string;
    soLuong: number;
    donGia: number;
  }[];
  ngayNhap?: Date;
  nguoiNhap?: string;
  trangThai: TrangThaiDonDatNguyenLieu
  ghiChu?: string;
}

// Define schema
const orderIngredientSchema = new Schema<IOrderIngredient>({
  maNhaCungCap: { type: String, ref: 'NhaCungCap' ,required: true },
  ngayDat: { type: Date, default: Date.now },
  thoiGianCanGiao: { type: Date, default: Date.now },
  nguyenLieu: [{
    maNguyenLieu: { type: String, required: true },
    soLuong: { type: Number, required: true },
    donGia: { type: Number, required: false },
    thanhTien: { type: Number, required: false },
  }],
  tongTien: { type: Number, required: false },
  ngayNhap: { type: Date, default: Date.now },
  trangThai: {
    type: String,
    enum: Object.values(TrangThaiDonDatNguyenLieu),
    required: true,
  },
  ghiChu: { type: String },
  nguoiDat: { type: String, required: true },
  nguoiNhap: { type: String},
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

export default mongoose.model<IOrderIngredient>('DonDatNguyenLieu', orderIngredientSchema);