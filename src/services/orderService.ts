import orderModel, { IOrder } from '../models/orderModel';
import productModel from '../models/productModel';
import toppingModel from '../models/toppingModel';
//import discountModel from '../models/discountModel'; // Giả sử bạn có model khuyến mãi
import { BadRequestError } from '../utils/errors';

class OrderService {
   // Tạo đơn hàng mới
  async create(data: IOrder) {
    const { maNguoiDung, sanPham } = data;

    // Tính tổng giá trị của đơn hàng
    let tongGia = 0;

    // Duyệt qua từng sản phẩm trong đơn hàng
    for (const item of sanPham) {
      // Lấy sản phẩm từ database
      const product = await productModel.findById(item.maSanPham);
      if (!product) {
        throw new BadRequestError(`Sản phẩm với ID ${item.maSanPham} không tồn tại.`);
      }
      
      // Xác định giá của sản phẩm dựa trên kích thước
      let productPrice: number;
      if (item.kichCo.nho == 1) {
        productPrice = product.gia.nho;
      } else if (item.kichCo.vua == 1) {
        productPrice = product.gia.vua;
      } else if (item.kichCo.lon == 1) {
        productPrice = product.gia.lon;
      } else {
        throw new BadRequestError(`Kích thước sản phẩm không hợp lệ: ${item.kichCo}`);
      }

      // Tính giá của sản phẩm dựa trên số lượng
      item.gia = productPrice * item.soLuong;

      // Cộng dồn vào tổng giá của đơn hàng
      tongGia += item.gia;

      // Kiểm tra topping (nếu có)
      if (item.topping && item.topping.length > 0) {
        for (const toppingId of item.topping) {
          const topping = await toppingModel.findById(toppingId);
          if (!topping) {
            throw new BadRequestError(`Topping ${toppingId} không tồn tại`);
          }
          // Có thể tính thêm chi phí cho topping ở đây nếu cần
          tongGia += topping.gia;
        }
      }
    }
    // Tạo đơn hàng
    const order = new orderModel({
      ...data,
      tongGia,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    await order.save();
    return order;
  }

  // Lấy tất cả đơn hàng
  async getAll() {
    return await orderModel
      .find()
      .populate('maNguoiDung', 'ten')
      .populate('sanPham.maSanPham', 'ten gia')
      .populate('sanPham.topping', 'ten')
      .populate('giamGia.maKhuyenMai', 'ten soTien')
      .sort({ ngayTao: -1 });
  }

  // Lấy đơn hàng theo ID
  async getById(id: string) {
    const order = await orderModel
      .findById(id)
      .populate('maNguoiDung', 'ten')
      .populate('sanPham.maSanPham', 'ten gia')
      .populate('sanPham.topping', 'ten')
      .populate('giamGia.maKhuyenMai', 'ten soTien');
    if (!order) {
      throw new BadRequestError('Đơn hàng không tồn tại');
    }
    return order;
  }

  // Cập nhật trạng thái đơn hàng
  async updateStatus(id: string, statusUpdate: Partial<IOrder['trangThai']>) {
    const order = await orderModel.findById(id);
    if (!order) {
      throw new BadRequestError('Đơn hàng không tồn tại');
    }

    const updatedOrder = await orderModel
      .findByIdAndUpdate(id, { $set: { trangThai: statusUpdate, ngayCapNhat: new Date() } }, { new: true })
      .populate('maNguoiDung', 'ten')
      .populate('sanPham.maSanPham', 'ten gia')
      .populate('sanPham.topping', 'ten')
      .populate('giamGia.maKhuyenMai', 'ten soTien');

    return updatedOrder;
  }

  // Xóa đơn hàng
  async delete(id: string) {
    const order = await orderModel.findById(id);
    if (!order) {
      throw new BadRequestError('Đơn hàng không tồn tại');
    }

    await orderModel.findByIdAndDelete(id);
    return { message: 'Xóa đơn hàng thành công' };
  }
}

export default new OrderService();
