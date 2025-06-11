import supplierModel, { SupplierInput, ISupplier } from '../models/supplierModel';
import { BadRequestError } from '../utils/errors';

class SupplierService {
  async create(data: SupplierInput) {
    const { ten, diaChi, lienHe } = data;

    // Check if supplier exists
    const existingSupplier = await supplierModel.findOne({ ten });
    if (existingSupplier) {
      throw new BadRequestError('Nhà cung cấp đã tồn tại');
    }

    // Create supplier
    const supplier = await supplierModel.create({
      ten,
      diaChi,
      lienHe,
      hoatDong: true,
    });

    return supplier;
  }

  async getAll() {
    return await supplierModel
      .find({ hoatDong: true })
      .sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const supplier = await supplierModel.findOne({ _id: id, hoatDong: true });
    if (!supplier) {
      throw new BadRequestError('Nhà cung cấp không tồn tại hoặc đã bị vô hiệu hóa');
    }
    return supplier;
  }

  async update(id: string, data: Partial<SupplierInput>) {
    const supplier = await supplierModel.findOne({ _id: id, hoatDong: true });
    if (!supplier) {
      throw new BadRequestError('Nhà cung cấp không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Check if new ten is unique
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

  async deactivate(id: string) {
    const supplier = await supplierModel.findOne({ _id: id, hoatDong: true });
    if (!supplier) {
      throw new BadRequestError('Nhà cung cấp không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const deactivatedSupplier = await supplierModel.findByIdAndUpdate(
      id,
      { hoatDong: false, ngayCapNhat: new Date() },
      { new: true }
    );

    return { message: 'Vô hiệu hóa nhà cung cấp thành công', supplier: deactivatedSupplier };
  }

    async delete(id: string) {
      const supplier = await supplierModel.findById(id);
      if (!supplier) {
        throw new BadRequestError('Nhà cung cấp không tồn tại');
      }

      // Xoá vĩnh viễn khỏi DB
      await supplierModel.findByIdAndDelete(id);

      return { message: 'Đã xoá nhà cung cấp thành công.' };
    }

}

export default new SupplierService();
