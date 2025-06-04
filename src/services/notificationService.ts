import notificationModel, { NotificationInput, INotification } from '../models/notificationModel';
import userModel from '../models/userModel';
import { TrangThaiPhanHoi } from '../types/common';
import { BadRequestError } from '../utils/errors';

class NotificationService {
  // Tạo thông báo mới
  async create(data: NotificationInput): Promise<INotification> {
    const notification = await notificationModel.create({
      ...data,
      trangThai: data.trangThai || 'chuaDoc',
      daDoc: false,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    return notification;
  }

  // Gửi thông báo cho tất cả người dùng
    async createForAllUsers(data: Omit<NotificationInput, 'maNguoiNhan'>): Promise<void> {
      const allUsers = await userModel.find({}, '_id');
      const notifications = allUsers.map(user => ({
        ...data,
        maNguoiNhan: user._id,
        daDoc: false,
        trangThai: data.trangThai || TrangThaiPhanHoi.CHUA_DOC,
        ngayTao: new Date(),
        ngayCapNhat: new Date(),
      }));

      await notificationModel.insertMany(notifications);
    }

  // Lấy tất cả thông báo
  async getAll(): Promise<INotification[]> {
    return await notificationModel
      .find()
      .sort({ ngayTao: -1 })
      .populate('maNguoiNhan', 'ten'); // nếu bạn có ref tới người dùng
  }

  // Lấy tất cả thông báo của người dùng
  async getAllByUser(userId: string): Promise<INotification[]> {
    return await notificationModel
      .find({ maNguoiNhan: userId })
      .sort({ ngayTao: -1 });
  }

  // Lấy thông báo theo ID
  async getById(id: string): Promise<INotification> {
    const notification = await notificationModel.findById(id);
    if (!notification) {
      throw new BadRequestError('Không tìm thấy thông báo');
    }
    return notification;
  }

  // Đánh dấu 1 thông báo là đã đọc
  async markAsRead(id: string): Promise<INotification> {
    const notification = await notificationModel.findById(id);
    if (!notification) {
      throw new BadRequestError('Không tìm thấy thông báo');
    }

    notification.daDoc = true;
    notification.trangThai = TrangThaiPhanHoi.DA_DOC
    notification.ngayCapNhat = new Date();
    await notification.save();

    return notification;
  }

  // Đánh dấu tất cả thông báo là đã đọc cho người dùng
  async markAllAsRead(userId: string) {
    await notificationModel.updateMany(
      { maNguoiNhan: userId, daDoc: false },
      {
        $set: {
          daDoc: true,
          trangThai: 'daDoc',
          ngayCapNhat: new Date(),
        },
      }
    );
    return { message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }

  // Xóa thông báo (cứng)
  async delete(id: string) {
    const notification = await notificationModel.findById(id);
    if (!notification) {
      throw new BadRequestError('Thông báo không tồn tại');
    }

    await notificationModel.findByIdAndDelete(id);
    return { message: 'Xóa thông báo thành công' };
  }
}

export default new NotificationService();
