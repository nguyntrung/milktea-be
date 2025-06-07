import ingredientModel, { IngredientInput, IIngredient } from '../models/ingredientModel';
import supplierModel from '../models/supplierModel';
import { BadRequestError } from '../utils/errors';

class IngredientService {
  async create(data: IngredientInput) {
    const { ten, donViTinh, nhaCungCap, nguyenLieuHaoHut } = data;

    // Check if ingredient exists
    const existingIngredient = await ingredientModel.findOne({ ten });
    if (existingIngredient) {
      throw new BadRequestError('Nguyên liệu đã tồn tại');
    }

     if (!Array.isArray(nhaCungCap) || nhaCungCap.length === 0) {
      throw new BadRequestError('Phải cung cấp ít nhất một nhà cung cấp');
    }

    // Validate nhaCungCap
    const supplierIds = nhaCungCap.map(ncc => ncc.maNhacungCap);
    const validSuppliers = await supplierModel.find({ _id: { $in: supplierIds }, hoatDong: true });

    if (validSuppliers.length !== supplierIds.length) {
      throw new BadRequestError('Một hoặc nhiều nhà cung cấp không tồn tại hoặc đã bị vô hiệu hóa');
    }
    
    // Create ingredient
    const ingredient = await ingredientModel.create({
      ten,
      donViTinh,
      nhaCungCap,
      nguyenLieuHaoHut: nguyenLieuHaoHut ?? false,
      hoatDong: true,
      ngayTao: new Date(),
      ngayCapNhat: new Date()
    });

    return ingredient;
  }

  async getAll() {
    return await ingredientModel
      .find({ hoatDong: true })
      .populate('nhaCungCap', 'ten')
      .sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const ingredient = await ingredientModel
      .findOne({ _id: id, hoatDong: true })
      .populate('nhaCungCap', 'ten');
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

    // Validate nhaCungCap if provided
    if (data.nhaCungCap) {
      const supplierIds = data.nhaCungCap.map(ncc => ncc.maNhacungCap);
      const valid = await supplierModel.find({ _id: { $in: supplierIds }, hoatDong: true });
      if (valid.length !== supplierIds.length) {
        throw new BadRequestError('Một hoặc nhiều nhà cung cấp không tồn tại hoặc đã bị vô hiệu hóa');
      }
    }

    const updatedIngredient = await ingredientModel
      .findByIdAndUpdate(
        id,
        { ...data, ngayCapNhat: new Date() },
        { new: true }
      )
      .populate('nhaCungCap', 'ten');

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
      .populate('nhaCungCap', 'ten');

    return { message: 'Vô hiệu hóa nguyên liệu thành công', ingredient: deactivatedIngredient };
  }
}

export default new IngredientService();
