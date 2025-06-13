import bcrypt from 'bcryptjs';
import authModel, { RegisterInput, LoginInput, IUser } from '../models/userModel';
import { generateToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { LoaiGiaoDich } from '../types/common';

class AuthService {
  async register(data: RegisterInput) {
    const { email, matKhau, ten, ngaySinh, gioiTinh, soDienThoai, vaiTro } = data;

    // Check if user exists
    const existingUser = await authModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // Create user
    const user = await authModel.create({
      email,
      matKhau: hashedPassword,
      ten,
      ngaySinh,
      gioiTinh,
      soDienThoai,
      diemTichLuy: 0,
      lichSuDiem: [],
      khuyenMaiDaSuDung: [],
      vaiTro: vaiTro || 'user',
      hoatDong: true,
    });

    // Generate token
    const token = generateToken(user._id);

    return { user, token };
  }

  async login(data: LoginInput) {
    const { email, matKhau } = data;

    // Find user
    const user = await authModel.findOne({ email, hoatDong: true });
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    // Verify password
    const isMatch = await bcrypt.compare(matKhau, user.matKhau);
    if (!isMatch) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    // Generate token
    const token = generateToken(user._id);

    return { user, token };
  }

  async getAll() {
    return await authModel
      .find({ hoatDong: true })
      .select('-matKhau')
      .sort({ ngayTao: -1 });
  }

  async getByAscendancyById(id: string) {
    const user = await authModel
      .findOne({ _id: id, hoatDong: true })
      .select('-matKhau');
    if (!user) {
      throw new BadRequestError('Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
    }
    return user;
  }

  async update(id: string, data: Partial<RegisterInput> & { diaChi?: string; diemTichLuy?: number; lichSuDiem?: any; khuyenMaiDaSuDung?: string[] }) {
    const user = await authModel.findOne({ _id: id, hoatDong: true });
    if (!user) {
      throw new BadRequestError('Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Check if new email is unique
    if (data.email && data.email !== user.email) {
      const existingUser = await authModel.findOne({ email: data.email });
      if (existingUser) {
        throw new BadRequestError('Email đã tồn tại');
      }
    }

    // Hash new password if provided
    if (data.matKhau) {
      data.matKhau = await bcrypt.hash(data.matKhau, 10);
    }

    // Prevent updating diemTichLuy, lichSuDiem, and khuyenMaiDaSuDung directly
    // if (data.diemTichLuy || data.lichSuDiem || data.khuyenMaiDaSuDung) {
    //   throw new BadRequestError('Không thể cập nhật điểm tích lũy, lịch sử điểm hoặc khuyến mãi đã sử dụng trực tiếp');
    // }

    const updatedUser = await authModel
      .findByIdAndUpdate(
        id,
        { ...data, ngayCapNhat: new Date() },
        { new: true }
      )
      .select('-matKhau');

    return updatedUser;
  }

  async deactivate(id: string) {
    const user = await authModel.findOne({ _id: id, hoatDong: true });
    if (!user) {
      throw new BadRequestError('Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const deactivatedUser = await authModel
      .findByIdAndUpdate(
        id,
        { hoatDong: false, ngayCapNhat: new Date() },
        { new: true }
      )
      .select('-matKhau');

    return { message: 'Vô hiệu hóa người dùng thành công', user: deactivatedUser };
  }

  async addPoints(id: string, diem: number, noiDung: string) {
    const user = await authModel.findOne({ _id: id, hoatDong: true });
    if (!user) {
      throw new BadRequestError('Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
    }

    const newDiemTichLuy = user.diemTichLuy + diem;
    if (newDiemTichLuy < 0) {
      throw new BadRequestError('Điểm tích lũy không thể âm');
    }

    const lichSuDiem = {
      thoiGian: new Date(),
      diem,
      noiDung,
      diemConLai: newDiemTichLuy,
      loaiGiaoDich: diem > 0 ? LoaiGiaoDich.CONG : LoaiGiaoDich.TRU,
    };

    const updatedUser = await authModel
      .findByIdAndUpdate(
        id,
        {
          $set: { diemTichLuy: newDiemTichLuy, ngayCapNhat: new Date() },
          $push: { lichSuDiem },
        },
        { new: true }
      )
      .select('-matKhau');

    return updatedUser;
  }

  async addUsedPromotion(id: string, maKhuyenMai: string) {
    const user = await authModel.findOne({ _id: id, hoatDong: true });
    if (!user) {
      throw new BadRequestError('Người dùng không tồn tại hoặc đã bị vô hiệu hóa');
    }

    if (user.khuyenMaiDaSuDung.includes(maKhuyenMai)) {
      throw new BadRequestError('Khuyến mãi đã được sử dụng');
    }

    const updatedUser = await authModel
      .findByIdAndUpdate(
        id,
        {
          $push: { khuyenMaiDaSuDung: maKhuyenMai },
          ngayCapNhat: new Date(),
        },
        { new: true }
      )
      .select('-matKhau');

    return updatedUser;
  }
}

export default new AuthService();
