import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

export interface IOrderIngredientDetail extends Document {
  maDonDat: string;
  maNguyenLieu: string;
  tenNguyenLieu: string;
  soLuong: number;
  donGia: number; 
  thanhTien: number;
  donViTinh: DonViTinh;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface OrderIngredientDetailInput {
  maDonDat: string;
  maNguyenLieu: string;
  soLuong: number;
  donGia: number;
}

const OrderIngredientDetailSchema: Schema = new Schema<IOrderIngredientDetail>({
  maDonDat: { type: String, ref: 'DonDatNguyenLieu', required: true },
  maNguyenLieu: { type: String, ref: 'NguyenLieu', required: true },
  tenNguyenLieu: { type: String, required: true },
  soLuong: { type: Number, required: true },
  donGia: { type: Number, required: true },
  thanhTien: { type: Number, required: true },
  donViTinh: { type: String, enum: Object.values(DonViTinh), required: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now }
});

export default mongoose.model<IOrderIngredientDetail>('ChiTietDonDatNguyenLieu', OrderIngredientDetailSchema);
