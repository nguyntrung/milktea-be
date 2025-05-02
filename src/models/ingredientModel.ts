import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

// Define types
export interface IIngredient extends Document {
  _id: string;
  ten: string;
  soLuong: {
    thoiGian: Date,
    soLuongTon: number
  }[];
  donViTinh: DonViTinh;
  nguongToiThieu: number;
  maNhaCungCap: string[];
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface IngredientInput {
  ten: string;
  soLuong: {
    thoiGian: Date,
    soLuongTon: number
  }[];
  donViTinh: DonViTinh;
  nguongToiThieu: number;
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
  soLuong: [{
    thoiGian: { type: Date, default: Date.now },
    soLuongTon: { 
      type: Number, 
      required: true,
      min: [0, 'Số lượng tồn không được nhỏ hơn 0'],
      default: 0
    }
  }],
  donViTinh: { 
    type: String, 
    enum: Object.values(DonViTinh),
    required: [true, 'Đơn vị tính là bắt buộc'] 
  },
  nguongToiThieu: { 
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
ingredientSchema.index({ ten: 1 }, { unique: true });
ingredientSchema.index({ nguongToiThieu: 1 });
ingredientSchema.index({ "soLuong.soLuongTon": 1 });

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
  if (this.soLuong && this.soLuong.length > 0) {
    // Lấy mục gần nhất trong mảng soLuong
    const latestEntry = this.soLuong.sort((a, b) => 
      new Date(b.thoiGian).getTime() - new Date(a.thoiGian).getTime()
    )[0];
    return latestEntry.soLuongTon <= this.nguongToiThieu;
  }
  return true; // Nếu không có dữ liệu về số lượng, cần cảnh báo
});

// Methods
ingredientSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Static methods
ingredientSchema.statics.getCanCanhBao = function() {
  return this.aggregate([
    { $unwind: "$soLuong" },
    { $sort: { "soLuong.thoiGian": -1 } },
    { $group: {
      _id: "$_id",
      ten: { $first: "$ten" },
      latestSoLuongTon: { $first: "$soLuong.soLuongTon" },
      nguongToiThieu: { $first: "$nguongToiThieu" },
      donViTinh: { $first: "$donViTinh" },
      maNhaCungCap: { $first: "$maNhaCungCap" },
      ngayTao: { $first: "$ngayTao" },
      ngayCapNhat: { $first: "$ngayCapNhat" }
    }},
    { $match: { $expr: { $lte: ["$latestSoLuongTon", "$nguongToiThieu"] } } }
  ]);
};

export default mongoose.model<IIngredient>('NguyenLieu', ingredientSchema);
