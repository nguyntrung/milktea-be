import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderIngredient extends Document {
  _id: string;
  maNhaCungCap: string;
  ngayDat: Date;
  thoiGianCanGiao: Date;
  nguyenLieu: {
    maNguyenLieu: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
  }[];
  tongTien: number;
  ngayNhap?: Date;
  trangThai: 'DATAO' | 'DAXACNHAN' | 'DAGIAO' | 'DATHANHTOAN';
  ghiChu?: string;
  nguoiDat: string;
  nguoiNhap?: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface OrderIngredientInput {
  maNhaCungCap: string;
  ngayDat: Date;
  thoiGianCanGiao: Date;
  nguyenLieu: {
    maNguyenLieu: string;
    soLuong: number;
  }[];
  trangThai: 'DATAO' | 'DAXACNHAN' | 'DAGIAO' | 'DATHANHTOAN';
  ghiChu?: string;
  nguoiDat: string;
}

// Define schema
const orderIngredientSchema = new Schema<IOrderIngredient>({
  maNhaCungCap: { type: String, required: true },
  ngayDat: { type: Date, default: Date.now },
  thoiGianCanGiao: { type: Date, default: Date.now },
  nguyenLieu: [
    {
      maNguyenLieu: { type: String, required: true },
      soLuong: { type: Number, required: true },
      donGia: { type: Number, required: false },
      thanhTien: { type: Number, required: false },
    },
  ],
  tongTien: { type: Number, required: false },
  ngayNhap: { type: Date },
  trangThai: {
    type: String,
    enum: ['DATAO', 'DAXACNHAN', 'DAGIAO', 'DATHANHTOAN'],
    required: true,
  },
  ghiChu: { type: String },
  nguoiDat: { type: String, required: true },
  nguoiNhap: { type: String },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

export default mongoose.model<IOrderIngredient>('DonDatNguyenLieu', orderIngredientSchema);