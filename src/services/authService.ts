import bcrypt from 'bcryptjs';
import userModel, { RegisterInput, LoginInput } from '../models/userModel';
import { generateToken } from '../utils/jwt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

class AuthService {
  async register(data: RegisterInput) {
    const { email, matKhau, ten, soDienThoai, diaChi } = data;

    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // Create user
    const user = await userModel.create({
      email,
      matKhau: hashedPassword,
      ten,
      soDienThoai,
      diaChi,
      vaiTro: 'user',
    });

    // Generate token
    const token = generateToken(user._id);

    return { user, token };
  }

  async login(data: LoginInput) {
    const { email, matKhau } = data;

    // Find user
    const user = await userModel.findOne({ email });
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
}

export default new AuthService();
