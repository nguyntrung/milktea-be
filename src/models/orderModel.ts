import mongoose, { Schema, Document } from 'mongoose';
import { KichCo, DoNgot, LuongDa, TrangThaiDonHang, PhuongThucThanhToan, TrangThaiThanhToan } from '../types/common';

export interface IOrder extends Document {
  _id: string;
  maKhachHang: string;
  ngayLap: Date;
  sanPham: {
    maSanPham: string;
    tenSanPham: string;
    soLuong: number;
    kichCo: string; // 'M', 'L', 'XL'
    tuyChon: {
      da?: string;  // '0', '50', '100' - Phần trăm đá, null nếu không chọn
      duong?: string; // '0', '50', '100' - Phần trăm đường, null nếu không chọn
      sua?: string;  // '0', '50', '100' - Phần trăm sữa, null nếu không chọn
    };
    topping: {
      maTopping: string;
      tenTopping: string;
      soLuong: number;
      giaBan: number;
    }[];
    donGia: number;
    thanhTien: number;
    ghiChu?: string;
  }[];
  tongTienHang: number;
  khuyenMai?: {
    maKhuyenMai: string;
    soTien: number;
    phanTram: number;
  };
  tongTien: number;
  trangThaiDonHang: TrangThaiDonHang;
  diaChiGiaoHang: string;
  sdtGiaoHang: string;
  nguoiNhan: string;
  phuongThucThanhToan: PhuongThucThanhToan;
  trangThaiThanhToan: TrangThaiThanhToan;
  ghiChu?: string;
  thoiGianGiao?: Date;
  nguoiGiao?: string; 
  maNhanVien?: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

const orderSchema = new Schema<IOrder>({
  maKhachHang: { 
    type: String, 
    ref: 'KhachHang', 
    required: [true, 'Mã khách hàng là bắt buộc'] 
  },
  ngayLap: { 
    type: Date, 
    default: Date.now,
    required: [true, 'Ngày lập đơn hàng là bắt buộc']  
  },
  sanPham: [
    {
      maSanPham: { 
        type: String, 
        ref: 'SanPham', 
        required: [true, 'Mã sản phẩm là bắt buộc'] 
      },
      tenSanPham: {
        type: String,
        required: [true, 'Tên sản phẩm là bắt buộc']
      },
      soLuong: { 
        type: Number, 
        required: [true, 'Số lượng là bắt buộc'],
        min: [1, 'Số lượng phải lớn hơn 0']
      },
      kichCo: { 
        type: String, 
        enum: ['M', 'L', 'XL'],
        required: [true, 'Kích cỡ là bắt buộc'] 
      },
      tuyChon: {
        da: { 
          type: String, 
          enum: ['0', '50', '100'],
          default: null
        },
        duong: { 
          type: String, 
          enum: ['0', '50', '100'],
          default: null
        },
        sua: { 
          type: String, 
          enum: ['0', '50', '100'],
          default: null
        }
      },
      topping: [{ 
        maTopping: { 
          type: String, 
          ref: 'Topping',
          required: [true, 'Mã topping là bắt buộc'] 
        },
        tenTopping: {
          type: String,
          required: [true, 'Tên topping là bắt buộc']
        },
        soLuong: { 
          type: Number, 
          required: [true, 'Số lượng topping là bắt buộc'],
          min: [1, 'Số lượng topping phải lớn hơn 0']
        },
        giaBan: { 
          type: Number,
          required: [true, 'Giá bán topping là bắt buộc'],
          min: [0, 'Giá bán topping không được âm']
        }
      }],
      donGia: { 
        type: Number, 
        required: [true, 'Đơn giá là bắt buộc'],
        min: [0, 'Đơn giá không được âm']
      },
      thanhTien: { 
        type: Number,
        required: [true, 'Thành tiền là bắt buộc'],
        min: [0, 'Thành tiền không được âm']
      },
      ghiChu: { type: String }
    }
  ],
  tongTienHang: { 
    type: Number,
    required: [true, 'Tổng tiền hàng là bắt buộc'],
    min: [0, 'Tổng tiền hàng không được âm'],
    default: 0
  },
  khuyenMai: {
    maKhuyenMai: { type: String, ref: 'KhuyenMai' },
    soTien: { 
      type: Number,
      min: [0, 'Số tiền khuyến mãi không được âm'],
      default: 0
    },
    phanTram: { 
      type: Number,
      min: [0, 'Phần trăm khuyến mãi không được âm'],
      max: [100, 'Phần trăm khuyến mãi không được quá 100%'],
      default: 0
    }
  },
  tongTien: { 
    type: Number,
    required: [true, 'Tổng tiền là bắt buộc'],
    min: [0, 'Tổng tiền không được âm'],
    default: 0
  },
  trangThaiDonHang: {
    type: String,
    enum: Object.values(TrangThaiDonHang),
    default: TrangThaiDonHang.CHO_XU_LY,
    required: [true, 'Trạng thái đơn hàng là bắt buộc']
  },
  diaChiGiaoHang: { 
    type: String, 
    required: [true, 'Địa chỉ giao hàng là bắt buộc'] 
  },
  sdtGiaoHang: { 
    type: String, 
    required: [true, 'Số điện thoại giao hàng là bắt buộc'],
    match: [/^[0-9]{10}$/, 'Số điện thoại không hợp lệ']
  },
  nguoiNhan: { 
    type: String, 
    required: [true, 'Tên người nhận là bắt buộc'] 
  },
  phuongThucThanhToan: {
    type: String,
    enum: Object.values(PhuongThucThanhToan),
    default: PhuongThucThanhToan.COD,
    required: [true, 'Phương thức thanh toán là bắt buộc']
  },
  trangThaiThanhToan: {
    type: String,
    enum: Object.values(TrangThaiThanhToan),
    default: TrangThaiThanhToan.CHUA_THANH_TOAN,
    required: [true, 'Trạng thái thanh toán là bắt buộc']
  },
  ghiChu: { type: String },
  thoiGianGiao: { type: Date },
  nguoiGiao: { 
    type: String, 
    ref: 'NhanVien' 
  },
  maNhanVien: { 
    type: String, 
    ref: 'NhanVien' 
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Middleware
orderSchema.pre('save', function(next) {
  // Tính tổng tiền hàng
  let tongTienHang = 0;
  this.sanPham.forEach((item) => {
    // Tính lại thành tiền cho mỗi sản phẩm
    let thanhTienSP = item.donGia * item.soLuong;
    
    // Cộng thêm tiền topping
    if (item.topping && item.topping.length > 0) {
      item.topping.forEach((tp) => {
        thanhTienSP += tp.giaBan * tp.soLuong;
      });
    }
    
    // Cập nhật thành tiền
    item.thanhTien = thanhTienSP;
    
    // Cộng vào tổng
    tongTienHang += thanhTienSP;
  });
  
  // Cập nhật tổng tiền hàng
  this.tongTienHang = tongTienHang;
  
  // Tính tổng tiền sau khuyến mãi
  let tongTien = tongTienHang;
  if (this.khuyenMai) {
    if (this.khuyenMai.soTien > 0) {
      tongTien = Math.max(0, tongTien - this.khuyenMai.soTien);
    }
    if (this.khuyenMai.phanTram > 0) {
      tongTien = tongTien * (1 - this.khuyenMai.phanTram / 100);
    }
  }
  
  // Cập nhật tổng tiền
  this.tongTien = Math.round(tongTien);
  
  // Cập nhật ngày
  this.ngayCapNhat = new Date();
  
  next();
});

orderSchema.pre('findOneAndUpdate', function(next) {
  this.set({ ngayCapNhat: new Date() });
  next();
});

// Tạo chuỗi mô tả tùy chọn của sản phẩm
orderSchema.methods.getMoTaTuyChon = function(sanPhamIndex: number): string {
  const sp = this.sanPham[sanPhamIndex];
  if (!sp) return '';
  
  const tuyChon = sp.tuyChon;
  const moTa = [];
  
  // Thêm thông tin về đá
  if (tuyChon.da) {
    moTa.push(`Đá: ${tuyChon.da}%`);
  }
  
  // Thêm thông tin về đường
  if (tuyChon.duong) {
    moTa.push(`Đường: ${tuyChon.duong}%`);
  }
  
  // Thêm thông tin về sữa
  if (tuyChon.sua) {
    moTa.push(`Sữa: ${tuyChon.sua}%`);
  }
  
  return moTa.join(', ');
};

// Virtuals
orderSchema.virtual('trangThaiText').get(function() {
  switch(this.trangThaiDonHang) {
    case TrangThaiDonHang.CHO_XU_LY:
      return 'Chờ xử lý';
    case TrangThaiDonHang.DANG_CHUAN_BI:
      return 'Đang chuẩn bị';
    case TrangThaiDonHang.DANG_GIAO:
      return 'Đang giao';
    case TrangThaiDonHang.DA_GIAO:
      return 'Đã giao';
    case TrangThaiDonHang.DA_HUY:
      return 'Đã hủy';
    case TrangThaiDonHang.TRA_HANG:
      return 'Trả hàng';
    case TrangThaiDonHang.HOAN_TIEN:
      return 'Hoàn tiền';
    default:
      return 'Không xác định';
  }
});

orderSchema.virtual('thanhToanText').get(function() {
  switch(this.trangThaiThanhToan) {
    case TrangThaiThanhToan.CHUA_THANH_TOAN:
      return 'Chưa thanh toán';
    case TrangThaiThanhToan.DA_THANH_TOAN:
      return 'Đã thanh toán';
    case TrangThaiThanhToan.DA_HOAN_TIEN:
      return 'Đã hoàn tiền';
    case TrangThaiThanhToan.DANG_XU_LY_HOAN_TIEN:
      return 'Đang xử lý hoàn tiền';
    case TrangThaiThanhToan.HUY_THANH_TOAN:
      return 'Đã hủy thanh toán';
    default:
      return 'Không xác định';
  }
});

// Hiển thị thông tin chi tiết của từng sản phẩm bao gồm tùy chọn
orderSchema.virtual('chiTietSanPham').get(function() {
  return this.sanPham.map(sp => {
    const tuyChonText = [];
    if (sp.tuyChon.da) tuyChonText.push(`Đá: ${sp.tuyChon.da}%`);
    if (sp.tuyChon.duong) tuyChonText.push(`Đường: ${sp.tuyChon.duong}%`);
    if (sp.tuyChon.sua) tuyChonText.push(`Sữa: ${sp.tuyChon.sua}%`);
    
    const toppingText = sp.topping.map(t => `${t.tenTopping} (${t.soLuong})`).join(', ');
    
    return {
      tenSanPham: sp.tenSanPham,
      kichCo: sp.kichCo,
      soLuong: sp.soLuong,
      donGia: sp.donGia,
      tuyChon: tuyChonText.join(', ') || 'Không có tùy chọn',
      topping: toppingText || 'Không có topping',
      thanhTien: sp.thanhTien,
      ghiChu: sp.ghiChu || ''
    };
  });
});

// Methods
orderSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Statics
orderSchema.statics.getDonHangChuaXuLy = function() {
  return this.find({ trangThaiDonHang: TrangThaiDonHang.CHO_XU_LY });
};

orderSchema.statics.getDonHangDangChuanBi = function() {
  return this.find({ trangThaiDonHang: TrangThaiDonHang.DANG_CHUAN_BI });
};

orderSchema.statics.getDonHangDangGiao = function() {
  return this.find({ trangThaiDonHang: TrangThaiDonHang.DANG_GIAO });
};

orderSchema.statics.getDoanhthuNgay = function(ngay: Date) {
  const startOfDay = new Date(ngay);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(ngay);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        ngayTao: { $gte: startOfDay, $lte: endOfDay },
        trangThaiDonHang: TrangThaiDonHang.DA_GIAO
      }
    },
    {
      $group: {
        _id: null,
        tongDoanhThu: { $sum: '$tongTien' },
        soLuongDonHang: { $sum: 1 }
      }
    }
  ]);
};

// Indexes
orderSchema.index({ maKhachHang: 1 });
orderSchema.index({ ngayLap: 1 });
orderSchema.index({ trangThaiDonHang: 1 });
orderSchema.index({ trangThaiThanhToan: 1 });
orderSchema.index({ ngayTao: 1 });

export default mongoose.model<IOrder>('DonHang', orderSchema);
