import mongoose, { Schema, Document } from 'mongoose';
import { TrangThaiDonDatNguyenLieu } from '../types/common';

export interface IOrderIngredient extends Document {
  maNhaCungCap: string;
  ngayDat: Date;
  nguoiDat: {
    ma: string;
    ten: string;
  };
  ngayNhap?: Date;
  nguoiNhap?: {
    ma: string;
    ten: string;
  };
  thoiGianCanGiao: Date;
  nguyenLieu: string[];
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
  nguyenLieu: string[];
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
  nguyenLieu: [{ type: Schema.Types.ObjectId, ref: 'NguyenLieu', required: true }],
  tongTien: { type: Number, required: false },
  ngayNhap: { type: Date, default: Date.now },
  trangThai: {
    type: String,
    enum: Object.values(TrangThaiDonDatNguyenLieu),
    required: true,
  },
  ghiChu: { type: String },
  nguoiDat: {
    ma: { type: String, required: true },
    ten: { type: String, required: true }
  },
  nguoiNhap: {
    ma: { type: String },
    ten: { type: String }
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

export default mongoose.model<IOrderIngredient>('DonDatNguyenLieu', orderIngredientSchema);