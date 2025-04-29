import toppingModel, { ToppingInput } from '../models/toppingModel';
import { BadRequestError } from '../utils/errors';

class ToppingService {
  async create(data: ToppingInput) {
    const { ten } = data;

    // Check if topping exists
    const existingTopping = await toppingModel.findOne({ ten });
    if (existingTopping) {
      throw new BadRequestError('Topping đã tồn tại');
    }

    // Create topping
    const topping = await toppingModel.create({
      ...data,
      ngayCapNhat: new Date(),
    });

    return topping;
  }

  async getAll() {
    return await toppingModel.find().sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const topping = await toppingModel.findById(id);
    if (!topping) {
      throw new BadRequestError('Topping không tồn tại');
    }
    return topping;
  }

  async update(id: string, data: Partial<ToppingInput>) {
    const topping = await toppingModel.findById(id);
    if (!topping) {
      throw new BadRequestError('Topping không tồn tại');
    }

    // Check if new name is unique
    if (data.ten && data.ten !== topping.ten) {
      const existingTopping = await toppingModel.findOne({ ten: data.ten });
      if (existingTopping) {
        throw new BadRequestError('Tên topping đã tồn tại');
      }
    }

    const updatedTopping = await toppingModel.findByIdAndUpdate(
      id,
      { ...data, ngayCapNhat: new Date() },
      { new: true }
    );
    return updatedTopping;
  }

  async delete(id: string) {
    const topping = await toppingModel.findById(id);
    if (!topping) {
      throw new BadRequestError('Topping không tồn tại');
    }

    await toppingModel.findByIdAndDelete(id);
    return { message: 'Xóa topping thành công' };
  }
}

export default new ToppingService();
