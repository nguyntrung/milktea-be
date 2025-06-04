import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface IBanner extends Document {
  _id: string;
  hinhAnh: string;
  lienKet?: string;
  thuTu: number;
  hienThi: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface BannerInput {
  hinhAnh?: string;
  lienKet?: string;
  thuTu: number;
  hienThi: boolean;
}

// Define schema
const bannerSchema = new Schema<IBanner>({
  hinhAnh: { type: String, default: '' }, // URL của hình ảnh banner
  lienKet: { type: String, default: '' }, // Link khi click vào banner
  thuTu: { type: Number, required: true }, // Thứ tự sắp xếp
  hienThi: { type: Boolean, default: true }, // Trạng thái hiển thị
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

bannerSchema.index({ thuTu: 1, hienThi: 1 });

export default mongoose.model<IBanner>('Banner', bannerSchema);
