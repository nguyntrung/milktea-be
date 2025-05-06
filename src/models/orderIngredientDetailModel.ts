import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderIngredientDetail extends Document {
  _id: string;
  maDonDat: string;
  maNguyenLieu: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  ngayTao: Date;
  ngayCapNhat: Date;
}