import mongoose, { Schema, Document } from 'mongoose';
import { DoiTuongKhuyenMai, LoaiKhuyenMai } from '../types/common';

export interface IPromotion extends Document {
  _id: string;
  maKhuyenMai: string;
  tenKhuyenMai: string;
  moTa: string;
  thoiGianApDung: {
    batDau: Date;
    ketThuc: Date;
  }
  loaiKhuyenMai: LoaiKhuyenMai;
  doiTuongKhuyenMai: DoiTuongKhuyenMai;
  sanPhamApDung: string[];
  hoaDonApDung: {
    giaTriToiThieu: number;
    giaTriToiDa: number;
  }
  giaTri: number;
  soLuong: {
    tongSoLuong: number;
    daSuDung: number;
    gioiHanMoiNguoiDung: number;
  }
  ngayTao: Date;
  ngayCapNhat: Date;
}