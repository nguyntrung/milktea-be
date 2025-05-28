import storeModel, { IStore, StoreInput } from '../models/storeModel';
import { BadRequestError } from '../utils/errors';
import cloudinary from '../config/cloudinary';
import fs from 'fs/promises';

class StoreService {
  /**
   * Lấy thông tin cửa hàng từ MongoDB
   * @throws {BadRequestError} Nếu không tìm thấy thông tin cửa hàng
   * @returns {Promise<IStore>} Thông tin cửa hàng
   */
  async getStoreInfo(): Promise<IStore> {
    const store = await storeModel.findOne({});
    if (!store) {
      throw new BadRequestError('Thông tin cửa hàng không tồn tại');
    }
    return store;
  }

  /**
   * Cập nhật hoặc tạo mới thông tin cửa hàng, hỗ trợ upload logo lên Cloudinary
   * @param data Dữ liệu cập nhật (tên, địa chỉ, số điện thoại, email, website)
   * @param file File logo (nếu có)
   * @throws {BadRequestError} Nếu tên cửa hàng đã tồn tại hoặc thiếu tên khi tạo mới
   * @returns {Promise<IStore>} Thông tin cửa hàng đã cập nhật
   */
  async updateStoreInfo(data: Partial<StoreInput>, file?: Express.Multer.File): Promise<IStore> {
    const store = await storeModel.findOne({});

    // Kiểm tra tên khi tạo mới hoặc cập nhật
    if (!store && !data.ten) {
      throw new BadRequestError('Vui lòng cung cấp tên cửa hàng để tạo mới');
    }
    if (data.ten && store && data.ten !== store.ten) {
      const existingStore = await storeModel.findOne({ ten: data.ten });
      if (existingStore) {
        throw new BadRequestError('Tên cửa hàng đã tồn tại');
      }
    }

    let logoUrl = store?.logo || '';
    if (file) {
      try {
        // Xóa logo cũ trên Cloudinary nếu tồn tại
        if (store?.logo) {
          const publicId = store.logo.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`store_logos/${publicId}`);
          }
        }

        // Upload logo mới lên Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'store_logos',
          resource_type: 'image',
          transformation: [{ width: 300, height: 300, crop: 'fit', quality: 'auto' }],
        });
        logoUrl = result.secure_url;

        // Xóa file tạm sau khi upload
        await fs.unlink(file.path);
      } catch (error) {
        throw new BadRequestError('Không thể upload logo lên Cloudinary');
      }
    }

    // Cập nhật hoặc tạo mới thông tin cửa hàng
    const updatedStore = await storeModel.findOneAndUpdate(
      {},
      { ...data, logo: logoUrl, ngayCapNhat: new Date() },
      { new: true, upsert: true }
    );

    return updatedStore;
  }
}

export default new StoreService();
