import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NguoiDung } from '../models/user';

dotenv.config();

// Đăng ký người dùng mới
export const register = async (req: Request, res: Response) => {
  try {
    const { ho_ten, gioi_tinh, email, mat_khau, so_dien_thoai, dia_chi } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!ho_ten || !gioi_tinh || !email || !mat_khau || !so_dien_thoai) {
      res.status(400).json({ message: 'Thiếu các trường bắt buộc: ho_ten, gioi_tinh, email, mat_khau, so_dien_thoai' });
      return;
    }

    // Kiểm tra định dạng email và số điện thoại
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' });
      return;
    }
    if (!phoneRegex.test(so_dien_thoai)) {
      res.status(400).json({ message: 'Số điện thoại không hợp lệ (phải có 10-11 chữ số)' });
      return;
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await NguoiDung.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email đã tồn tại' });
      return;
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(mat_khau, 10);

    // Tạo người dùng mới
    const newUser = new NguoiDung({
      ho_ten,
      gioi_tinh,
      email,
      mat_khau: hashedPassword,
      so_dien_thoai,
      dia_chi: dia_chi || '',
      vai_tro: 'khach_hang', // Vai trò mặc định
      xu_hien_tai: 0,
    });

    await newUser.save();

    // Tạo JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET không được cấu hình trong biến môi trường');
    }

    const token = jwt.sign(
      { userId: newUser._id, vai_tro: newUser.vai_tro },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Đăng ký thành công', token, user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: (error as Error).message });
  }
};

// Đăng nhập người dùng
export const login = async (req: Request, res: Response) => {
  try {
    const { email, mat_khau } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !mat_khau) {
      res.status(400).json({ message: 'Thiếu các trường bắt buộc: email, mat_khau' });
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' });
      return;
    }

    // Tìm người dùng theo email
    const user = await NguoiDung.findOne({ email }).select('+mat_khau');
    if (!user) {
      res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau || '');
    if (!isMatch) {
      res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    // Kiểm tra JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET không được cấu hình trong biến môi trường');
    }

    // Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, vai_tro: user.vai_tro },
      jwtSecret,
      { expiresIn: '1h' }
    );

    // Loại bỏ mật khẩu khỏi dữ liệu trả về
    const userResponse = user.toObject();
    delete userResponse.mat_khau;

    res.status(200).json({ message: 'Đăng nhập thành công', token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: (error as Error).message });
  }
};
