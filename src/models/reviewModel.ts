import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  maKhachHang: string;
  maSanPham: string;
  ngayDanhGia: Date;
  diemDanhGia: number;
  noiDung: string;
  hinhAnh: string[];
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}