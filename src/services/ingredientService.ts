import ingredientModel, { IngredientInput } from '../models/ingredientModel';
import { BadRequestError } from '../utils/errors';

class IngredientService {
  async create(data: IngredientInput) {
    const { ten } = data;

    // Check if ingredient exists
    const existingIngredient = await ingredientModel.findOne({ ten });
    if (existingIngredient) {
      throw new BadRequestError('Nguyên liệu đã tồn tại');
    }

    // Create ingredient
    const ingredient = await ingredientModel.create({
      ...data,
      ngayCapNhat: new Date(),
    });

    return ingredient;
  }

  async getAll() {
    return await ingredientModel.find().sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const ingredient = await ingredientModel.findById(id);
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại');
    }
    return ingredient;
  }

  async update(id: string, data: Partial<IngredientInput>) {
    const ingredient = await ingredientModel.findById(id);
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại');
    }

    const updatedIngredient = await ingredientModel.findByIdAndUpdate(
      id,
      { ...data, ngayCapNhat: new Date() },
      { new: true }
    );
    return updatedIngredient;
  }

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
