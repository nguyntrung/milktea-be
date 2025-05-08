import mongoose, { Schema, Document } from 'mongoose';

export interface IstatisticIngredient extends Document {
  _id: string;
  ngay: Date;
  maNguyenLieu: string;
  soLuongBanDau: number;
  soLuongBan: number;
  soLuongNhap: number;
  soLuongHaoHut: number;
  soLuongTon: number;
  ngayTao: Date;
  ngayCapNhat: Date;
}