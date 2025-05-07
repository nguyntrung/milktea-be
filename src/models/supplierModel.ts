import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface ISupplier extends Document {
  _id: string;
  ten: string;
  diaChi: string;
  lienHe: string;
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface SupplierInput {
  ten: string;
  diaChi: string;
  lienHe: string;
}

// Define schema
const supplierSchema = new Schema<ISupplier>({
  ten: { type: String, required: true },
  diaChi: { type: String, required: true },
  lienHe: { type: String, required: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

supplierSchema.index({ ten: 1 });

export default mongoose.model<ISupplier>('NhaCungCap', supplierSchema);
