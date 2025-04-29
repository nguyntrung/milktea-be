import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface IIngredient extends Document {
  _id: string;
  ten: string;
  soLuongTon: number;
  donVi: string;
  nguongCanhBao: number;
  maNhaCungCap: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface IngredientInput {
  ten: string;
  soLuongTon: number;
  donVi: string;
  nguongCanhBao: number;
  maNhaCungCap: string;
}

// Define schema
const ingredientSchema = new Schema<IIngredient>({
  ten: { type: String, required: true },
  soLuongTon: { type: Number, required: true },
  donVi: { type: String, required: true },
  nguongCanhBao: { type: Number, required: true },
  maNhaCungCap: { type: String, ref: 'NhaCungCap', required: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

ingredientSchema.index({ soLuongTon: 1 });
ingredientSchema.index({ ten: 1 });

export default mongoose.model<IIngredient>('NguyenLieu', ingredientSchema);
