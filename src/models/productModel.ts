import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  _id: string;
  ten: string;
  moTa: string;
  maDanhMuc: string;
  gia: {
    nho: number;
    vua: number;
    lon: number;
  };
  hinhAnh: string[];
  nguyenLieu: {
    maNguyenLieu: string;
    soLuong: {
      nho: number;
      vua: number;
      lon: number;
    };
    donVi: string;
  }[];
  toppingCoSan: string[];
  toppingCoTheThem: string[];
  tuychon: string[];
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface ProductInput {
  ten: string;
  moTa: string;
  maDanhMuc: string;
  gia: {
    nho: number;
    vua: number;
    lon: number;
  };
  hinhAnh: string[];
  nguyenLieu: {
    maNguyenLieu: string;
    soLuong: {
      nho: number;
      vua: number;
      lon: number;
    };
    donVi: string;
  }[];
  toppingCoSan?: string[];
  toppingCoTheThem?: string[];
  tuychon?: string[];
  hoatDong?: boolean;
}

const productSchema = new Schema<IProduct>({
  ten: { type: String, required: true },
  moTa: { type: String, required: true },
  maDanhMuc: { type: String, ref: 'DanhMuc', required: true },
  gia: {
    nho: { type: Number, required: true },
    vua: { type: Number, required: true },
    lon: { type: Number, required: true },
  },
  hinhAnh: [{ type: String }],
  nguyenLieu: [
    {
      maNguyenLieu: { type: String, ref: 'NguyenLieu', required: true },
      soLuong: {
        nho: { type: Number, required: true },
        vua: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
      donVi: { type: String, required: true },
    },
  ],
  toppingCoSan: [{ type: String, ref: 'Topping' }],
  toppingCoTheThem: [{ type: String, ref: 'Topping' }],
  tuychon: [{ type: String, enum: ['da', 'duong', 'sua'], default: ['da', 'duong', 'sua'] }],
  hoatDong: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

productSchema.index({ maDanhMuc: 1 });
productSchema.index({ hoatDong: 1 });

export default mongoose.model<IProduct>('SanPham', productSchema);
