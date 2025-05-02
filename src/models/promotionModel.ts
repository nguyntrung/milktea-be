import mongoose, { Schema, Document } from 'mongoose';
import { LoaiKhuyenMai, DoiTuongKhuyenMai } from '../types/common';

// Define types
export interface IPromotion extends Document {
  _id: string;
  maKhuyenMai: string;                 // Mã khuyến mãi để nhập
  ten: string;                         // Tên khuyến mãi
  moTa: string;                        // Mô tả khuyến mãi
  loaiKhuyenMai: LoaiKhuyenMai;        // Loại khuyến mãi
  doiTuongApDung: DoiTuongKhuyenMai;   // Đối tượng áp dụng
  
  // Giá trị khuyến mãi (tùy theo loại)
  giaTri: {
    phanTram?: number;                // % giảm giá (nếu là giảm %)
    tienGiam?: number;                // Số tiền giảm (nếu là giảm tiền)
    sanPhamTang?: string[];           // ID sản phẩm tặng
    diemTang?: number;                // Số điểm tặng
  };
  
  // Điều kiện áp dụng
  dieuKien: {
    gioiTinh?: {                      // Giới tính áp dụng
      nam: boolean;
      nu: boolean;
      khac: boolean;
    };
    ngaySinh?: {                     // Khuyến mãi sinh nhật
      truoc: number;                 // Số ngày trước sinh nhật
      sau: number;                   // Số ngày sau sinh nhật
    };
    hanMuc: {                        // Hạn mức tối đa, tối thiểu
      giaTriToiThieu?: number;       // Giá trị hóa đơn tối thiểu
      giaTriToiDa?: number;          // Giá trị giảm tối đa
      soLuongToiThieu?: number;      // Số lượng sản phẩm tối thiểu
      soLuongToiDa?: number;         // Số lượng sản phẩm tối đa
    };
    danhSachNguoiDung?: string[];    // Danh sách ID người dùng được áp dụng
    danhSachSanPham?: string[];      // Danh sách ID sản phẩm được áp dụng
    danhSachDanhMuc?: string[];      // Danh sách ID danh mục được áp dụng
  };
  
  // Thời gian áp dụng
  thoiGianApDung: {
    batDau: Date;                    // Thời gian bắt đầu
    ketThuc: Date;                   // Thời gian kết thúc
  };
  
  // Số lượng khuyến mãi
  soLuong: {
    tongSoLuong: number;             // Tổng số lượng mã
    daSuDung: number;                // Số lượng đã sử dụng
    gioiHanMoiNguoiDung: number;     // Giới hạn số lần sử dụng cho mỗi người
  };
  
