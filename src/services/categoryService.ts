import categoryModel, { CategoryInput, ICategory } from '../models/categoryModel';
import { BadRequestError } from '../utils/errors';
import cloudinary from '../config/cloudinary';
import fs from 'fs/promises';

class CategoryService {
  async create(data: CategoryInput, file?: Express.Multer.File) {
    const { ten } = data;

    // Check if category exists
    const existingCategory = await categoryModel.findOne({ ten });
    if (existingCategory) {
      throw new BadRequestError('Danh mục đã tồn tại');
    }

    let hinhAnh = '';
    if (file) {
      try {
        // Upload ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'category_images',
          resource_type: 'image',
          transformation: [{ width: 300, height: 300, crop: 'fit', quality: 'auto' }],
        });
        hinhAnh = result.secure_url;

        // Xóa file tạm sau khi upload
        await fs.unlink(file.path);
      } catch (error) {
        throw new BadRequestError('Không thể upload hình ảnh lên Cloudinary');
      }
    }

    // Create category
    const category = await categoryModel.create({
      ten,
      hinhAnh,
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

  async update(id: string, data: Partial<CategoryInput>, file?: Express.Multer.File) {
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

    let hinhAnh = category.hinhAnh;
    if (file) {
      try {
        // Xóa ảnh cũ trên Cloudinary nếu tồn tại
        if (category.hinhAnh) {
          const publicId = category.hinhAnh.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`category_images/${publicId}`);
          }
        }

        // Upload ảnh mới lên Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'category_images',
          resource_type: 'image',
          transformation: [{ width: 300, height: 300, crop: 'fit', quality: 'auto' }],
        });
        hinhAnh = result.secure_url;

        // Xóa file tạm sau khi upload
        await fs.unlink(file.path);
      } catch (error) {
        throw new BadRequestError('Không thể upload hình ảnh lên Cloudinary');
      }
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { ...data, hinhAnh, ngayCapNhat: new Date() },
      { new: true }
    );

    return updatedCategory;
  }

  async deactivate(id: string) {
    const category = await categoryModel.findOne({ _id: id, hoatDong: true });
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Xóa ảnh trên Cloudinary khi vô hiệu hóa
    if (category.hinhAnh) {
      const publicId = category.hinhAnh.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`category_images/${publicId}`);
      }
    }

    const deactivatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { hoatDong: false, hinhAnh: '', ngayCapNhat: new Date() },
      { new: true }
    );

    return { message: 'Vô hiệu hóa danh mục thành công', category: deactivatedCategory };
  }

    async delete(id: string) {
      const category = await categoryModel.findById(id);
      if (!category) {
        throw new BadRequestError('Danh mục không tồn tại');
      }

      // Xóa ảnh khỏi Cloudinary nếu có
      if (category.hinhAnh) {
        const publicId = category.hinhAnh.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`category_images/${publicId}`);
        }
      }

      // Xoá khỏi database
      await categoryModel.findByIdAndDelete(id);

      return { message: 'Đã xoá danh mục thành công.' };
    }

}

export default new CategoryService();
