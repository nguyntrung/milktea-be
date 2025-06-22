import orderModel, { IOrder, OrderInput } from '../models/orderModel';
import orderDetailModel from '../models/orderDetailModel';
import promotionService from './promotionService';
import promotionModel from '../models/promotionModel';
import userModel from '../models/userModel';
import { BadRequestError } from '../utils/errors';
import { TrangThaiDonHang, LoaiKhuyenMai } from '../types/common';
import notificationService from './notificationService';
import { LoaiThongBao, LoaiGiaoDich, TrangThaiThanhToan } from '../types/common';

class OrderService {
  // Tạo đơn hàng mới
  async create(data: OrderInput) {
    const {
      maKhachHang,
      maNhanVien,
      nguoiGiao,
      phiVanChuyen,
      thongTinNguoiNhan,
      khuyenMai = [],
      thanhToan,
      diemTichLuySuDung = 0,
      ghiChu = ''
    } = data;

    const fullPromotionList = await Promise.all(
      khuyenMai.map(async (km) => {
        const promo = await promotionModel.findOne({ maKhuyenMai: km.maKhuyenMai });
        if (!promo) throw new BadRequestError(`Mã khuyến mãi không hợp lệ: ${km.maKhuyenMai}`);
        return {
          maKhuyenMai: promo.maKhuyenMai,
          giaTri: promo.giaTri,
          loaiKhuyenMai: promo.loaiKhuyenMai,
        };
      })
    );

    // Lấy người dùng
    const user = await userModel.findById(maKhachHang);
    if (!user) throw new BadRequestError('Người dùng không tồn tại');

    // Số điểm có thể dùng: <= điểm tích lũy của user
    const diemHienCo  = user.diemTichLuy || 0;
    
    if (diemTichLuySuDung > diemHienCo)
    throw new BadRequestError(`Bạn chỉ có ${diemHienCo} điểm, không thể dùng ${diemTichLuySuDung} điểm.`);

    const order: IOrder = await orderModel.create({
      maKhachHang,
      maNhanVien,
      ngayLap: new Date(),
      tongTienHang: 0,
      khuyenMai: fullPromotionList, 
      nguoiGiao,
      phiVanChuyen,
      diemTichLuySuDung,  
      tongTien: 0,
      thongTinNguoiNhan,
      thanhToan,
      lichSuTrangThai: [{
        thoiGian: new Date(),
        trangThaiDonHang: TrangThaiDonHang.CHO_XAC_NHAN,
      }],
      ghiChu,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    // Trừ điểm nếu có sử dụng
    if (diemTichLuySuDung > 0) {
      user.diemTichLuy -= diemTichLuySuDung;
      user.lichSuDiem.push({
        thoiGian: new Date(),
        diem: diemTichLuySuDung,
        noiDung: `Trừ điểm khi đặt đơn hàng ${order._id}`,
        diemConLai: user.diemTichLuy,
        loaiGiaoDich: LoaiGiaoDich.TRU
      });
      await user.save();
    }

    try {
      await notificationService.create({
        tieuDe: 'Đơn hàng mới',
        noiDung: `Khách hàng đã tạo đơn hàng mới.`,
        loaiThongBao: LoaiThongBao.DON_HANG_MOI,
        maNguoiNhan: maNhanVien,
        lienKet: `/order-details/${order._id}`,
      });
    } catch (error) {
      console.error('Không thể tạo thông báo đơn hàng mới:', error);
    }

    return await orderModel.findById(order._id)
      .populate('maKhachHang', 'ten')
      .populate('maNhanVien', 'ten');
  }

  // Lấy tất cả đơn hàng
  async getAll() {
    return await orderModel
      .find()
      .populate('maKhachHang', 'ten')
      .populate('maNhanVien', 'ten')
      .sort({ ngayTao: -1 });
  }

  // Lấy đơn hàng theo ID
  async getById(id: string) {
    const order = await orderModel
      .findById(id)
      .populate('maKhachHang', 'ten')
      .populate('maNhanVien', 'ten');
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');
    return order;
  }

  // Lấy danh sách đơn hàng theo mã khách hàng
  async getByCustomerId(maKhachHang: string) {
    return await orderModel
      .find({ maKhachHang })
      .populate('maNhanVien', 'ten')
      .sort({ ngayTao: -1 });
  }

  // Lấy danh sách đơn hàng với phân trang
  async getPaginated(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderModel
        .find()
        .populate('maKhachHang', 'ten')
        .populate('maNhanVien', 'ten')
        .sort({ ngayTao: -1 })
        .skip(skip)
        .limit(limit),
      orderModel.countDocuments(),
    ]);

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };
  }

  // Lấy danh sách đơn hàng theo user với phân trang
  async getPaginatedByCustomer(maKhachHang: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderModel
        .find({ maKhachHang })
        .populate('maKhachHang', 'ten')
        .populate('maNhanVien', 'ten')
        .sort({ ngayTao: -1 })
        .skip(skip)
        .limit(limit),
      orderModel.countDocuments({ maKhachHang }),
    ]);

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    };
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus(id: string, trangThaiDonHang: TrangThaiDonHang) {
    const order = await orderModel.findById(id);
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');

    if (trangThaiDonHang === TrangThaiDonHang.DA_GIAO) {
      await this.caculateLoyaltyPoint(order.id);
    }

    order.lichSuTrangThai.push({
      thoiGian: new Date(),
      trangThaiDonHang,
    });
    order.ngayCapNhat = new Date();
    await order.save();

    try {
      await notificationService.create({
        tieuDe: 'Cập nhật trạng thái đơn hàng',
        noiDung: `Đơn hàng của bạn đã được cập nhật sang trạng thái: ${trangThaiDonHang}`,
        loaiThongBao: LoaiThongBao.TRANG_THAI_DON_HANG,
        maNguoiNhan: order.maKhachHang,
        lienKet: `/order-details/${order._id}`,
      });
    } catch (error) {
      console.error('Không thể tạo thông báo cập nhật trạng thái:', error);
    }

    return order;
  }

  // Hủy đơn hàng
  async deactivate(id: string) {
    const order = await orderModel.findById(id);
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');

    const daHuy = order.lichSuTrangThai.some(
      trangThai => trangThai.trangThaiDonHang === TrangThaiDonHang.DA_HUY
    );
    if (daHuy) throw new BadRequestError('Đơn hàng đã bị hủy trước đó');

    order.lichSuTrangThai.push({
      thoiGian: new Date(),
      trangThaiDonHang: TrangThaiDonHang.DA_HUY,
    });
    order.ngayCapNhat = new Date();
    await order.save();

    return {
      message: 'Hủy đơn hàng thành công',
      order,
    };
  }

  // Tính lại tổng tiền
  async recalculateTotal(maHoaDon: string) {
    const order = await orderModel.findById(maHoaDon);
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');

    const details = await orderDetailModel.find({ maHoaDon });
    const tongTienHang = details.reduce((sum, d) => sum + d.thanhTien, 0);

    const validPromotions = [];

    for (const km of order.khuyenMai) {
      const promo = await promotionModel.findOne({ maKhuyenMai: km.maKhuyenMai });
      if (!promo) {
        throw new BadRequestError(`Khuyến mãi '${km.maKhuyenMai}' không tồn tại.`);
      }

      const isValid = promotionService.isValidForOrder({ tongTienHang }, promo);
      if (!isValid) {
        throw new BadRequestError(`Khuyến mãi '${km.maKhuyenMai}' không đủ điều kiện để áp dụng.`);
      }

      validPromotions.push({
        maKhuyenMai: km.maKhuyenMai,
        loaiKhuyenMai: km.loaiKhuyenMai,
        giaTri: km.giaTri,
      });
    }

    const tongKhuyenMai = await promotionService.calculateDiscounts(validPromotions, tongTienHang);
    let tongTien = tongTienHang - tongKhuyenMai + order.phiVanChuyen;

    // Trừ điểm tích lũy (nếu có)
    if (order.diemTichLuySuDung && order.diemTichLuySuDung > 0) {
      tongTien -= order.diemTichLuySuDung;
      if (tongTien < 0) tongTien = 0; // Không cho tổng âm
    }

    order.tongTienHang = tongTienHang;
    order.tongTien = tongTien;
    order.khuyenMai = validPromotions;
    order.ngayCapNhat = new Date();

    await order.save();

    return order;
  }

  async caculateLoyaltyPoint(orderId: string) {
    const order = await orderModel.findById(orderId);
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');

    if (order.daCongDiemTichLuy) return; // đã cộng điểm rồi thì bỏ qua

    const user = await userModel.findById(order.maKhachHang);
    if (!user) throw new BadRequestError('Không tìm thấy người dùng.');

    const isPaid = order.thanhToan.trangThaiThanhToan === TrangThaiThanhToan.DA_THANH_TOAN;
    if (!isPaid) return;

    const diemCong = Math.floor(order.tongTien * 0.05);
    user.diemTichLuy += diemCong;
    user.lichSuDiem.push({
      thoiGian: new Date(),
      diem: diemCong,
      noiDung: `Cộng điểm từ đơn hàng ${order._id}`,
      diemConLai: user.diemTichLuy,
      loaiGiaoDich: LoaiGiaoDich.CONG
    });

    await user.save();
    order.daCongDiemTichLuy = true;
    await order.save();
  }


  // Lọc đơn hàng theo điều kiện
  async filterByDate({ ngay, thang, nam }: { ngay?: number, thang?: number, nam: number }) {
    let startDate: Date;
    let endDate: Date;

    if (ngay && thang) {
      startDate = new Date(Date.UTC(nam, thang - 1, ngay));
      endDate = new Date(Date.UTC(nam, thang - 1, ngay + 1));
    } else if (thang) {
      startDate = new Date(Date.UTC(nam, thang - 1, 1));
      endDate = new Date(Date.UTC(nam, thang, 1));
    } else {
      startDate = new Date(Date.UTC(nam, 0, 1));
      endDate = new Date(Date.UTC(nam + 1, 0, 1));
    }

    const orders = await orderModel.find({
      ngayTao: { $gte: startDate, $lt: endDate }
    })
    .populate('maKhachHang', 'ten')
    .populate('maNhanVien', 'ten')
    .sort({ ngayTao: -1 });

    return orders;
  }

  //Lấy danh sách các sản phẩm bán chạy
  async getTopSellingProducts(limit = 8) {
    const topProducts = await orderDetailModel.aggregate([
      {
        $group: {
          _id: "$maSanPham",
          soLuongDaBan: { $sum: "$soLuong" }
        }
      },
      {
        $addFields: {
          maSanPhamObjectId: { $toObjectId: "$_id" }
        }
      },
      {
        $lookup: {
          from: "sanphams",
          localField: "maSanPhamObjectId",
          foreignField: "_id",
          as: "sanPham"
        }
      },
      {
        $unwind: "$sanPham"
      },
      {
        $sort: { soLuongDaBan: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          _id: "$sanPham._id",
          ten: "$sanPham.ten",
          hinhAnh: "$sanPham.hinhAnh",
          soLuongDaBan: 1,
          giaCoBan: "$sanPham.giaCoBan",
          moTa: "$sanPham.moTa"
        }
      }
    ]);

    //Gán thứ hạng top bằng JS:
    return topProducts.map((item, index) => ({
      ...item,
      top: index + 1,
    }));
  }
}

export default new OrderService();
