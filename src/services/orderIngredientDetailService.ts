import orderIngredientDetailModel, { OrderIngredientDetailInput } from '../models/orderIngredientDetailModel';
import orderIngredientModel from '../models/orderIngredientModel';
import { BadRequestError } from '../utils/errors';

class OrderIngredientDetailService {
  // Tạo mới chi tiết đơn đặt nguyên liệu
  async create(data: OrderIngredientDetailInput) {
    const { maDonDat, maNguyenLieu, soLuong, donGia } = data;

    const thanhTien = donGia * soLuong; // Tính thanh tiền mặc định

    const orderIngredientDetail = await orderIngredientDetailModel.create({
      maDonDat,
      maNguyenLieu,
      soLuong,
      donGia,
      thanhTien,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    // Sau khi tạo chi tiết => tính lại tổng tiền
    await this.calculateAndUpdateTongTien(maDonDat);

    return orderIngredientDetail;
  }

  // Hàm tính và cập nhật tổng tiền vào đơn đặt nguyên liệu
  async calculateAndUpdateTongTien(maDonDat: string) {
    const details = await orderIngredientDetailModel.find({ maDonDat });

    const tongTien = details.reduce((sum, detail) => sum + detail.thanhTien, 0);

    // Cập nhật vào đơn đặt nguyên liệu
    await orderIngredientModel.findOneAndUpdate(
      { maDonDat },
      { tongTien, ngayCapNhat: new Date() },
      { new: true }
    );
  }

  // Lấy tất cả chi tiết đơn đặt nguyên liệu
  async getAll() {
    return await orderIngredientDetailModel.find().sort({ ngayTao: -1 });
  }

  // Lấy chi tiết đơn đặt nguyên liệu theo ID
  async getById(id: string) {
    const orderIngredientDetail = await orderIngredientDetailModel.findById(id);
    if (!orderIngredientDetail) {
      throw new BadRequestError('Chi tiết đơn đặt nguyên liệu không tồn tại');
    }
    return orderIngredientDetail;
  }

  // Cập nhật chi tiết đơn đặt nguyên liệu
  async update(id: string, data: any) {
    const orderIngredientDetail = await orderIngredientDetailModel.findById(id);
    if (!orderIngredientDetail) {
      throw new BadRequestError('Chi tiết đơn đặt nguyên liệu không tồn tại');
    }

    let thanhTien = data.donGia * data.soLuong;

    const updatedOrderIngredientDetail = await orderIngredientDetailModel.findByIdAndUpdate(
      id,
      {
        ...data,
        thanhTien,
        ngayCapNhat: new Date(),
      },
      { new: true }
    );

    return updatedOrderIngredientDetail;
  }

  async delete(id: string) {
    const orderIngredientDetail = await orderIngredientDetailModel.findById(id);
    if (!orderIngredientDetail) {
      throw new BadRequestError('Chi tiết đơn đặt nguyên liệu không tồn tại');
    }

    await orderIngredientDetailModel.findByIdAndDelete(id);
    return { message: 'Xóa chi tiết đơn đặt nguyên liệu thành công' };
  }
}

export default new OrderIngredientDetailService();
