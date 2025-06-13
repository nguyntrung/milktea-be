import orderDetailModel, { IOrderDetail, OrderDetailInput } from '../models/orderDetailModel';
import statisticIngredientService from './statisticIngredientService';
import orderService from './orderService';
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

    //Gán hình ảnh của sản phẩm
    const hinhAnhProduct = Array.isArray(product.hinhAnh) ? product.hinhAnh[0] || null : product.hinhAnh || null;

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

    // Sau khi tính tongTopping
    const toppingWithGia = await Promise.all(data.topping.map(async (topping) => {
      const toppingDoc = await toppingModel.findById(topping.maTopping);
      if (!toppingDoc) {
        throw new BadRequestError(`Topping với ID ${topping.maTopping} không tồn tại`);
      }
      return {
        ...topping,
        gia: toppingDoc.gia, // thêm giá
      };
    }));


    // Tính thành tiền
    const thanhTien = (donGia + tongTopping) * data.soLuong;

    const orderDetail = new orderDetailModel({
      ...data,
      topping: toppingWithGia,
      hinhAnh: hinhAnhProduct,
      donGia,
      thanhTien,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    await orderDetail.save();

    await statisticIngredientService.getDailyIngredientStatistic(new Date());

    //Tính lại tổng tiền đơn hàng
    const allDetails = await orderDetailModel.find({ maHoaDon });
    const tongTienHang = allDetails.reduce((sum, d) => sum + d.thanhTien, 0);

    // Gọi OrderService để tính lại tổng tiền (có khuyến mãi)
    await orderService.recalculateTotal(data.maHoaDon);

    // **Cập nhật trừ kho nguyên liệu**
    await statisticIngredientService.deductIngredientsByOrder(data.maHoaDon);

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

    if (!updated) {
      throw new BadRequestError('Cập nhật chi tiết đơn hàng thất bại');
    }
      // Cập nhật lại tổng tiền đơn hàng
    await orderService.recalculateTotal(updated.maHoaDon);
    
    await statisticIngredientService.getDailyIngredientStatistic(new Date());

    // ** Gọi trừ kho nguyên liệu **
    await statisticIngredientService.deductIngredientsByOrder(updated.maHoaDon);
    
    return updated;
  }

  // Xóa chi tiết đơn hàng
  async delete(id: string) {
    const detail = await orderDetailModel.findById(id);
    if (!detail) {
      throw new BadRequestError('Chi tiết đơn hàng không tồn tại');
    }

    const maHoaDon = detail.maHoaDon; // Lưu lại mã hóa đơn trước khi xóa

    await orderDetailModel.findByIdAndDelete(id);

    // Sau khi xóa thì cập nhật lại tổng tiền đơn hàng
    await orderService.recalculateTotal(maHoaDon);

    // ** Gọi trừ kho nguyên liệu **
    await statisticIngredientService.deductIngredientsByOrder(maHoaDon);

    return { message: 'Xóa chi tiết đơn hàng thành công' };
  }
}

export default new OrderDetailService();
