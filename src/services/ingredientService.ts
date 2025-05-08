import ingredientModel, { IngredientInput, IIngredient } from '../models/ingredientModel';
import supplierModel from '../models/supplierModel';
import { BadRequestError } from '../utils/errors';

class IngredientService {
  async create(data: IngredientInput) {
    const { ten, donViTinh, maNhaCungCap } = data;

    // Check if ingredient exists
    const existingIngredient = await ingredientModel.findOne({ ten });
    if (existingIngredient) {
      throw new BadRequestError('Nguyên liệu đã tồn tại');
    }

    // Validate maNhaCungCap
    const suppliers = Array.isArray(maNhaCungCap) ? maNhaCungCap : [maNhaCungCap];
    if (suppliers.length === 0) {
      throw new BadRequestError('Phải cung cấp ít nhất một nhà cung cấp');
    }

    const validSuppliers = await supplierModel.find({
      _id: { $in: suppliers },
      hoatDong: true,
    });
    if (validSuppliers.length !== suppliers.length) {
      throw new BadRequestError('Một hoặc nhiều nhà cung cấp không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Create ingredient
    const ingredient = await ingredientModel.create({
      ten,
      donViTinh,
      maNhaCungCap: suppliers,
      hoatDong: true,
    });

    return ingredient;
  }

  async getAll() {
    return await ingredientModel
      .find({ hoatDong: true })
      .populate('maNhaCungCap', 'ten')
      .sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const ingredient = await ingredientModel
      .findOne({ _id: id, hoatDong: true })
      .populate('maNhaCungCap', 'ten');
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại hoặc đã bị vô hiệu hóa');
    }
    return ingredient;
  }

  async update(id: string, data: Partial<IngredientInput>) {
    const ingredient = await ingredientModel.findOne({ _id: id, hoatDong: true });
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Check if new ten is unique
    if (data.ten && data.ten !== ingredient.ten) {
      const existingIngredient = await ingredientModel.findOne({ ten: data.ten });
      if (existingIngredient) {
        throw new BadRequestError('Tên nguyên liệu đã tồn tại');
      }
    }

    // Validate maNhaCungCap if provided
    if (data.maNhaCungCap) {
      const suppliers = Array.isArray(data.maNhaCungCap) ? data.maNhaCungCap : [data.maNhaCungCap];
      if (suppliers.length === 0) {
        throw new BadRequestError('Phải cung cấp ít nhất một nhà cung cấp');
      }

      const validSuppliers = await supplierModel.find({
        _id: { $in: suppliers },
        hoatDong: true,
      });
      if (validSuppliers.length !== suppliers.length) {
        throw new BadRequestError('Một hoặc nhiều nhà cung cấp không tồn tại hoặc đã bị vô hiệu hóa');
      }
      data.maNhaCungCap = suppliers;
    }

    const updatedIngredient = await ingredientModel
      .findByIdAndUpdate(
        id,
        { ...data, ngayCapNhat: new Date() },
        { new: true }
      )
      .populate('maNhaCungCap', 'ten');

    return updatedIngredient;
  }

  async deactivate(id: string) {
    const ingredient = await ingredientModel.findOne({ _id: id, hoatDong: true });
    if (!ingredient) {
      throw new BadRequestError('Nguyên liệu không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const deactivatedIngredient = await ingredientModel
      .findByIdAndUpdate(
        id,
        { hoatDong: false, ngayCapNhat: new Date() },
        { new: true }
      )
      .populate('maNhaCungCap', 'ten');

    return { message: 'Vô hiệu hóa nguyên liệu thành công', ingredient: deactivatedIngredient };
  }
}

export default new IngredientService();
