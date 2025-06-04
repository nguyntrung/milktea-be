import bannerModel, { IBanner, BannerInput } from '../models/bannerModel';
import { BadRequestError } from '../utils/errors';
import cloudinary from '../config/cloudinary';
import fs from 'fs/promises';

class BannerService {
  /**
   * Lấy danh sách tất cả banner
   * @returns {Promise<IBanner[]>} Danh sách banner
   */
  async getAll(): Promise<IBanner[]> {
    return await bannerModel.find().sort({ thuTu: 1 });
  }

  /**
   * Lấy danh sách banner theo vị trí và trạng thái hiển thị
   * @param viTri Vị trí banner (ví dụ: home_top)
   * @param hienThi Trạng thái hiển thị
   * @returns {Promise<IBanner[]>} Danh sách banner phù hợp
   */
  async getByPositionAndStatus(viTri: string, hienThi: boolean): Promise<IBanner[]> {
    const query: any = { hienThi };
    if (viTri) {
      query.thuTu = { $gte: parseInt(viTri.split('_').pop() || '0') };
    }
    return await bannerModel.find(query).sort({ thuTu: 1 });
  }

  /**
   * Lấy banner theo ID
   * @param id ID của banner
   * @throws {BadRequestError} Nếu banner không tồn tại
   * @returns {Promise<IBanner>} Banner
   */
  async getById(id: string): Promise<IBanner> {
    const banner = await bannerModel.findById(id);
    if (!banner) {
      throw new BadRequestError('Banner không tồn tại');
    }
    return banner;
  }

  /**
   * Tạo banner mới
   * @param data Dữ liệu banner
   * @param file File hình ảnh (nếu có)
   * @throws {BadRequestError} Nếu thứ tự đã tồn tại hoặc upload thất bại
   * @returns {Promise<IBanner>} Banner mới
   */
  async create(data: BannerInput, file?: Express.Multer.File): Promise<IBanner> {
    const { lienKet, hienThi } = data;

    // Tự động lấy max thuTu và tăng 1
    const maxThuTu = await bannerModel.findOne().sort({ thuTu: -1 }).select('thuTu') || { thuTu: 0 };
    const thuTu = maxThuTu.thuTu + 1;

    let hinhAnh = '';
    if (file) {
        try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'banners',
            resource_type: 'image',
            transformation: [{ width: 1200, height: 400, crop: 'fit', quality: 'auto' }],
        });
        hinhAnh = result.secure_url;
        await fs.unlink(file.path);
        } catch (error) {
        throw new BadRequestError('Không thể upload hình ảnh lên Cloudinary');
        }
    }

    const banner = await bannerModel.create({
        hinhAnh,
        lienKet,
        thuTu,
        hienThi,
        ngayTao: new Date(),
        ngayCapNhat: new Date(),
    });

    return banner;
  }

  /**
   * Cập nhật banner
   * @param id ID của banner
   * @param data Dữ liệu cập nhật
   * @param file File hình ảnh mới (nếu có)
   * @throws {BadRequestError} Nếu banner không tồn tại hoặc thứ tự đã tồn tại
   * @returns {Promise<IBanner>} Banner đã cập nhật
   */
  async update(id: string, data: Partial<BannerInput>, file?: Express.Multer.File): Promise<IBanner> {
    const banner = await bannerModel.findById(id);
    if (!banner) {
      throw new BadRequestError('Banner không tồn tại');
    }

    let newThuTu = data.thuTu !== undefined ? data.thuTu : banner.thuTu;
    // Nếu thay đổi thuTu, kiểm tra và tự động tăng nếu trùng
    if (data.thuTu && data.thuTu !== banner.thuTu) {
      let existingBanner = await bannerModel.findOne({ thuTu: newThuTu });
      while (existingBanner && existingBanner._id.toString() !== id) {
        newThuTu++;
        existingBanner = await bannerModel.findOne({ thuTu: newThuTu });
      }
    }

    let hinhAnh = banner.hinhAnh;
    if (file) {
      try {
        if (banner.hinhAnh) {
          const publicId = banner.hinhAnh.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`banners/${publicId}`);
          }
        }
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'banners',
          resource_type: 'image',
          transformation: [{ width: 1200, height: 400, crop: 'fit', quality: 'auto' }],
        });
        hinhAnh = result.secure_url;
        await fs.unlink(file.path);
      } catch (error) {
        throw new BadRequestError('Không thể upload hình ảnh lên Cloudinary');
      }
    }

    const updatedBanner = await bannerModel.findByIdAndUpdate(
      id,
      { thuTu: newThuTu, lienKet: data.lienKet, hienThi: data.hienThi, hinhAnh, ngayCapNhat: new Date() },
      { new: true }
    );

    return updatedBanner!;
  }

  /**
   * Xóa banner
   * @param id ID của banner
   * @throws {BadRequestError} Nếu banner không tồn tại
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    const banner = await bannerModel.findById(id);
    if (!banner) {
      throw new BadRequestError('Banner không tồn tại');
    }

    // Xóa ảnh trên Cloudinary nếu tồn tại
    if (banner.hinhAnh) {
      const publicId = banner.hinhAnh.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`banners/${publicId}`);
      }
    }

    await bannerModel.findByIdAndDelete(id);
  }
}

export default new BannerService();
