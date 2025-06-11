import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

// Define types
export interface IIngredient extends Document {
  ten: string;
  donViTinh: DonViTinh;
  nhaCungCap: {
    maNhacungCap: string,
    donGia: number
  }[];
  hoatDong: boolean;
  nguyenLieuHaoHut: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface IngredientInput {
  ten: string;
  donViTinh: DonViTinh;
  nhaCungCap: {
    maNhacungCap: string;
    donGia: number;
  }[];
  nguyenLieuHaoHut?: boolean;
}

// Define schema
const ingredientSchema = new Schema<IIngredient>({
  ten: { type: String, required: true, unique: true },
  donViTinh: { type: String, enum: Object.values(DonViTinh), required: true },
  nhaCungCap: [
    {
      maNhacungCap: { type: String, ref: 'NhaCungCap', required: true },
      donGia: { type: Number, required: true },
      _id: false
    }
  ],
  hoatDong: { type: Boolean, default: true },
  nguyenLieuHaoHut: { type: Boolean, default: false },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

ingredientSchema.index({ hoatDong: 1 });
ingredientSchema.index({ 'nhaCungCap.maNhacungCap': 1 });

export default mongoose.model<IIngredient>('NguyenLieu', ingredientSchema);
