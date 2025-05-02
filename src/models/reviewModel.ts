import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface IReview extends Document {
  _id: string;
  maKhachHang: string;
  maSanPham: string;
  diemDanhGia: number;
  noiDung: string;
  hinhAnh?: string[];
  ngayDanhGia: Date;
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface ReviewInput {
  maKhachHang: string;
  maSanPham: string;
  diemDanhGia: number;
  noiDung: string;
  hinhAnh?: string[];
  ngayDanhGia?: Date;
}

// Define schema
const reviewSchema = new Schema<IReview>({
  maKhachHang: { 
    type: String, 
    ref: 'NguoiDung', 
    required: [true, 'Mã khách hàng là bắt buộc'] 
  },
  maSanPham: { 
    type: String, 
    ref: 'SanPham', 
    required: [true, 'Mã sản phẩm là bắt buộc'] 
  },
  diemDanhGia: { 
    type: Number,
    required: [true, 'Điểm đánh giá là bắt buộc'],
    min: [1, 'Điểm đánh giá tối thiểu là 1'],
    max: [5, 'Điểm đánh giá tối đa là 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Điểm đánh giá phải là số nguyên'
    }
  },
  noiDung: { 
    type: String, 
    required: [true, 'Nội dung đánh giá là bắt buộc'],
    trim: true,
    maxlength: [1000, 'Nội dung không được vượt quá 1000 ký tự']
  },
  hinhAnh: [{ 
    type: String,
    validate: {
      validator: function(v: string) {
        return /^(https?:\/\/|\/images\/)/.test(v);
      },
      message: 'Đường dẫn hình ảnh không hợp lệ'
    }
  }],
  ngayDanhGia: { 
    type: Date, 
    default: Date.now,
    required: [true, 'Ngày đánh giá là bắt buộc']
  },
  hoatDong: { 
    type: Boolean, 
    default: true 
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Middleware
reviewSchema.pre('findOneAndUpdate', function() {
  this.set({ ngayCapNhat: new Date() });
});

// Tạo một trường ảo để kiểm tra xem đánh giá có phải là đánh giá mới không
reviewSchema.virtual('isNew').get(function() {
  const now = new Date();
  const createDate = this.ngayTao;
  const diffTime = Math.abs(now.getTime() - createDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7; // Đánh giá trong vòng 7 ngày được coi là mới
});

// Indexes
reviewSchema.index({ maKhachHang: 1 });
reviewSchema.index({ maSanPham: 1 });
reviewSchema.index({ diemDanhGia: 1 });
reviewSchema.index({ ngayDanhGia: -1 });
reviewSchema.index({ trangThai: 1 });
// Compound index cho phép tìm kiếm hiệu quả theo sản phẩm và sắp xếp theo điểm
reviewSchema.index({ maSanPham: 1, diemDanhGia: -1 }); 

// Đảm bảo mỗi khách hàng chỉ đánh giá một sản phẩm một lần
reviewSchema.index({ maKhachHang: 1, maSanPham: 1 }, { unique: true });

export default mongoose.model<IReview>('DanhGia', reviewSchema); 