import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface IStore extends Document {
  logo: string;
  ten: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  website: string;
  ngayCapNhat: Date;
}

export interface StoreInput {
  logo?: string;
  ten: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  website: string;
}

// Define schema
const storeSchema = new Schema<IStore>({
  logo: { type: String, default: '' }, // URL của logo
  ten: { type: String, required: true },
  diaChi: { type: String, required: true },
  soDienThoai: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String, required: true },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Đảm bảo chỉ có một bản ghi (singleton)
storeSchema.index({ ten: 1 }, { unique: true });

export default mongoose.model<IStore>('ThongTinCuaHang', storeSchema);
