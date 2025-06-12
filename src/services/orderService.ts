import orderModel, { IOrder, OrderInput } from '../models/orderModel';
import orderDetailModel from '../models/orderDetailModel';
import promotionService from './promotionService';
import promotionModel from '../models/promotionModel';
import { BadRequestError } from '../utils/errors';
import { TrangThaiDonHang, LoaiKhuyenMai } from '../types/common';
import notificationService from './notificationService';
import { LoaiThongBao } from '../types/common';

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

    // Tạo đơn hàng với tổng tiền 0
    const order: IOrder = await orderModel.create({
      maKhachHang,
      maNhanVien,
      ngayLap: new Date(),
      tongTienHang: 0,
      khuyenMai : fullPromotionList, 
      nguoiGiao,
      phiVanChuyen,
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

    //Tạo thông báo
    try {
      await notificationService.create({
        tieuDe: 'Đơn hàng mới',
        noiDung: `Khách hàng đã tạo đơn hàng mới.`,
        loaiThongBao: LoaiThongBao.DON_HANG_MOI,
        maNguoiNhan: maNhanVien, // hoặc ID admin xử lý đơn hàng
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

  // Cập nhật trạng thái đơn hàng
  async updateStatus(id: string, trangThaiDonHang: TrangThaiDonHang) {
    const order = await orderModel.findById(id);
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');

    order.lichSuTrangThai.push({
      thoiGian: new Date(),
      trangThaiDonHang,
    });
    order.ngayCapNhat = new Date();
    await order.save();

    // Gửi thông báo đến khách hàng
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

  //Tinsh lại tổng tiền
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
    const tongTien = tongTienHang - tongKhuyenMai + order.phiVanChuyen;

    order.tongTienHang = tongTienHang;
    order.tongTien = tongTien;
    order.khuyenMai = validPromotions;
    order.ngayCapNhat = new Date();

    await order.save();

    return order;
  }

  //lọc đơn hàng theo điều kiện
  async filterByDate({ ngay, thang, nam }: { ngay?: number, thang?: number, nam: number }) {
    let startDate: Date;
    let endDate: Date;

    if (ngay && thang) {
      // Lọc theo ngày cụ thể
      startDate = new Date(Date.UTC(nam, thang - 1, ngay));
      endDate = new Date(Date.UTC(nam, thang - 1, ngay + 1));
    } else if (thang) {
      // Lọc theo tháng
      startDate = new Date(Date.UTC(nam, thang - 1, 1));
      endDate = new Date(Date.UTC(nam, thang, 1));
    } else {
      // Lọc theo năm
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

}

export default new OrderService();
