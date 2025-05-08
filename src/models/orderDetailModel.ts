import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderDetail extends Document {
  _id: string;
  maHoaDon: string;
  maSanPham: string;
  donGia: number;
  soLuong: number;
  kichCo: {
    tenSize: string;
    giaTang: number;
  };
  tuyChon: string[];
  topping: {
    maTopping: string;
    gia: number;
    soLuong: number;
  }[];
  thanhTien: number;
  ghiChu: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}