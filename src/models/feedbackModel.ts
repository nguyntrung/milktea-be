import mongoose, { Schema, Document } from 'mongoose';
import { TrangThaiPhanHoi } from '../types/common';

export interface IFeedback extends Document {
  _id: string;
  maKhachHang: string;
  tieuDe: string;
  noiDung: string;
  ngayPhanHoi: Date;
  ngayXuLy: Date;
  nguoiXuLy: string;
  trangThai: TrangThaiPhanHoi;
  ngayTao: Date;
  ngayCapNhat: Date;
}