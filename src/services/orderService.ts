import orderModel, { IOrder, OrderInput } from '../models/orderModel';
import orderDetailModel from '../models/orderDetailModel';
import { BadRequestError } from '../utils/errors';
import { TrangThaiDonHang } from '../types/common';

class OrderService {
  // Tạo đơn hàng mới
  async create(data: OrderInput) {
    const {
      maKhachHang,
      maNhanVien,
      nguoiGiao,
      thongTinNguoiNhan,
      //khuyenMai = [],
      thanhToan,
      ghiChu = ''
    } = data;
  
    // Khởi tạo đơn hàng mới với tổng tiền = 0 (sẽ cập nhật sau khi thêm chi tiết)
    const order: IOrder = await orderModel.create({
      maKhachHang,
      maNhanVien,
      ngayLap: new Date(),
      tongTienHang: 0,
      //xkhuyenMai,
      tongTien: 0,
      nguoiGiao,
      thongTinNguoiNhan,
      thanhToan,
      lichSuTrangThai: [{
        thoiGian: new Date(),
        trangThaiDonHang: TrangThaiDonHang.CHO_XU_LY,
      }],
      ghiChu,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });
  
    return order;
  }

  // Lấy tất cả đơn hàng
  async getAll() {
    return await orderModel
      .find()
      .populate('maKhachHang', 'ten')
      .populate('maNhanVien', 'ten')
      //.populate('khuyenMai.maKhuyenMai', 'ten')
      .sort({ ngayTao: -1 });
  }

  // Lấy đơn hàng theo ID
  async getById(id: string) {
    const order = await orderModel
      .findById(id)
      .populate('maKhachHang', 'ten')
      .populate('maNhanVien', 'ten')
      //.populate('khuyenMai.maKhuyenMai', 'ten');
    if (!order) throw new BadRequestError('Đơn hàng không tồn tại');
    return order;
  }

  // Lấy danh sách đơn hàng theo mã khách hàng
  async getByCustomerId(maKhachHang: string) {
    const orders = await orderModel
      .find({ maKhachHang })
      .populate('maNhanVien', 'ten')
      //.populate('khuyenMai.maKhuyenMai', 'ten')
      .sort({ ngayTao: -1 });

    return orders;
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
    if (!order) {
      throw new BadRequestError('Đơn hàng không tồn tại');
    }

    // Nếu đã bị hủy trước đó thì không làm lại
    const daHuy = order.lichSuTrangThai.some(
      trangThai => trangThai.trangThaiDonHang === TrangThaiDonHang.DA_HUY
    );
    if (daHuy) {
      throw new BadRequestError('Đơn hàng đã bị hủy trước đó');
    }

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
}

export default new OrderService();
