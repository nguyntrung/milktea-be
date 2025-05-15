import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderIngredientDetail extends Document {
  maDonDat: string;
  maNguyenLieu: string;
  soLuong: number;
  donGia: number; 
  thanhTien: number;
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
  maNguyenLieu: { type: String, required: true },
  soLuong: { type: Number, required: true },
  donGia: { type: Number, required: true },
  thanhTien: { type: Number, required: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now }
});

export default mongoose.model<IOrderIngredientDetail>('ChiTietDonDatNguyenLieu', OrderIngredientDetailSchema);
