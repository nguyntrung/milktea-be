import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

// Define types
export interface IIngredient extends Document {
  _id: string;
  ten: string;
  donViTinh: DonViTinh;
  maNhaCungCap: string | string[];
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface IngredientInput {
  ten: string;
  donViTinh: DonViTinh;
  maNhaCungCap: string | string[];
}

// Define schema
const ingredientSchema = new Schema<IIngredient>({
  ten: { type: String, required: true, unique: true },
  donViTinh: { type: String, enum: Object.values(DonViTinh), required: true },
  maNhaCungCap: { type: [String], ref: 'NhaCungCap', required: true },
  hoatDong: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

ingredientSchema.index({ ten: 1 }, { unique: true });
ingredientSchema.index({ hoatDong: 1 });
ingredientSchema.index({ maNhaCungCap: 1 });

export default mongoose.model<IIngredient>('NguyenLieu', ingredientSchema);
