import mongoose, { Schema, Document } from 'mongoose';
import { TrangThaiPhanHoi } from '../types/common';

// Define types
export interface IFeedback extends Document {
  _id: string;
  maKhachHang: string;
  tieuDe: string;
  noiDung: string;
  ngayPhanHoi: Date;
  trangThai: TrangThaiPhanHoi;
  ghiChu?: string;
  nguoiXuLy?: string;
  ngayXuLy?: Date;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface FeedbackInput {
  maKhachHang: string;
  tieuDe: string;
  noiDung: string;
  ngayPhanHoi?: Date;
  trangThai?: TrangThaiPhanHoi;
  ghiChu?: string;
  nguoiXuLy?: string;
  ngayXuLy?: Date;
}

// Define schema
const feedbackSchema = new Schema<IFeedback>({
  maKhachHang: { 
    type: String, 
    ref: 'NguoiDung', 
    required: [true, 'Mã khách hàng là bắt buộc'] 
  },
  tieuDe: { 
    type: String, 
    required: [true, 'Tiêu đề phản hồi là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
  },
  noiDung: { 
    type: String, 
    required: [true, 'Nội dung phản hồi là bắt buộc'],
    trim: true,
    maxlength: [2000, 'Nội dung không được vượt quá 2000 ký tự']
  },
  ngayPhanHoi: { 
    type: Date, 
    default: Date.now,
    required: [true, 'Ngày phản hồi là bắt buộc']
  },
  trangThai: { 
    type: String, 
    enum: Object.values(TrangThaiPhanHoi),
    default: TrangThaiPhanHoi.CHUA_DOC,
    required: [true, 'Trạng thái phản hồi là bắt buộc']
  },
  ghiChu: { 
    type: String,
    trim: true,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
  },
  nguoiXuLy: { 
    type: String, 
    ref: 'NguoiDung'
  },
  ngayXuLy: { 
    type: Date
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Middleware
feedbackSchema.pre('findOneAndUpdate', function() {
  this.set({ ngayCapNhat: new Date() });
});

// Middleware để tự động cập nhật ngày xử lý
feedbackSchema.pre('save', function(next) {
  // Nếu chuyển trạng thái sang đã xử lý và chưa có ngày xử lý
  if (this.isModified('trangThai') && 
      this.trangThai === TrangThaiPhanHoi.DA_XU_LY && 
      !this.ngayXuLy) {
    this.ngayXuLy = new Date();
  }
  next();
});

// Indexes
feedbackSchema.index({ maKhachHang: 1 });
feedbackSchema.index({ trangThai: 1 });
feedbackSchema.index({ ngayPhanHoi: 1 });
feedbackSchema.index({ ngayTao: -1 });  // Để sắp xếp theo thời gian tạo mới nhất

export default mongoose.model<IFeedback>('PhanHoi', feedbackSchema); 