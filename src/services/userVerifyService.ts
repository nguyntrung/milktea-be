import nodemailer from 'nodemailer';
import userVerifyModel, {IUserVerify} from '../models/userVerifyModel';
import userModel from '../models/userModel';
import { randomInt } from 'crypto';
import { BadRequestError } from '../utils/errors';

class UserVerifyService {
  // Gửi OTP mới tới email
  async createOrUpdate(email: string): Promise<IUserVerify> {
    const otp = randomInt(100000, 999999).toString(); // Tạo OTP 6 chữ số

    // Nếu đã có bản ghi cũ -> cập nhật
    const existing = await userVerifyModel.findOne({ email });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 5 phút

    const users = await userModel.findOne({ email });
    if (!users) {
        throw new BadRequestError('Không tìm thấy người dùng với email này');
    }


    if (existing) {
      existing.OTP = otp;
      existing.thoiGianXacNhan = expiresAt;
      existing.daXacNhan = false;
      existing.soLanThu = 0;
      existing.ngayCapNhat = new Date();
      await existing.save();
      return existing;
    }

    // Chưa có -> tạo mới
    const record = new userVerifyModel({
      email,
      maNguoiDung: users._id,
      OTP: otp,
      expiresAt,
      daXacNhan: false,
      soLanThu: 0
    });

    await record.save();
    return record;
  }

  // Xác minh OTP
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const record = await userVerifyModel.findOne({ email });

    if (!record) return false;
    if (record.daXacNhan) return false;
    if (record.thoiGianXacNhan < new Date()) return false;
    if (record.soLanThu >= 5) return false;

    if (record.OTP !== otp) {
      record.soLanThu += 1;
      await record.save();
      return false;
    }

    record.daXacNhan = true;
    await record.save();
    return true;
  }

  // Xóa OTP cũ sau khi reset mật khẩu thành công
  async deleteByEmail(email: string): Promise<void> {
    await userVerifyModel.deleteMany({ email });
  }

  // (tùy chọn) Lấy bản ghi OTP
  async getByEmail(email: string): Promise<IUserVerify | null> {
    return await userVerifyModel.findOne({ email });
  }
}

export default new UserVerifyService();