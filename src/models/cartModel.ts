import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface ITuyChon {
  loai: string;
  muc: string;
}

export interface ICartItem {
  maSanPham: string;
  kichThuoc: string;
  tuychon: ITuyChon[];
  toppings: string[];
  soLuong: number;
  ghiChu?: string;
}

export interface ICart extends Document {
  _id: string;
  maKhachHang: string;
  sanPhams: ICartItem[];
  hoatDong: boolean;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface CartInput {
  maKhachHang: string;
  sanPhams: ICartItem[];
}

// Define schema
const tuyChonSchema = new Schema<ITuyChon>({
  loai: { type: String, required: true },
  muc: { type: String, required: true },
});

const cartItemSchema = new Schema<ICartItem>({
  maSanPham: { type: String, ref: 'SanPham', required: true },
  kichThuoc: { type: String, required: true },
  tuychon: [tuyChonSchema],
  toppings: [{ type: String, ref: 'Topping' }],
  soLuong: { type: Number, required: true, min: 1 },
  ghiChu: { type: String, default: '' },
});

const cartSchema = new Schema<ICart>({
  maKhachHang: { 
    type: String, 
    ref: 'KhachHang', 
    required: true,
    index: true 
  },
  sanPhams: [cartItemSchema],
  hoatDong: { type: Boolean, default: true },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

cartSchema.index({ maKhachHang: 1, hoatDong: 1 }, { unique: true });

export default mongoose.model<ICart>('GioHang', cartSchema);
