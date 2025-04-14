import { Request, Response } from 'express';
import { NguoiDung } from '../models/user';

// Lấy danh sách tất cả người dùng (chỉ admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user.vai_tro !== 'admin') {
      res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
      return;
    }

    const users = await NguoiDung.find().select('-mat_khau');
    res.status(200).json({ message: 'Lấy danh sách người dùng thành công', users });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: (error as Error).message });
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Không tìm thấy thông tin người dùng' });
      return;
    }

    const user = await NguoiDung.findById(userId).select('-mat_khau');
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    res.status(200).json({ message: 'Lấy thông tin người dùng thành công', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: (error as Error).message });
  }
};

// Lấy thông tin người dùng theo ID (chỉ admin hoặc chính người dùng đó)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const vaiTro = (req as any).user?.vai_tro;
    const requestedUserId = req.params.id;

    if (!requestedUserId) {
      res.status(400).json({ message: 'Thiếu ID người dùng' });
      return;
    }

    // Chỉ cho phép admin hoặc chính người dùng đó truy cập
    if (vaiTro !== 'admin' && userId !== requestedUserId) {
      res.status(403).json({ message: 'Bạn không có quyền truy cập thông tin người dùng này' });
      return;
    }

    const user = await NguoiDung.findById(requestedUserId).select('-mat_khau');
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    res.status(200).json({ message: 'Lấy thông tin người dùng thành công', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: (error as Error).message });
  }
};

// Cập nhật thông tin người dùng (chỉ admin hoặc chính người dùng đó)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const vaiTro = (req as any).user?.vai_tro;
    const requestedUserId = req.params.id;
    const { ho_ten, gioi_tinh, so_dien_thoai, dia_chi } = req.body;

    if (!requestedUserId) {
      res.status(400).json({ message: 'Thiếu ID người dùng' });
      return;
    }

    // Chỉ cho phép admin hoặc chính người dùng đó cập nhật
    if (vaiTro !== 'admin' && userId !== requestedUserId) {
      res.status(403).json({ message: 'Bạn không có quyền cập nhật thông tin người dùng này' });
      return;
    }

    const user = await NguoiDung.findById(requestedUserId);
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    // Kiểm tra và cập nhật các trường
    if (ho_ten) {
      if (typeof ho_ten !== 'string' || ho_ten.trim().length === 0) {
        res.status(400).json({ message: 'Họ tên không hợp lệ' });
        return;
      }
      user.ho_ten = ho_ten;
    }
    if (gioi_tinh) {
      if (!['Nam', 'Nữ', 'Khác'].includes(gioi_tinh)) {
        res.status(400).json({ message: 'Giới tính không hợp lệ (phải là Nam, Nữ, hoặc Khác)' });
        return;
      }
      user.gioi_tinh = gioi_tinh;
    }
    if (so_dien_thoai) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(so_dien_thoai)) {
        res.status(400).json({ message: 'Số điện thoại không hợp lệ (phải có 10-11 chữ số)' });
        return;
      }
      user.so_dien_thoai = so_dien_thoai;
    }
    if (dia_chi !== undefined) {
      if (typeof dia_chi !== 'string') {
        res.status(400).json({ message: 'Địa chỉ không hợp lệ' });
        return;
      }
      user.dia_chi = dia_chi;
    }

    await user.save();

    res.status(200).json({ message: 'Cập nhật thông tin người dùng thành công', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: (error as Error).message });
  }
};

// Xóa người dùng (chỉ admin hoặc chính người dùng đó)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const vaiTro = (req as any).user?.vai_tro;
    const requestedUserId = req.params.id;

    if (!requestedUserId) {
      res.status(400).json({ message: 'Thiếu ID người dùng' });
      return;
    }

    // Chỉ cho phép admin hoặc chính người dùng đó xóa
    if (vaiTro !== 'admin' && userId !== requestedUserId) {
      res.status(403).json({ message: 'Bạn không có quyền xóa người dùng này' });
      return;
    }

    const user = await NguoiDung.findByIdAndDelete(requestedUserId);
    if (!user) {
      res.status(404).json({ message: 'Người dùng không tồn tại' });
      return;
    }

    res.status(200).json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: (error as Error).message });
  }
};
