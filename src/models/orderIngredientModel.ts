import mongoose, { Schema, Document } from 'mongoose';
import { TrangThaiDonDatNguyenLieu } from '../types/common';

// Định nghĩa interface cho item trong lịch sử trạng thái
interface ITrangThaiHistory {
  thoiGian: Date;
  trangThai: TrangThaiDonDatNguyenLieu;
  nguoiThucHien?: string;
  ghiChu?: string;
}

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
  lichSuTrangThai: ITrangThaiHistory[];
  ghiChu?: string;
  nguoiDat: string;
  nguoiNhap?: string;
  nguoiThucHien?: string; // Thêm để lưu người thực hiện khi cập nhật trạng thái
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
  lichSuTrangThai: [{
    thoiGian: { 
      type: Date, 
      default: Date.now,
      required: [true, 'Thời gian thay đổi trạng thái là bắt buộc']
    },
    trangThai: { 
      type: String,
      enum: Object.values(TrangThaiDonDatNguyenLieu),
      required: [true, 'Trạng thái là bắt buộc']
    },
    nguoiThucHien: {
      type: String,
      ref: 'NguoiDung'
    },
    ghiChu: String
  }],
  ghiChu: { type: String },
  nguoiDat: { 
    type: String, 
    ref: 'NguoiDung', 
    required: [true, 'Người đặt là bắt buộc'] 
  },
  nguoiNhap: { 
    type: String, 
    ref: 'NguoiDung' 
  },
  nguoiThucHien: {
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
  
  // Cập nhật lịch sử trạng thái nếu là tài liệu mới hoặc trạng thái thay đổi
  if (this.isNew) {
    // Nếu là tài liệu mới, thêm trạng thái ban đầu vào lịch sử
    if (!this.lichSuTrangThai || this.lichSuTrangThai.length === 0) {
      this.lichSuTrangThai = [{
        thoiGian: new Date(),
        trangThai: this.trangThai,
        nguoiThucHien: this.nguoiDat
      }];
    }
  } else if (this.isModified('trangThai')) {
    // Nếu trạng thái thay đổi, thêm vào lịch sử
    if (!this.lichSuTrangThai) this.lichSuTrangThai = [];
    
    const lichSuItem: ITrangThaiHistory = {
      thoiGian: new Date(),
      trangThai: this.trangThai,
      nguoiThucHien: this.nguoiThucHien || this.nguoiDat
    };
    
    if (this.get('ghiChu')) {
      lichSuItem.ghiChu = this.get('ghiChu');
    }
    
    this.lichSuTrangThai.push(lichSuItem);
  }
  
  // Cập nhật ngày
  this.ngayCapNhat = new Date();
  
  next();
});

orderIngredientSchema.pre('findOneAndUpdate', function(next) {
  this.set({ ngayCapNhat: new Date() });
  
  // Lấy dữ liệu cập nhật
  const update = this.getUpdate() as any;
  
  // Kiểm tra nếu trạng thái thay đổi thì cập nhật lịch sử
  if (update && update.trangThai) {
    const lichSuItem: ITrangThaiHistory = {
      thoiGian: new Date(),
      trangThai: update.trangThai,
      nguoiThucHien: update.nguoiThucHien || null
    };
    
    // Nếu có ghi chú thì thêm vào
    if (update.ghiChu) {
      lichSuItem.ghiChu = update.ghiChu;
    }
    
    // Cập nhật vào lịch sử trạng thái
    this.updateOne({
      $push: { lichSuTrangThai: lichSuItem }
    });
  }
  
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
orderIngredientSchema.index({ 'lichSuTrangThai.thoiGian': 1 });

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

// Cập nhật trạng thái đơn hàng và lưu lịch sử
orderIngredientSchema.methods.capNhatTrangThai = async function(trangThaiMoi: TrangThaiDonDatNguyenLieu, nguoiThucHien: string, ghiChu?: string) {
  this.trangThai = trangThaiMoi;
  this.nguoiThucHien = nguoiThucHien;
  
  // Thêm vào lịch sử
  const lichSuItem: ITrangThaiHistory = {
    thoiGian: new Date(),
    trangThai: trangThaiMoi,
    nguoiThucHien
  };
  
  if (ghiChu) {
    lichSuItem.ghiChu = ghiChu;
  }
  
  this.lichSuTrangThai.push(lichSuItem);
  
  return this.save();
};

// Lấy lịch sử trạng thái gần đây nhất
orderIngredientSchema.methods.getTrangThaiGanNhat = function() {
  if (!this.lichSuTrangThai || this.lichSuTrangThai.length === 0) return null;
  
  // Sắp xếp theo thời gian giảm dần và lấy mục đầu tiên
  return this.lichSuTrangThai.sort((a: ITrangThaiHistory, b: ITrangThaiHistory) => 
    new Date(b.thoiGian).getTime() - new Date(a.thoiGian).getTime()
  )[0];
};

// Statics
orderIngredientSchema.statics.getDonDatChuaXacNhan = function() {
  return this.find({ trangThai: TrangThaiDonDatNguyenLieu.CHO_DUYET });
};

orderIngredientSchema.statics.getDonDatChuaNhap = function() {
  return this.find({ trangThai: TrangThaiDonDatNguyenLieu.DA_DUYET });
};

export default mongoose.model<IOrderIngredient>('DonDatNguyenLieu', orderIngredientSchema);
