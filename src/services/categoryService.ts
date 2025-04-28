import categoryModel, { CategoryInput } from '../models/categoryModel';
import { BadRequestError } from '../utils/errors';

class CategoryService {
  async create(data: CategoryInput) {
    const { ten } = data;

    // Check if category exists
    const existingCategory = await categoryModel.findOne({ ten });
    if (existingCategory) {
      throw new BadRequestError('Danh mục đã tồn tại');
    }

    // Create category
    const category = await categoryModel.create({
      ten,
      ngayCapNhat: new Date(),
    });

    return category;
  }

  async getAll() {
    return await categoryModel.find().sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const category = await categoryModel.findById(id);
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại');
    }
    return category;
  }

  async update(id: string, data: Partial<CategoryInput>) {
    const category = await categoryModel.findById(id);
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại');
    }

    // Check if new name is unique
    if (data.ten && data.ten !== category.ten) {
      const existingCategory = await categoryModel.findOne({ ten: data.ten });
      if (existingCategory) {
        throw new BadRequestError('Tên danh mục đã tồn tại');
      }
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { ...data, ngayCapNhat: new Date() },
      { new: true }
    );
    return updatedCategory;
  }

  async delete(id: string) {
    const category = await categoryModel.findById(id);
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại');
    }

    await categoryModel.findByIdAndDelete(id);
    return { message: 'Xóa danh mục thành công' };
  }
}

export default new CategoryService();
