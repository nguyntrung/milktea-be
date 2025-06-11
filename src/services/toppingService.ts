import toppingModel, { ToppingInput, ITopping } from '../models/toppingModel';
import { BadRequestError } from '../utils/errors';

class ToppingService {
  async create(data: ToppingInput) {
    const { ten, gia, donViTinh, soLuongMotPhan } = data;

    // Check if topping exists
    const existingTopping = await toppingModel.findOne({ ten });
    if (existingTopping) {
      throw new BadRequestError('Topping đã tồn tại');
    }

    // Validate gia and soLuongMotPhan
    if (gia < 0) {
      throw new BadRequestError('Giá không thể âm');
    }
    if (soLuongMotPhan < 0) {
      throw new BadRequestError('Số lượng một phần không thể âm');
    }

    // Create topping
    const topping = await toppingModel.create({
      ten,
      gia,
      donViTinh,
      soLuongMotPhan,
      hoatDong: true,
    });

    return topping;
  }

  async getAll() {
    return await toppingModel
      .find({ hoatDong: true })
      .sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const topping = await toppingModel.findOne({ _id: id, hoatDong: true });
    if (!topping) {
      throw new BadRequestError('Topping không tồn tại hoặc đã bị vô hiệu hóa');
    }
    return topping;
  }

  async update(id: string, data: Partial<ToppingInput>) {
    const topping = await toppingModel.findOne({ _id: id, hoatDong: true });
    if (!topping) {
      throw new BadRequestError('Topping không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Check if new ten is unique
    if (data.ten && data.ten !== topping.ten) {
      const existingTopping = await toppingModel.findOne({ ten: data.ten });
      if (existingTopping) {
        throw new BadRequestError('Tên topping đã tồn tại');
      }
    }

    // Validate gia and soLuongMotPhan
    if (data.gia !== undefined && data.gia < 0) {
      throw new BadRequestError('Giá không thể âm');
    }
    if (data.soLuongMotPhan !== undefined && data.soLuongMotPhan < 0) {
      throw new BadRequestError('Số lượng một phần không thể âm');
    }

    const updatedTopping = await toppingModel.findByIdAndUpdate(
      id,
      { ...data, ngayCapNhat: new Date() },
      { new: true }
    );

    return updatedTopping;
  }

  async deactivate(id: string) {
    const topping = await toppingModel.findOne({ _id: id, hoatDong: true });
    if (!topping) {
      throw new BadRequestError('Topping không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const deactivatedTopping = await toppingModel.findByIdAndUpdate(
      id,
      { hoatDong: false, ngayCapNhat: new Date() },
      { new: true }
    );

    return { message: 'Vô hiệu hóa topping thành công', topping: deactivatedTopping };
  }

    async delete(id: string) {
      const supplier = await toppingModel.findById(id);
      if (!supplier) {
        throw new BadRequestError('Nhà cung cấp không tồn tại');
      }

      // Xoá vĩnh viễn khỏi DB
      await toppingModel.findByIdAndDelete(id);

      return { message: 'Đã xoá nhà cung cấp vĩnh viễn khỏi hệ thống.' };
    }
}

export default new ToppingService();
