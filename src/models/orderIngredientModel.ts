import mongoose, { Schema, Document } from 'mongoose';
import { TrangThaiDonDatNguyenLieu } from '../types/common';

export interface IOrderIngredient extends Document {
  _id: string;
  maNhaCungCap: string;
  ngayDat: Date;
  thoiGianCanGiao: Date;
  nguyenLieu: {
    maNguyenLieu: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
  }[];
  tongTien: number;
  ngayNhap?: Date;
  trangThai: TrangThaiDonDatNguyenLieu;
  ghiChu?: string;
  nguoiDat: string;
  nguoiXacNhan?: string;
  nguoiNhap?: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

const orderIngredientSchema = new Schema<IOrderIngredient>({
  maNhaCungCap: { 
    type: String, 
    ref: 'NhaCungCap', 
    required: [true, 'Nhà cung cấp là bắt buộc'] 
  },
  ngayDat: { 
    type: Date, 
    default: Date.now,
    required: [true, 'Ngày đặt là bắt buộc']
  },
  thoiGianCanGiao: { 
    type: Date, 
    required: [true, 'Thời gian cần giao là bắt buộc'],
    validate: {
      validator: function(this: IOrderIngredient, value: Date) {
        return value > this.ngayDat;
      },
      message: 'Thời gian cần giao phải sau ngày đặt'
    }
  },
  nguyenLieu: [
    {
      maNguyenLieu: { 
        type: String, 
        ref: 'NguyenLieu', 
        required: [true, 'Nguyên liệu là bắt buộc'] 
      },
      soLuong: { 
        type: Number, 
        required: [true, 'Số lượng là bắt buộc'],
        min: [1, 'Số lượng phải lớn hơn 0']
      },
      donGia: { 
        type: Number, 
        required: [true, 'Đơn giá là bắt buộc'],
        min: [0, 'Đơn giá không được âm']
      },
      thanhTien: { 
        type: Number,
        default: function(this: any) {
          return this.soLuong * this.donGia;
        }
      }
    }
  ],
  tongTien: {
    type: Number,
    default: 0
  },
  ngayNhap: { 
    type: Date,
    validate: {
      validator: function(this: IOrderIngredient, value: Date) {
        if (!value) return true;
        return value >= this.ngayDat;
      },
      message: 'Ngày nhập phải sau hoặc bằng ngày đặt'
    }
  },
  trangThai: {
    type: String,
    enum: Object.values(TrangThaiDonDatNguyenLieu),
    default: TrangThaiDonDatNguyenLieu.CHO_DUYET,
    required: [true, 'Trạng thái đơn đặt là bắt buộc']
  },
  ghiChu: { type: String },
  nguoiDat: { 
    type: String, 
    ref: 'NguoiDung', 
    required: [true, 'Người đặt là bắt buộc'] 
  },
  nguoiXacNhan: { 
    type: String, 
    ref: 'NguoiDung' 
  },
  nguoiNhap: { 
    type: String, 
    ref: 'NguoiDung' 
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Middleware
orderIngredientSchema.pre('save', function(next) {
  // Tính tổng tiền
  let total = 0;
  this.nguyenLieu.forEach((item) => {
    total += item.thanhTien || item.soLuong * item.donGia;
  });
  this.tongTien = total;
  
  // Cập nhật ngày
  this.ngayCapNhat = new Date();
  
  next();
});

orderIngredientSchema.pre('findOneAndUpdate', function(next) {
  this.set({ ngayCapNhat: new Date() });
  next();
});

// Bỏ phần pre-validate không cần thiết nữa vì đã sử dụng enum
orderIngredientSchema.pre('validate', function(next) {
  next();
});

// Indexes
orderIngredientSchema.index({ maNhaCungCap: 1 });
orderIngredientSchema.index({ nguoiDat: 1 });
orderIngredientSchema.index({ trangThai: 1 });
orderIngredientSchema.index({ ngayDat: 1 });
orderIngredientSchema.index({ thoiGianCanGiao: 1 });

// Virtuals
orderIngredientSchema.virtual('trangThaiText').get(function() {
  switch(this.trangThai) {
    case TrangThaiDonDatNguyenLieu.CHO_DUYET:
      return 'Chờ duyệt';
    case TrangThaiDonDatNguyenLieu.DA_DUYET:
      return 'Đã duyệt';
    case TrangThaiDonDatNguyenLieu.CHO_HANG_VE:
      return 'Chờ hàng về';
    case TrangThaiDonDatNguyenLieu.DA_NHAN_HANG:
      return 'Đã nhận hàng';
    case TrangThaiDonDatNguyenLieu.HUY_DON:
      return 'Đã hủy';
    case TrangThaiDonDatNguyenLieu.HOAN_THANH:
      return 'Hoàn thành';
    default:
      return 'Không xác định';
  }
});

// Methods
orderIngredientSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Statics
orderIngredientSchema.statics.getDonDatChuaXacNhan = function() {
  return this.find({ trangThai: TrangThaiDonDatNguyenLieu.CHO_DUYET });
};

orderIngredientSchema.statics.getDonDatChuaNhap = function() {
  return this.find({ trangThai: TrangThaiDonDatNguyenLieu.DA_DUYET });
};

export default mongoose.model<IOrderIngredient>('DonDatNguyenLieu', orderIngredientSchema);
