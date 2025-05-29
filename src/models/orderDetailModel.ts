import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDetail extends Document {
  _id: string;
  maHoaDon: string;
  maSanPham: string;
  donGia: number;
  soLuong: number;
  kichCo: {
    tenSize: string;
    giaTang: number;
  };
  hinhAnh: string;
  tuyChon: string[];
  topping: {
    maTopping: string;
    gia: number;
    soLuong: number;
  }[];
  thanhTien: number;
  ghiChu: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface OrderDetailInput {
  maHoaDon: string;
  maSanPham: string;
  soLuong: number;
  kichCo: {
    tenSize: string;
    giaTang: number;
  };
  tuyChon: string[];
  topping: {
    maTopping: string;
    soLuong: number;
  }[];
  ghiChu?: string;
}

const orderDetailSchema = new Schema<IOrderDetail>({
  maHoaDon: { type: String, ref: 'DonHang', required: true },
  maSanPham: { type: String, ref: 'SanPham', required: true },
  donGia: { type: Number, required: true },
  soLuong: { type: Number, required: true },
  kichCo: {
    tenSize: { type: String, required: true },
    giaTang: { type: Number, required: true },
  },
  hinhAnh: { type: String},
  tuyChon: [{ type: String }],
  topping: [
    {
      maTopping: { type: String, ref: 'Topping', required: true },
      gia: { type: Number, required: true },
      soLuong: { type: Number, default: 1 },
    },
  ],
  thanhTien: { type: Number, required: true },
  ghiChu: { type: String },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

orderDetailSchema.index({ maHoaDon: 1 });
orderDetailSchema.index({ maSanPham: 1 });

export default mongoose.model<IOrderDetail>('ChiTietDonHang', orderDetailSchema);
