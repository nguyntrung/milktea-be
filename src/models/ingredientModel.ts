import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

// Define types
export interface IIngredient extends Document {
  _id: string;
  ten: string;
  soLuongTon: number;
  lichSuNhapHang: {
    thoiGian: Date,
    soLuong: number,
    maNhaCungCap: string,
    donGia: number,
    ghiChu: string
  }[];
  donViTinh: DonViTinh;
  nguongCanhBao: number;
  maNhaCungCap: string[];
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface IngredientInput {
  ten: string;
  soLuongTon: number;
  donViTinh: DonViTinh;
  nguongCanhBao: number;
  maNhaCungCap: string | string[];
}

// Define schema
const ingredientSchema = new Schema<IIngredient>({
  ten: { 
    type: String, 
    required: [true, 'Tên nguyên liệu là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên nguyên liệu phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Tên nguyên liệu không được vượt quá 50 ký tự']
  },
  soLuongTon: { 
    type: Number, 
    required: [true, 'Số lượng tồn là bắt buộc'],
    min: [0, 'Số lượng tồn không được nhỏ hơn 0'],
    default: 0
  },
  lichSuNhapHang: [{
    thoiGian: { type: Date, default: Date.now },
    soLuong: { 
      type: Number, 
      required: true, 
      min: [0, 'Số lượng nhập không được nhỏ hơn 0']
    },
    maNhaCungCap: { 
      type: String, 
      ref: 'NhaCungCap', 
      required: true 
    },
    donGia: { 
      type: Number, 
      required: true, 
      min: [0, 'Đơn giá không được nhỏ hơn 0']
    },
    ghiChu: String
  }],
  donViTinh: { 
    type: String, 
    enum: Object.values(DonViTinh),
    required: [true, 'Đơn vị tính là bắt buộc'] 
  },
  nguongCanhBao: { 
    type: Number, 
    required: [true, 'Ngưỡng cảnh báo là bắt buộc'],
    min: [0, 'Ngưỡng cảnh báo không được nhỏ hơn 0']
  },
  maNhaCungCap: [{ 
    type: String, 
    ref: 'NhaCungCap',
    required: [true, 'Nhà cung cấp là bắt buộc']
  }],
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Indexes
ingredientSchema.index({ soLuongTon: 1 });
ingredientSchema.index({ ten: 1 }, { unique: true });
ingredientSchema.index({ nguongCanhBao: 1 });

// Middleware
ingredientSchema.pre('save', function(next) {
  this.ngayCapNhat = new Date();
  next();
});

ingredientSchema.pre('findOneAndUpdate', function(next) {
  this.set({ ngayCapNhat: new Date() });
  next();
});

// Virtual
ingredientSchema.virtual('canCanhBao').get(function() {
  return this.soLuongTon <= this.nguongCanhBao;
});

// Methods
ingredientSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Static methods
ingredientSchema.statics.getCanCanhBao = function() {
  return this.find({ soLuongTon: { $lte: '$nguongCanhBao' } });
};

export default mongoose.model<IIngredient>('NguyenLieu', ingredientSchema);
