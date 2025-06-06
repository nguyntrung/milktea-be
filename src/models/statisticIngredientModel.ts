import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

export interface IstatisticIngredient extends Document {
  _id: string;
  ngay: Date;
  maNguyenLieu: string;
  tenNguyenLieu: string;
  donViTinh: DonViTinh;
  soLuongBan: number;
  soLuongNhap: number;
  soLuongHaoHut: number;
  soLuongTon: number;
  ngayTao: Date;
  ngayCapNhat: Date;
}
const statisticIngredientSchema = new Schema<IstatisticIngredient>({
  ngay: { type: Date, required: true },
  maNguyenLieu: { type: String, ref: 'NguyenLieu', required: true },
  tenNguyenLieu: { type: String, required: true },
  donViTinh: { type: String, enum: Object.values(DonViTinh), required: true },
  soLuongBan: { type: Number, default: 0, required: true },
  soLuongNhap: { type: Number, default: 0, required: true },
  soLuongHaoHut: { type: Number, default: 0, required: true },
  soLuongTon: { type: Number, default: 0, required: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});


statisticIngredientSchema.index({ ngay: 1 });
statisticIngredientSchema.index({ maNguyenLieu: 1 });

export default mongoose.model<IstatisticIngredient>('ThongKeNguyenLieu', statisticIngredientSchema);