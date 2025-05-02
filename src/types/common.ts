// Định nghĩa các enum cho đơn vị tính
export enum DonViTinh {
  CAI = 'cái',
  THUNG = 'thùng',
  HOP = 'hộp',
  CHAI = 'chai',
  LON = 'lon',
  VIEN = 'viên',
  GAM = 'gam',
  KG = 'kg',
  ML = 'ml',
  LIT = 'lít'
}

// Định nghĩa các enum cho kích cỡ
export enum KichCo {
  NHO = 'nho',
  VUA = 'vua',
  LON = 'lon'
}

// Định nghĩa các enum cho độ ngọt
export enum DoNgot {
  IT = 'it',
  VUA = 'vua',
  NHIEU = 'nhieu'
}

// Định nghĩa các enum cho lượng đá
export enum LuongDa {
  IT = 'it',
  VUA = 'vua',
  NHIEU = 'nhieu'
}

// Định nghĩa các enum cho vai trò người dùng
export enum VaiTro {
  USER = 'user',
  ADMIN = 'admin'
}

// Loại khuyến mãi
export enum LoaiKhuyenMai {
  GIAM_PHAN_TRAM = 'giamPhanTram',     // Giảm theo % 
  GIAM_TIEN = 'giamTien',              // Giảm trực tiếp số tiền
  TANG_DIEM = 'tangDiem'               // Tặng điểm thành viên
}

// Đối tượng áp dụng khuyến mãi
export enum DoiTuongKhuyenMai {
  TAT_CA = 'tatCa',                    // Áp dụng cho tất cả
  NGUOI_DUNG = 'nguoiDung',            // Áp dụng cho người dùng cụ thể
  SAN_PHAM = 'sanPham',                // Áp dụng cho sản phẩm cụ thể
  DANH_MUC = 'danhMuc',                // Áp dụng cho danh mục sản phẩm
  HOA_DON = 'hoaDon',                  // Áp dụng cho hóa đơn thỏa điều kiện
}

// Định nghĩa enum cho trạng thái phản hồi
export enum TrangThaiPhanHoi {
  CHUA_DOC = 'chuaDoc',
  DA_DOC = 'daDoc',
  DANG_XU_LY = 'dangXuLy',
  DA_XU_LY = 'daXuLy',
  HUY = 'huy'
}

// Định nghĩa enum cho trạng thái đơn hàng
export enum TrangThaiDonHang {
  CHO_XU_LY = 'choXuLy',        // Đơn hàng mới, đang chờ xác nhận
  DANG_CHUAN_BI = 'dangChuanBi', // Đang chuẩn bị đơn hàng
  DANG_GIAO = 'dangGiao',        // Đang giao hàng
  DA_GIAO = 'daGiao',            // Đã giao hàng thành công
  DA_HUY = 'daHuy',              // Đơn hàng đã bị hủy
  TRA_HANG = 'traHang',          // Khách hàng trả hàng
  HOAN_TIEN = 'hoanTien'         // Đã hoàn tiền cho khách
}

// Định nghĩa enum cho phương thức thanh toán
export enum PhuongThucThanhToan {
  THE_TIN_DUNG = 'theTinDung',   // Thanh toán bằng thẻ tín dụng
  MOMO = 'momo',                 // Thanh toán qua ví MoMo
  ZALOPAY = 'zalopay',           // Thanh toán qua ZaloPay
  VNPAY = 'vnpay',               // Thanh toán qua VNPay
  COD = 'cod'                    // Thanh toán khi nhận hàng
}

// Định nghĩa enum cho trạng thái đơn đặt nguyên liệu
export enum TrangThaiDonDatNguyenLieu {
  CHO_DUYET = 'choDuyet',        // Đơn đặt mới, đang chờ duyệt
  DA_DUYET = 'daDuyet',          // Đơn đặt đã được duyệt
  CHO_HANG_VE = 'choHangVe',     // Đã đặt hàng, đang chờ hàng về
  DA_NHAN_HANG = 'daNhanHang',   // Đã nhận hàng đầy đủ
  HOAN_THANH = 'hoanThanh',       // Đơn hàng đã hoàn thành
  HUY_DON = 'huyDon'            // Đơn hàng đã bị hủy
}

// Định nghĩa enum cho trạng thái thanh toán
export enum TrangThaiThanhToan {
  CHUA_THANH_TOAN = 'chuaThanhToan',   // Chưa thanh toán
  DA_THANH_TOAN = 'daThanhToan',       // Đã thanh toán đầy đủ
  DA_HOAN_TIEN = 'daHoanTien',         // Đã hoàn tiền
  DANG_XU_LY_HOAN_TIEN = 'dangXuLyHoanTien', // Đang xử lý hoàn tiền
  HUY_THANH_TOAN = 'huyThanhToan'      // Đã hủy thanh toán
}

// Định nghĩa enum cho giới tính
export enum GioiTinh {
  NAM = 'nam',     // Nam
  NU = 'nu',       // Nữ
  KHAC = 'khac'    // Khác/Không xác định
}

// Type cho đơn vị tính trong schema
export type DonViTinhSchema = {
  [key in DonViTinh]?: number;
};

// Interface cho thông tin đơn vị tính có thể tái sử dụng
export interface IDonViTinhInfo {
  maLoaiDonVi: string; // Mã đơn vị tính (từ enum DonViTinh)
  tenDonVi: string;    // Tên hiển thị
  giaTri: number;      // Giá trị quy đổi (nếu cần)
}