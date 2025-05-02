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
  hoatDong?: boolean;
}

// Define schema
const categorySchema = new Schema<ICategory>({
  ten: { 
    type: String, 
    required: [true, 'Tên danh mục là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [2, 'Tên danh mục phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Tên danh mục không được vượt quá 50 ký tự'],
    match: [/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/, 'Tên danh mục chỉ được chứa chữ cái, số và dấu cách']
  },
  hoatDong: { 
    type: Boolean, 
    default: true 
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Indexes
categorySchema.index({ ten: 1 }, { unique: true });
categorySchema.index({ hoatDong: 1 });

// Middleware
categorySchema.pre('save', function(next) {
  this.ngayCapNhat = new Date();
  next();
});

categorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ ngayCapNhat: new Date() });
  next();
});

// Virtuals
categorySchema.virtual('sanPham', {
  ref: 'SanPham',
  localField: '_id',
  foreignField: 'maDanhMuc'
});

// Methods
categorySchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

export default mongoose.model<ICategory>('DanhMuc', categorySchema);
