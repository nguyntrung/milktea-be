import orderDetailModel, { IOrderDetail, OrderDetailInput } from '../models/orderDetailModel';
import orderModel from '../models/orderModel';
import productModel from '../models/productModel';
import toppingModel from '../models/toppingModel';
import { BadRequestError } from '../utils/errors';

class OrderDetailService {
  // Tạo chi tiết đơn hàng
  async create(data: OrderDetailInput) {
    const {maSanPham, maHoaDon} = data;
    // Kiểm tra sản phẩm có tồn tại
    const product = await productModel.findById(maSanPham);
    if (!product) {
      throw new BadRequestError(`Sản phẩm với ID ${maSanPham} không tồn tại`);
    }

    // Tính đơn giá
    const donGia = product.giaCoBan + data.kichCo.giaTang;

    // Tính tổng topping
    let tongTopping = 0;
    for (const topping of data.topping) {
      const toppingDoc = await toppingModel.findById(topping.maTopping);
      if (!toppingDoc) {
        throw new BadRequestError(`Topping với ID ${topping.maTopping} không tồn tại`);
      }
      const giaTopping = toppingDoc.gia;
      tongTopping += giaTopping * (topping.soLuong || 1);
    }

    // Tính thành tiền
    const thanhTien = (donGia * data.soLuong) + tongTopping;

    const orderDetail = new orderDetailModel({
      ...data,
      donGia,
      thanhTien,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    await orderDetail.save();
    //Tính lại tổng tiền đơn hàng
    const allDetails = await orderDetailModel.find({ maHoaDon });
    const tongTienHang = allDetails.reduce((sum, d) => sum + d.thanhTien, 0);

    //Cập nhật tổng tiền vào đơn hàng
    await orderModel.findByIdAndUpdate(maHoaDon, {
      $set: {
        tongTienHang,
        tongTien: tongTienHang, // nếu có khuyến mãi thì trừ chỗ này
        ngayCapNhat: new Date(),
      },
    });

    return orderDetail;
  }

  // Lấy tất cả chi tiết đơn hàng
  async getAll() {
    return await orderDetailModel
      .find()
      .populate('maSanPham', 'ten')
      .populate('maHoaDon', '_id')
      .populate('topping.maTopping', 'ten');
  }

  // Lấy chi tiết đơn hàng theo mã hóa đơn
  async getByOrderId(maHoaDon: string) {
    return await orderDetailModel
      .find({ maHoaDon })
      .populate('maSanPham', 'ten')
      .populate('topping.maTopping', 'ten');
  }

  // Cập nhật chi tiết đơn hàng
  async update(id: string, updateData: Partial<IOrderDetail>) {
    const detail = await orderDetailModel.findById(id);
    if (!detail) {
      throw new BadRequestError('Chi tiết đơn hàng không tồn tại');
    }

    const updated = await orderDetailModel.findByIdAndUpdate(
      id,
      { $set: { ...updateData, ngayCapNhat: new Date() } },
      { new: true }
    );

    return updated;
  }

  // Xóa chi tiết đơn hàng
  async delete(id: string) {
    const detail = await orderDetailModel.findById(id);
    if (!detail) {
      throw new BadRequestError('Chi tiết đơn hàng không tồn tại');
    }

    await orderDetailModel.findByIdAndDelete(id);
    return { message: 'Xóa chi tiết đơn hàng thành công' };
  }
}

export default new OrderDetailService();
