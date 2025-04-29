import ingredientModel from '../models/ingredientModel';
import supplierModel, { SupplierInput } from '../models/supplierModel';
import { BadRequestError } from '../utils/errors';

class SupplierService {
  async create(data: SupplierInput) {
    const { ten } = data;

    // Check if supplier exists
    const existingSupplier = await supplierModel.findOne({ ten });
    if (existingSupplier) {
      throw new BadRequestError('Nhà cung cấp đã tồn tại');
    }

    // Create supplier
    const supplier = await supplierModel.create({
      ...data,
      ngayCapNhat: new Date(),
    });

    return supplier;
  }

  async getAll() {
    return await supplierModel.find().sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const supplier = await supplierModel.findById(id);
    if (!supplier) {
      throw new BadRequestError('Nhà cung cấp không tồn tại');
    }
    return supplier;
  }

  async update(id: string, data: Partial<SupplierInput>) {
    const supplier = await supplierModel.findById(id);
    if (!supplier) {
      throw new BadRequestError('Nhà cung cấp không tồn tại');
    }

    // Check if new name is unique
    if (data.ten && data.ten !== supplier.ten) {
      const existingSupplier = await supplierModel.findOne({ ten: data.ten });
      if (existingSupplier) {
        throw new BadRequestError('Tên nhà cung cấp đã tồn tại');
      }
    }

    const updatedSupplier = await supplierModel.findByIdAndUpdate(
      id,
      { ...data, ngayCapNhat: new Date() },
      { new: true }
    );
    return updatedSupplier;
  }

  async delete(id: string) {
    const supplier = await supplierModel.findById(id);
    if (!supplier) {
      throw new BadRequestError('Nhà cung cấp không tồn tại');
    }

    // Check if supplier is referenced by NguyenLieu
    const ingredient = await ingredientModel.findOne({ maNhaCungCap: id });
    if (ingredient) {
      throw new BadRequestError('Không thể xóa nhà cung cấp vì đang được sử dụng trong nguyên liệu');
    }

    await supplierModel.findByIdAndDelete(id);
    return { message: 'Xóa nhà cung cấp thành công' };
  }
}

export default new SupplierService();
