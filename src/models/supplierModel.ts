import mongoose, { Schema, Document } from 'mongoose';

// Define types
export interface ISupplier extends Document {
  _id: string;
  ten: string;
  diaChi: string;
  soDienThoai: string;
  ngayTao: Date;
  ngayCapNhat: Date;
}

export interface SupplierInput {
  ten: string;
  diaChi: string;
  soDienThoai: string;
}

// Define schema
const supplierSchema = new Schema<ISupplier>({
  ten: { 
    type: String, 
    required: [true, 'Tên nhà cung cấp là bắt buộc'],
    trim: true
  },
  diaChi: { 
    type: String, 
    required: [true, 'Địa chỉ nhà cung cấp là bắt buộc'],
    trim: true
  },
  soDienThoai: { 
    type: String, 
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^(0|\+84)(\d{9,10})$/.test(v);
      },
      message: props => `${props.value} không phải là số điện thoại hợp lệ! Định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx`
    }
  },
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now },
});

// Tự động cập nhật ngayCapNhat khi document được cập nhật
supplierSchema.pre('findOneAndUpdate', function() {
  this.set({ ngayCapNhat: new Date() });
});

supplierSchema.index({ ten: 1 });
supplierSchema.index({ soDienThoai: 1 });

export default mongoose.model<ISupplier>('NhaCungCap', supplierSchema);
