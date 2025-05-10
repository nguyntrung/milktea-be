import categoryModel, { CategoryInput, ICategory } from '../models/categoryModel';
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
      hoatDong: true,
    });

    return category;
  }

  async getAll() {
    return await categoryModel
      .find({ hoatDong: true })
      .sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const category = await categoryModel.findOne({ _id: id, hoatDong: true });
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại hoặc đã bị vô hiệu hóa');
    }
    return category;
  }

  async update(id: string, data: Partial<CategoryInput>) {
    const category = await categoryModel.findOne({ _id: id, hoatDong: true });
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Check if new ten is unique
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

  async deactivate(id: string) {
    const category = await categoryModel.findOne({ _id: id, hoatDong: true });
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const deactivatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { hoatDong: false, ngayCapNhat: new Date() },
      { new: true }
    );

    return { message: 'Vô hiệu hóa danh mục thành công', category: deactivatedCategory };
  }
}

export default new CategoryService();
