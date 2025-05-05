import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface IIngredient extends Document {
  _id: string;
  ten: string;
  soLuong: {
    thoiGian: Date;
    soLuongTon: number;
  }[];
  donVi: string;
  nguongCanhBao: number;
  maNhaCungCap: string | string[];
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface IngredientInput {
  ten: string;
  donVi: string;
  nguongCanhBao: number;
  maNhaCungCap: string | string[];
}

// Define schema
const ingredientSchema = new Schema<IIngredient>({
  ten: { type: String, required: true },
  soLuong: [
    {
      thoiGian: { type: Date, required: true },
      soLuongTon: { type: Number, required: true }
    }
  ],
  donVi: { type: String, required: true },
  nguongCanhBao: { type: Number, required: true },
  maNhaCungCap: { type: [String], ref: 'NhaCungCap', required: true },  // Cập nhật để nhận mảng String
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

ingredientSchema.index({ ten: 1 });
ingredientSchema.index({ 'soLuong.soLuongTon': 1 }); // Nếu cần tìm kiếm theo số lượng tồn

export default mongoose.model<IIngredient>('NguyenLieu', ingredientSchema);
