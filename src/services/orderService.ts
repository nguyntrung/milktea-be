import orderModel, { IOrder, OrderInput } from '../models/orderModel';
import orderDetailModel from '../models/orderDetailModel';
import promotionModel from '../models/promotionModel';
import { BadRequestError } from '../utils/errors';
import { TrangThaiDonHang, LoaiKhuyenMai } from '../types/common';

class OrderService {
  // Tạo đơn hàng mới
  async create(data: OrderInput) {
    const {
      maKhachHang,
      maNhanVien,
      nguoiGiao,
      thongTinNguoiNhan,
      khuyenMai = [],
      thanhToan,
      ghiChu = ''
    } = data;

    // Tạo đơn hàng với tổng tiền 0
    const order: IOrder = await orderModel.create({
      maKhachHang,
      maNhanVien,
      ngayLap: new Date(),
      tongTienHang: 0,
      khuyenMai, // Giữ nguyên thông tin khuyến mãi được truyền vào
      tongTien: 0,
      nguoiGiao,
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

  // Hàm cập nhật tổng tiền đơn hàng
  async recalculateTotal(maHoaDon: string) {
    const order = await orderModel.findById(maHoaDon);
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');

    const details = await orderDetailModel.find({ maHoaDon });
    const tongTienHang = details.reduce((sum, d) => sum + d.thanhTien, 0);

    let tongKhuyenMai = 0;

    if (Array.isArray(order.khuyenMai) && order.khuyenMai.length > 0) {
      for (const maKM of order.khuyenMai) {
        const kmDoc = await promotionModel.findById(maKM);
        if (!kmDoc) continue;

        if (kmDoc.loaiKhuyenMai === LoaiKhuyenMai.GIAM_PHAN_TRAM) {
          tongKhuyenMai += (tongTienHang * kmDoc.giaTri) / 100;
        } else if (kmDoc.loaiKhuyenMai === LoaiKhuyenMai.GIAM_TIEN) {
          tongKhuyenMai += kmDoc.giaTri;
        }
      }

      // Không để khuyến mãi vượt quá tổng tiền hàng
      if (tongKhuyenMai > tongTienHang) tongKhuyenMai = tongTienHang;
    }

    const tongTien = tongTienHang - tongKhuyenMai;

    order.tongTienHang = tongTienHang;
    order.tongTien = tongTien;
    order.ngayCapNhat = new Date();

    await order.save();

    return order;
  }
}

export default new OrderService();
