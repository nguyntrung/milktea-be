import orderIngredientModel, { OrderIngredientInput } from '../models/orderIngredientModel';
import { BadRequestError } from '../utils/errors';

class orderIngredientService {
  async create(data: OrderIngredientInput) {
    const {
      maNhaCungCap,
      thoiGianCanGiao,
      nguyenLieu,
      trangThai,
      nguoiNhap,
      ngayNhap,
      ghiChu,
      nguoiDat
    } = data;

    // Xử lý nguyên liệu: tính donGia & thanhTien nếu có
    const processedNguyenLieu = nguyenLieu.map(item => {
      const soLuong = item.soLuong ?? 0;
      const donGia = item.donGia ?? 0;
      const thanhTien = soLuong * donGia;

      return {
        ...item,
        donGia,
        thanhTien,
      };
    });

    // Tính tổng tiền từ tất cả nguyên liệu
    const tongTien = processedNguyenLieu.reduce((sum, item) => sum + (item.thanhTien || 0), 0);

    const order = await orderIngredientModel.create({
      maNhaCungCap,
      ngayDat: new Date(),
      thoiGianCanGiao,
      nguyenLieu: processedNguyenLieu,
      trangThai,
      ghiChu,
      nguoiDat,
      nguoiNhap: null,
      ngayNhap,
      tongTien,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    return order;
  }

  async getAll() {
    return await orderIngredientModel.find().sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const order = await orderIngredientModel.findById(id);
    if (!order) {
      throw new BadRequestError('Đơn đặt nguyên liệu không tồn tại');
    }
    return order;
  }

  async update(id: string, data: any) {
    const order = await orderIngredientModel.findById(id);
    if (!order) {
      throw new BadRequestError('Đơn đặt nguyên liệu không tồn tại');
    }

    let nguyenLieu = order.nguyenLieu;

    // Nếu có cập nhật nguyên liệu => xử lý lại donGia & thanhTien
    if (data.nguyenLieu && Array.isArray(data.nguyenLieu)) {
      nguyenLieu = data.nguyenLieu.map((item: any) => {
        const donGia = item.donGia ?? 0;
        const soLuong = item.soLuong ?? 0;
        const thanhTien = donGia * soLuong;
        return {
          ...item,
          donGia,
          thanhTien,
        };
      });
    }

    // Tính tổng tiền mới
    const tongTien = nguyenLieu.reduce((sum, item) => sum + (item.thanhTien || 0), 0);

    const updatedOrder = await orderIngredientModel.findByIdAndUpdate(
      id,
      {
        ...data,
        nguyenLieu,
        tongTien,
        ngayNhap: data.ngayNhap || order.ngayNhap,
        nguoiNhap: data.nguoiNhap || order.nguoiNhap,
        ngayCapNhat: new Date(),
      },
      { new: true }
    );

    return updatedOrder;
  }

  async delete(id: string) {
    const order = await orderIngredientModel.findById(id);
    if (!order) {
      throw new BadRequestError('Đơn đặt nguyên liệu không tồn tại');
    }

    await orderIngredientModel.findByIdAndDelete(id);
    return { message: 'Xóa đơn đặt nguyên liệu thành công' };
  }
}

export default new orderIngredientService();
