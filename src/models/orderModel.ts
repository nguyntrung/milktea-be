import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  maNguoiDung: string;
  sanPham: {
    maSanPham: string;
    kichCo: {
      nho: number;
      vua: number;
      lon: number;
    };
    doNgot: {
      it: number;
      vua: number;
      nhieu: number;
    };
    luongDa: {
      it: number;
      vua: number;
      nhieu: number;
    };
    topping: string[];
    soLuong: number;
    gia: number;
  }[];
  tongGia: number;
  giamGia?: {
    maKhuyenMai: string;
    soTien: number;
  };
  trangThai: {
    choXuLy: number;
    dangChuanBi: number;
    dangGiao: number;
    daGiao: number;
    daHuy: number;
  };
  diaChiGiaoHang: string;
  phuongThucThanhToan: {
    theTinDung: number;
    momo: number;
    zalopay: number;
    vnpay: number;
    cod: number;
  };
  ghiChu: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

const orderSchema = new Schema<IOrder>({
  maNguoiDung: { type: String, ref: 'NguoiDung', required: true },
  sanPham: [
    {
      maSanPham: { type: String, ref: 'SanPham', required: true },
      kichCo: {
        nho: { type: Number, required: true },
        vua: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
      doNgot: {
        it: { type: Number, required: true },
        vua: { type: Number, required: true },
        nhieu: { type: Number, required: true },
      },
      luongDa: {
        it: { type: Number, required: true },
        vua: { type: Number, required: true },
        nhieu: { type: Number, required: true },
      },
      topping: [{ type: String, ref: 'Topping' }],
      soLuong: { type: Number, required: true },
      gia: { type: Number, required: true },
    },
  ],
  tongGia: { type: Number, required: true },
  giamGia: {
    maKhuyenMai: { type: String, ref: 'KhuyenMai' },
    soTien: { type: Number },
  },
  trangThai: {
    choXuLy: { type: Number, default: 0 },
    dangChuanBi: { type: Number, default: 0 },
    dangGiao: { type: Number, default: 0 },
    daGiao: { type: Number, default: 0 },
    daHuy: { type: Number, default: 0 },
  },
  diaChiGiaoHang: { type: String, required: true },
  phuongThucThanhToan: {
    theTinDung: { type: Number, default: 0 },
    momo: { type: Number, default: 0 },
    zalopay: { type: Number, default: 0 },
    vnpay: { type: Number, default: 0 },
    cod: { type: Number, default: 0 },
  },
  ghiChu: {type: String},
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

orderSchema.index({ maNguoiDung: 1 });
orderSchema.index({ 'trangThai.choXuLy': 1 });
orderSchema.index({ ngayTao: 1 });

export default mongoose.model<IOrder>('DonHang', orderSchema);
