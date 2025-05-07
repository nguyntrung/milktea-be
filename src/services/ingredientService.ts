import ingredientModel, { IngredientInput } from '../models/ingredientModel';
import { BadRequestError } from '../utils/errors';

class IngredientService {
  // Tạo mới nguyên liệu
  async create(data: IngredientInput) {
    const { ten, maNhaCungCap } = data;

    // Kiểm tra xem nguyên liệu đã tồn tại chưa
    const existingIngredient = await ingredientModel.findOne({ ten });
    if (existingIngredient) {
      throw new BadRequestError('Nguyên liệu đã tồn tại');
    }

    // Tạo nguyên liệu mới
    const ingredient = await ingredientModel.create({
      ...data,
      maNhaCungCap: Array.isArray(maNhaCungCap) ? maNhaCungCap : [maNhaCungCap], // Đảm bảo maNhaCungCap là mảng
      ngayCapNhat: new Date(),
    });

    return ingredient;
  }

  // Lấy tất cả nguyên liệu
  async getAll() {
    return await ingredientModel.find().sort({ ngayTao: -1 });
  }

  // Lấy nguyên liệu theo ID
  async getById(id: string) {
    const ingredient = await ingredientModel.findById(id);
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại');
    }
    return ingredient;
  }

  // Cập nhật nguyên liệu theo ID
  async update(id: string, data: Partial<IngredientInput>) {
    const ingredient = await ingredientModel.findById(id);
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại');
    }

    // Cập nhật nguyên liệu
    const updatedIngredient = await ingredientModel.findByIdAndUpdate(
      id,
      { ...data, ngayCapNhat: new Date() },
      { new: true }
    );
    return updatedIngredient;
  }

  // Xóa nguyên liệu theo ID
  async delete(id: string) {
    const ingredient = await ingredientModel.findById(id);
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại');
    }

    await ingredientModel.findByIdAndDelete(id);
    return { message: 'Xóa nguyên liệu thành công' };
  }
}

export default new IngredientService();
