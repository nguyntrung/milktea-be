import mongoose, { Schema, Document } from 'mongoose';
import { DonViTinh } from '../types/common';

export interface IProduct extends Document {
  _id: string;
  ten: string;
  moTa: string;
  maDanhMuc: string;
  hinhAnh: string[];
  giaCoBan: number;
  tuyChonSize: {
    tenSize: string; // 'M' (mặc định), 'L', 'XL'
    giaTang: number; // 0 (cho M), 5000 (cho L), 10000 (cho XL)
    thanhPhan: {
      maNguyenLieu: string;
      soLuong: number;
      donViTinh: DonViTinh;
    }[];
  }[];
  tuyChon: {
    choPhepChonDa: boolean;    // Cho phép chọn đá
    mucDa: string[];           // ['0', '50', '100'] - phần trăm đá
    choPhepChonDuong: boolean; // Cho phép chọn đường
    mucDuong: string[];        // ['0', '50', '100'] - phần trăm đường
    choPhepChonSua: boolean;   // Cho phép chọn sữa
    mucSua: string[];          // ['0', '50', '100'] - phần trăm sữa
  };
  toppingCoTheThem: string[];
  congThuc?: string;
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface ProductInput {
  ten: string;
  moTa: string;
  maDanhMuc: string;
  giaCoBan: number;
  hinhAnh: string[];
  tuyChonSize: {
    tenSize: string;
    giaTang: number;
    thanhPhan: {
      maNguyenLieu: string;
      soLuong: number;
      donViTinh: string;
    }[];
  }[];
  tuyChon?: {
    choPhepChonDa?: boolean;
    mucDa?: string[];
    choPhepChonDuong?: boolean;
    mucDuong?: string[];
    choPhepChonSua?: boolean;
    mucSua?: string[];
  };
  toppingCoTheThem?: string[];
  congThuc?: string;
  hoatDong?: boolean;
}

const productSchema = new Schema<IProduct>({
  ten: { 
    type: String, 
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên sản phẩm phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự'],
    unique: true
  },
  moTa: { 
    type: String, 
    required: [true, 'Mô tả sản phẩm là bắt buộc'],
    trim: true,
    minlength: [10, 'Mô tả sản phẩm phải có ít nhất 10 ký tự'],
    maxlength: [1000, 'Mô tả sản phẩm không được vượt quá 1000 ký tự']
  },
  maDanhMuc: { 
    type: String, 
    ref: 'DanhMuc', 
    required: [true, 'Danh mục sản phẩm là bắt buộc'] 
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
  giaCoBan: { 
    type: Number, 
    required: [true, 'Giá cơ bản là bắt buộc'],
    min: [0, 'Giá không được âm']
  },
  tuyChonSize: [{
    tenSize: { 
      type: String, 
      enum: ['M', 'L', 'XL'],
      required: [true, 'Tên size là bắt buộc']
    },
    giaTang: { 
      type: Number, 
      required: [true, 'Giá tăng thêm là bắt buộc'],
      min: [0, 'Giá tăng thêm không được âm'],
      default: 0
    },
    thanhPhan: [{
      maNguyenLieu: { 
        type: String, 
        ref: 'NguyenLieu',
        required: [true, 'Mã nguyên liệu là bắt buộc']
      },
      soLuong: { 
        type: Number, 
        required: [true, 'Số lượng là bắt buộc'],
        min: [0, 'Số lượng không được âm']
      },
      donViTinh: { 
        type: String, 
        ref: 'DonVi',
        required: [true, 'Đơn vị tính là bắt buộc']
      }
    }]
  }],
  tuyChon: {
    choPhepChonDa: {
      type: Boolean,
      default: true
    },
    mucDa: {
      type: [String],
      enum: ['0', '50', '100'],
      default: ['0', '50', '100']
    },
    choPhepChonDuong: {
      type: Boolean,
      default: true
    },
    mucDuong: {
      type: [String],
      enum: ['0', '50', '100'],
      default: ['0', '50', '100']
    },
    choPhepChonSua: {
      type: Boolean,
      default: true
    },
    mucSua: {
      type: [String],
      enum: ['0', '50', '100'],
      default: ['0', '50', '100']
    }
  },
  toppingCoTheThem: [{ 
    type: String, 
    ref: 'Topping' 
  }],
  congThuc: { 
    type: String,
    trim: true,
    maxlength: [2000, 'Công thức không được vượt quá 2000 ký tự']
  },
  hoatDong: { 
    type: Boolean, 
    default: true 
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Middleware
productSchema.pre('save', function(next) {
  // Kiểm tra xem có size M mặc định không
  const hasDefaultSize = this.tuyChonSize.some(size => size.tenSize === 'M');
  if (!hasDefaultSize) {
    this.invalidate('tuyChonSize', 'Phải có size M mặc định (giaTang = 0)');
    return next(new Error('Phải có size M mặc định (giaTang = 0)'));
  }
  
  // Đảm bảo size M có giaTang = 0
  const defaultSize = this.tuyChonSize.find(size => size.tenSize === 'M');
  if (defaultSize && defaultSize.giaTang !== 0) {
    this.invalidate('tuyChonSize', 'Size M mặc định phải có giaTang = 0');
    return next(new Error('Size M mặc định phải có giaTang = 0'));
  }
  
  this.ngayCapNhat = new Date();
  next();
});

productSchema.pre('findOneAndUpdate', function(next) {
  this.set({ ngayCapNhat: new Date() });
  next();
});

// Virtual để lấy giá theo size
productSchema.virtual('giaTheoSize').get(function() {
  const result: { [key: string]: number } = {};
  
  this.tuyChonSize.forEach(size => {
    result[size.tenSize] = this.giaCoBan + size.giaTang;
  });
  
  return result;
});

// Định dạng tên sản phẩm để hiển thị
productSchema.virtual('tenHienThi').get(function() {
  return this.ten.charAt(0).toUpperCase() + this.ten.slice(1);
});

// Methods
productSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

productSchema.methods.getGia = function(size: string = 'M') {
  const sizeOption = this.tuyChonSize.find((s: any) => s.tenSize === size);
  if (!sizeOption) return this.giaCoBan; // Trả về giá cơ bản nếu không tìm thấy size
  return this.giaCoBan + sizeOption.giaTang;
};

productSchema.methods.getThanhPhan = function(size: string = 'M') {
  const sizeOption = this.tuyChonSize.find((s: any) => s.tenSize === size);
  if (!sizeOption) return []; // Trả về mảng rỗng nếu không tìm thấy size
  return sizeOption.thanhPhan;
};

// Statics
productSchema.statics.getSanPhamTheoTopping = function(maToppingArray: string[]) {
  return this.find({ toppingCoTheThem: { $in: maToppingArray } });
};

productSchema.statics.getSanPhamHoatDong = function() {
  return this.find({ hoatDong: true });
};

// Indexes
productSchema.index({ maDanhMuc: 1 });
productSchema.index({ hoatDong: 1 });
productSchema.index({ ten: 1 }, { unique: true });
productSchema.index({ giaCoBan: 1 });
productSchema.index({ 'tuyChonSize.tenSize': 1 });

export default mongoose.model<IProduct>('SanPham', productSchema);
