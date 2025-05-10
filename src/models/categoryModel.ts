import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface ICategory extends Document {
  _id: string;
  ten: string;
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface CategoryInput {
  ten: string;
}

// Define schema
const categorySchema = new Schema<ICategory>({
  ten: { type: String, required: true, unique: true },
  hoatDong: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

categorySchema.index({ hoatDong: 1 });

export default mongoose.model<ICategory>('DanhMuc', categorySchema);
