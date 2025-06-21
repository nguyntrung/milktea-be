import { Request, Response } from 'express';
import userVerifyService from '../services/userVerifyService';
import { BadRequestError } from '../utils/errors';
import { sendOtpEmail } from '../utils/emailHelper';

class UserVerifyController {
  // 1. Yêu cầu gửi OTP tới email người dùng
  async requestOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) throw new BadRequestError('Email không được bỏ trống');

      const record = await userVerifyService.createOrUpdate(email);
      await sendOtpEmail(email, record.OTP); // Gửi OTP qua Mailtrap (hoặc SMTP thật)

      res.status(200).json({
        success: true,
        message: 'OTP đã được gửi tới email',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 2. Xác thực OTP
  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) throw new BadRequestError('Email và OTP là bắt buộc');

      const isValid = await userVerifyService.verifyOTP(email, otp);

      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'OTP không đúng hoặc đã hết hạn',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Xác thực OTP thành công',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 3. Xóa bản ghi OTP sau khi reset mật khẩu thành công
  async deleteOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) throw new BadRequestError('Thiếu email');

      await userVerifyService.deleteByEmail(email);

      res.status(200).json({
        success: true,
        message: 'Xóa OTP thành công',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // 4. Lấy OTP (phục vụ debug nếu cần)
  async getByEmail(req: Request, res: Response) {
    try {
      const email = req.params.email;
      const record = await userVerifyService.getByEmail(email);

      if (!record) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy bản ghi OTP',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new UserVerifyController();
