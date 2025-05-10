import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

export interface IProduct extends Document {
  _id: string;
  ten: string;
  moTa?: string;
  maDanhMuc: string;
  giaCoBan: number;
  luaChonSize: {
    tenSize: string;
    giaTang: number;
    thanhPhan: {
      maNguyenLieu: string;
      soLuong: number;
      donViTinh: DonViTinh;
    }[];
  }[];
  hinhAnh?: string[];
  toppingCoTheThem?: string[];
  tuychon: string[];
  congThuc?: string;
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface ProductInput {
  ten: string;
  moTa?: string;
  maDanhMuc: string;
  giaCoBan: number;
  luaChonSize: {
    tenSize: string;
    giaTang: number;
    thanhPhan: {
      maNguyenLieu: string;
      soLuong: number;
      donViTinh: 'KG' | 'GRAM' | 'LITER' | 'ML' | 'CAI';
    }[];
  }[];
  hinhAnh?: string[];
  toppingCoTheThem?: string[];
  tuychon?: string[];
  congThuc?: string;
  hoatDong?: boolean;
}

const productSchema = new Schema<IProduct>({
  ten: { type: String, required: true },
  moTa: { type: String },
  maDanhMuc: { type: String, ref: 'DanhMuc', required: true },
  giaCoBan: { type: Number, required: true },
  luaChonSize: [
    {
      tenSize: { type: String, required: true },
      giaTang: { type: Number, required: true },
      thanhPhan: [
        {
          maNguyenLieu: { type: String, ref: 'NguyenLieu', required: true },
          soLuong: { type: Number, required: true },
          donViTinh: { type: String, enum: ['KG', 'GRAM', 'LITER', 'ML', 'CAI'], required: true },
        },
      ],
    },
  ],
  hinhAnh: [{ type: String }],
  toppingCoTheThem: [{ type: String, ref: 'Topping' }],
  tuychon: [{ type: String, enum: ['Đá', 'Đường', 'Sữa'], default: ['Đá', 'Đường', 'Sữa'] }],
  congThuc: { type: String },
  hoatDong: { type: Boolean, required: true, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

productSchema.index({ maDanhMuc: 1 });
productSchema.index({ hoatDong: 1 });

export default mongoose.model<IProduct>('SanPham', productSchema);