  // Thông tin quản lý
  hoatDong: boolean;                 // Trạng thái hoạt động
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface PromotionInput {
  maKhuyenMai: string;
  ten: string;
  moTa: string;
  loaiKhuyenMai: LoaiKhuyenMai;
  doiTuongApDung: DoiTuongKhuyenMai;
  giaTri: {
    phanTram?: number;
    tienGiam?: number;
    sanPhamTang?: string[];
    diemTang?: number;
  };
  dieuKien?: {
    gioiTinh?: {
      nam: boolean;
      nu: boolean;
      khac: boolean;
    };
    ngaySinh?: {
      truoc: number;
      sau: number;
    };
    hanMuc?: {
      giaTriToiThieu?: number;
      giaTriToiDa?: number;
      soLuongToiThieu?: number;
      soLuongToiDa?: number;
    };
    danhSachNguoiDung?: string[];
    danhSachSanPham?: string[];
    danhSachDanhMuc?: string[];
  };
  thoiGianApDung: {
    batDau: Date;
    ketThuc: Date;
  };
  soLuong: {
    tongSoLuong: number;
    gioiHanMoiNguoiDung: number;
  };
  hoatDong?: boolean;
}

// Define schema
const promotionSchema = new Schema<IPromotion>({
  maKhuyenMai: { 
    type: String, 
    required: [true, 'Mã khuyến mãi là bắt buộc'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'Mã khuyến mãi phải có ít nhất 3 ký tự'],
    maxlength: [20, 'Mã khuyến mãi không được vượt quá 20 ký tự']
  },
  ten: { 
    type: String, 
    required: [true, 'Tên khuyến mãi là bắt buộc'],
    trim: true,
    minlength: [3, 'Tên khuyến mãi phải có ít nhất 3 ký tự'],
    maxlength: [100, 'Tên khuyến mãi không được vượt quá 100 ký tự']
  },
  moTa: { 
    type: String, 
    required: [true, 'Mô tả khuyến mãi là bắt buộc'],
    trim: true,
    maxlength: [500, 'Mô tả không được vượt quá 500 ký tự']
  },
  loaiKhuyenMai: { 
    type: String, 
    enum: Object.values(LoaiKhuyenMai),
    required: [true, 'Loại khuyến mãi là bắt buộc']
  },
  doiTuongApDung: { 
    type: String, 
    enum: Object.values(DoiTuongKhuyenMai),
    required: [true, 'Đối tượng áp dụng là bắt buộc']
  },
  
  // Giá trị khuyến mãi
  giaTri: {
    phanTram: { 
      type: Number,
      min: [0, 'Phần trăm giảm không được âm'],
      max: [100, 'Phần trăm giảm không được vượt quá 100%'],
      default: 0
    },
    tienGiam: { 
      type: Number,
      min: [0, 'Số tiền giảm không được âm'],
      default: 0
    },
    sanPhamTang: [{ 
      type: String, 
      ref: 'SanPham'
    }],
    diemTang: { 
      type: Number,
      min: [0, 'Số điểm tặng không được âm'],
      default: 0
    }
  },
  
  // Điều kiện áp dụng
  dieuKien: {
    gioiTinh: {
      nam: { type: Boolean, default: true },
      nu: { type: Boolean, default: true },
      khac: { type: Boolean, default: true }
    },
    ngaySinh: {
      truoc: { type: Number, default: 0, min: 0 },
      sau: { type: Number, default: 0, min: 0 }
    },
    hanMuc: {
      giaTriToiThieu: { 
        type: Number, 
        min: [0, 'Giá trị tối thiểu không được âm'],
        default: 0
      },
      giaTriToiDa: { 
        type: Number, 
        min: [0, 'Giá trị tối đa không được âm']
      },
      soLuongToiThieu: { 
        type: Number, 
        min: [0, 'Số lượng tối thiểu không được âm'],
        default: 0
      },
      soLuongToiDa: { 
        type: Number, 
        min: [0, 'Số lượng tối đa không được âm']
      },
    },
    danhSachNguoiDung: [{ 
      type: String, 
      ref: 'NguoiDung'
    }],
    danhSachSanPham: [{ 
      type: String, 
      ref: 'SanPham'
    }],
    danhSachDanhMuc: [{ 
      type: String, 
      ref: 'DanhMuc'
    }]
  },
  
  // Thời gian áp dụng
  thoiGianApDung: {
    batDau: { 
      type: Date, 
      required: [true, 'Thời gian bắt đầu là bắt buộc'],
      validate: {
        validator: function(value: Date) {
          return value >= new Date(Date.now() - 24 * 60 * 60 * 1000); // Cho phép bắt đầu từ hôm qua
        },
        message: 'Thời gian bắt đầu không được trong quá khứ (trừ 1 ngày)'
      }
    },
    ketThuc: { 
      type: Date, 
      required: [true, 'Thời gian kết thúc là bắt buộc'],
      validate: {
        validator: function(this: any, value: Date) {
          return value > this.thoiGianApDung.batDau;
        },
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
      }
    }
  },
  
  // Số lượng khuyến mãi
  soLuong: {
    tongSoLuong: { 
      type: Number, 
      required: [true, 'Tổng số lượng là bắt buộc'],
      min: [1, 'Tổng số lượng phải lớn hơn 0']
    },
    daSuDung: { 
      type: Number, 
      default: 0,
      min: [0, 'Số lượng đã sử dụng không được âm']
    },
    gioiHanMoiNguoiDung: { 
      type: Number, 
      required: [true, 'Giới hạn mỗi người dùng là bắt buộc'],
      min: [0, 'Giới hạn mỗi người dùng không được âm'],
      default: 1
    }
  },
  
  // Thông tin quản lý
  hoatDong: { 
    type: Boolean, 
    default: true 
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Middleware
promotionSchema.pre('save', function(next) {
  this.ngayCapNhat = new Date();
  
  // Kiểm tra xác thực giá trị khuyến mãi
  const validatePromotionValue = () => {
    switch (this.loaiKhuyenMai) {
      case LoaiKhuyenMai.GIAM_PHAN_TRAM:
        if (!this.giaTri.phanTram || this.giaTri.phanTram <= 0) {
          return false;
        }
        break;
      case LoaiKhuyenMai.GIAM_TIEN:
        if (!this.giaTri.tienGiam || this.giaTri.tienGiam <= 0) {
          return false;
        }
        break;
      case LoaiKhuyenMai.TANG_SAN_PHAM:
        if (!this.giaTri.sanPhamTang || this.giaTri.sanPhamTang.length === 0) {
          return false;
        }
        break;
      case LoaiKhuyenMai.TANG_DIEM:
        if (!this.giaTri.diemTang || this.giaTri.diemTang <= 0) {
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  // Kiểm tra xác thực đối tượng áp dụng
  const validateTargetEntity = () => {
    switch (this.doiTuongApDung) {
      case DoiTuongKhuyenMai.NGUOI_DUNG:
        if (!this.dieuKien.danhSachNguoiDung || this.dieuKien.danhSachNguoiDung.length === 0) {
          return false;
        }
        break;
      case DoiTuongKhuyenMai.SAN_PHAM:
        if (!this.dieuKien.danhSachSanPham || this.dieuKien.danhSachSanPham.length === 0) {
          return false;
        }
        break;
      case DoiTuongKhuyenMai.DANH_MUC:
        if (!this.dieuKien.danhSachDanhMuc || this.dieuKien.danhSachDanhMuc.length === 0) {
          return false;
        }
        break;
      default:
        return true;
    }
    return true;
  };

  if (!validatePromotionValue()) {
    return next(new Error('Giá trị khuyến mãi không phù hợp với loại khuyến mãi'));
  }

  if (!validateTargetEntity()) {
    return next(new Error('Đối tượng áp dụng không phù hợp với điều kiện đã chọn'));
  }

  next();
});

promotionSchema.pre('findOneAndUpdate', function() {
  this.set({ ngayCapNhat: new Date() });
});

// Kiểm tra còn khuyến mãi không
promotionSchema.virtual('conKhuyenMai').get(function() {
  return this.soLuong.daSuDung < this.soLuong.tongSoLuong;
});

// Kiểm tra còn hiệu lực không
promotionSchema.virtual('conHieuLuc').get(function() {
  const now = new Date();
  return this.hoatDong && 
         now >= this.thoiGianApDung.batDau && 
         now <= this.thoiGianApDung.ketThuc &&
         this.soLuong.daSuDung < this.soLuong.tongSoLuong;
});

// Methods
promotionSchema.methods.coTheApDungChoNguoiDung = function(nguoiDung: any): boolean {
  // Nếu không hiệu lực thì không áp dụng
  const conHieuLuc = this.get('conHieuLuc'); // Sử dụng get để truy cập virtual property
  if (!conHieuLuc) return false;
  
  // Nếu đối tượng không phải người dùng và không phải tất cả, return false
  if (this.doiTuongApDung !== DoiTuongKhuyenMai.NGUOI_DUNG && 
      this.doiTuongApDung !== DoiTuongKhuyenMai.TAT_CA) {
    return false;
  }
  
  // Kiểm tra danh sách người dùng nếu có
  if (this.doiTuongApDung === DoiTuongKhuyenMai.NGUOI_DUNG &&
      this.dieuKien.danhSachNguoiDung &&
      this.dieuKien.danhSachNguoiDung.length > 0 &&
      !this.dieuKien.danhSachNguoiDung.includes(nguoiDung._id.toString())) {
    return false;
  }
  
  // Kiểm tra giới tính nếu có
  if (this.dieuKien.gioiTinh) {
    if (nguoiDung.gioiTinh) {
      if (nguoiDung.gioiTinh.nam && !this.dieuKien.gioiTinh.nam) return false;
      if (nguoiDung.gioiTinh.nu && !this.dieuKien.gioiTinh.nu) return false;
      if (nguoiDung.gioiTinh.khac && !this.dieuKien.gioiTinh.khac) return false;
    }
  }
  
  // Kiểm tra sinh nhật nếu có
  if (this.dieuKien.ngaySinh && nguoiDung.ngaySinh) {
    const today = new Date();
    const birthday = new Date(nguoiDung.ngaySinh);
    
    // Điều chỉnh năm sinh để tính ngày sinh nhật năm nay
    birthday.setFullYear(today.getFullYear());
    
    // Nếu sinh nhật đã qua, tính cho sinh nhật năm sau
    if (birthday < today) {
      birthday.setFullYear(today.getFullYear() + 1);
    }
    
    // Tính số ngày còn lại đến sinh nhật
    const diffTime = Math.abs(birthday.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Kiểm tra xem có nằm trong khoảng thời gian trước/sau sinh nhật không
    const isBirthdayPromotion = 
      diffDays <= this.dieuKien.ngaySinh.sau || 
      diffDays >= (365 - this.dieuKien.ngaySinh.truoc);
    
    if (!isBirthdayPromotion) return false;
  }
  
  return true;
};

promotionSchema.methods.coTheApDungChoHoaDon = function(hoaDon: any): boolean {
  // Nếu không hiệu lực thì không áp dụng
  const conHieuLuc = this.get('conHieuLuc'); // Sử dụng get để truy cập virtual property
  if (!conHieuLuc) return false;
  
  // Nếu đối tượng không phải hóa đơn và không phải tất cả, return false
  if (this.doiTuongApDung !== DoiTuongKhuyenMai.HOA_DON && 
      this.doiTuongApDung !== DoiTuongKhuyenMai.TAT_CA) {
    return false;
  }
  
  // Kiểm tra giá trị tối thiểu/tối đa nếu có
  if (this.dieuKien.hanMuc) {
    // Kiểm tra giá trị tối thiểu
    if (this.dieuKien.hanMuc.giaTriToiThieu && 
        hoaDon.tongTienHang < this.dieuKien.hanMuc.giaTriToiThieu) {
      return false;
    }
    
    // Kiểm tra giá trị tối đa
    if (this.dieuKien.hanMuc.giaTriToiDa && 
        hoaDon.tongTienHang > this.dieuKien.hanMuc.giaTriToiDa) {
      return false;
    }
    
    // Kiểm tra số lượng sản phẩm tối thiểu
    if (this.dieuKien.hanMuc.soLuongToiThieu && 
        hoaDon.sanPham.length < this.dieuKien.hanMuc.soLuongToiThieu) {
      return false;
    }
    
    // Kiểm tra số lượng sản phẩm tối đa
    if (this.dieuKien.hanMuc.soLuongToiDa && 
        hoaDon.sanPham.length > this.dieuKien.hanMuc.soLuongToiDa) {
      return false;
    }
  }
  
  // Kiểm tra sản phẩm trong hóa đơn nếu có điều kiện sản phẩm
  if (this.dieuKien.danhSachSanPham && 
      this.dieuKien.danhSachSanPham.length > 0) {
    // Kiểm tra xem có ít nhất một sản phẩm trong hóa đơn nằm trong danh sách sản phẩm khuyến mãi không
    const hasProdpromotionProduct = hoaDon.sanPham.some((item: any) => 
      this.dieuKien.danhSachSanPham?.includes(item.maSanPham.toString())
    );
    
    if (!hasProdpromotionProduct) return false;
  }
  
  // Kiểm tra danh mục trong hóa đơn nếu có điều kiện danh mục
  if (this.dieuKien.danhSachDanhMuc && 
      this.dieuKien.danhSachDanhMuc.length > 0) {
    // Trường hợp này cần truy vấn thêm để lấy thông tin danh mục của sản phẩm
    // Vì chúng ta không có thông tin này, nên giả định rằng phần này đã được xử lý
    // và chúng ta đã có danh sách danh mục của các sản phẩm trong hóa đơn
    // Trong thực tế, bạn cần truy vấn thêm để lấy thông tin này
  }
  
  return true;
};

promotionSchema.methods.coTheApDungChoSanPham = function(sanPham: any): boolean {
  // Nếu không hiệu lực thì không áp dụng
  const conHieuLuc = this.get('conHieuLuc'); // Sử dụng get để truy cập virtual property
  if (!conHieuLuc) return false;
  
  // Nếu đối tượng không phải sản phẩm và không phải tất cả, return false
  if (this.doiTuongApDung !== DoiTuongKhuyenMai.SAN_PHAM && 
      this.doiTuongApDung !== DoiTuongKhuyenMai.DANH_MUC &&
      this.doiTuongApDung !== DoiTuongKhuyenMai.TAT_CA) {
    return false;
  }
  
  // Kiểm tra sản phẩm nếu đối tượng là sản phẩm
  if (this.doiTuongApDung === DoiTuongKhuyenMai.SAN_PHAM &&
      this.dieuKien.danhSachSanPham &&
      this.dieuKien.danhSachSanPham.length > 0 &&
      !this.dieuKien.danhSachSanPham.includes(sanPham._id.toString())) {
    return false;
  }
  
  // Kiểm tra danh mục nếu đối tượng là danh mục
  if (this.doiTuongApDung === DoiTuongKhuyenMai.DANH_MUC &&
      this.dieuKien.danhSachDanhMuc &&
      this.dieuKien.danhSachDanhMuc.length > 0 &&
      !this.dieuKien.danhSachDanhMuc.includes(sanPham.maDanhMuc.toString())) {
    return false;
  }
  
  return true;
};

// Static methods
promotionSchema.statics.timKhuyenMaiHieuLuc = function() {
  const now = new Date();
  
  return this.find({
    hoatDong: true,
    'thoiGianApDung.batDau': { $lte: now },
    'thoiGianApDung.ketThuc': { $gte: now },
    $expr: { $lt: ['$soLuong.daSuDung', '$soLuong.tongSoLuong'] }
  });
};

// Indexes
promotionSchema.index({ maKhuyenMai: 1 }, { unique: true });
promotionSchema.index({ 'thoiGianApDung.batDau': 1 });
promotionSchema.index({ 'thoiGianApDung.ketThuc': 1 });
promotionSchema.index({ hoatDong: 1 });
promotionSchema.index({ loaiKhuyenMai: 1 });
promotionSchema.index({ doiTuongApDung: 1 });
promotionSchema.index({ 'dieuKien.danhSachNguoiDung': 1 });
promotionSchema.index({ 'dieuKien.danhSachSanPham': 1 });
promotionSchema.index({ 'dieuKien.danhSachDanhMuc': 1 });

export default mongoose.model<IPromotion>('KhuyenMai', promotionSchema); 