import cartModel, { CartInput, ICart, ICartItem, ITuyChon } from '../models/cartModel';
import productModel from '../models/productModel';
import toppingModel from '../models/toppingModel';
import userModel from '../models/userModel';
import { BadRequestError } from '../utils/errors';

class CartService {
  async getOrCreateCart(maKhachHang: string): Promise<ICart> {
    // Validate maKhachHang
    const user = await userModel.findOne({ _id: maKhachHang, hoatDong: true });
    if (!user) {
      throw new BadRequestError('Khách hàng không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // Check if cart already exists for this user
    let cart = await cartModel.findOne({ maKhachHang, hoatDong: true });
    
    // If no cart exists, create a new empty one
    if (!cart) {
      cart = await cartModel.create({
        maKhachHang,
        sanPhams: [],
        hoatDong: true,
      });
    }
    
    return cart;
  }

  async validateCartItem(item: ICartItem): Promise<void> {
    // Validate maSanPham
    const product = await productModel.findOne({ _id: item.maSanPham, hoatDong: true });
    if (!product) {
      throw new BadRequestError(`Sản phẩm ${item.maSanPham} không tồn tại hoặc đã bị vô hiệu hóa`);
    }

    // Validate kichThuoc
    const validSizes = product.luaChonSize.map(size => size.tenSize);
    if (!validSizes.includes(item.kichThuoc)) {
      throw new BadRequestError(`Kích thước ${item.kichThuoc} không hợp lệ cho sản phẩm ${item.maSanPham}`);
    }

    // Validate tuychon
    const validOptions = product.tuychon;
    if (item.tuychon && item.tuychon.length > 0) {
      const tuychonMap = new Map<string, string>();
      item.tuychon.forEach((t: ITuyChon) => tuychonMap.set(t.loai, t.muc));

      const invalidOptions = Array.from(tuychonMap.keys()).filter(opt => !validOptions.includes(opt));
      if (invalidOptions.length > 0) {
        throw new BadRequestError(`Tùy chọn không hợp lệ: ${invalidOptions.join(', ')}`);
      }

      const loaiSet = new Set(item.tuychon.map(t => t.loai));
      if (loaiSet.size !== item.tuychon.length) {
        throw new BadRequestError('Không được phép có tùy chọn trùng lặp trong cùng một sản phẩm');
      }

      item.tuychon.forEach((t: ITuyChon) => {
        if (!t.muc || t.muc.trim() === '') {
          throw new BadRequestError(`Mức độ của tùy chọn ${t.loai} không được để trống`);
        }
      });
    }

    // Validate toppings
    if (item.toppings && item.toppings.length > 0) {
      const validToppings = product.toppingCoTheThem || [];
      const invalidToppings = item.toppings.filter(top => !validToppings.includes(top));
      if (invalidToppings.length > 0) {
        throw new BadRequestError(`Topping không hợp lệ: ${invalidToppings.join(', ')}`);
      }

      const toppings = await toppingModel.find({ _id: { $in: item.toppings }, hoatDong: true });
      if (toppings.length !== item.toppings.length) {
        throw new BadRequestError('Một hoặc nhiều topping không tồn tại hoặc đã bị vô hiệu hóa');
      }
    }

    // Validate soLuong
    if (item.soLuong < 1) {
      throw new BadRequestError('Số lượng sản phẩm phải lớn hơn 0');
    }
  }

  // Kiểm tra xem hai sản phẩm có giống nhau về maSanPham, kichThuoc, tuychon, toppings không
  isEqualCartItem(item1: ICartItem, item2: ICartItem): boolean {
    if (item1.maSanPham.toString() !== item2.maSanPham.toString()) return false;
    if (item1.kichThuoc !== item2.kichThuoc) return false;
    
    // So sánh toppings (nếu có)
    const toppings1 = new Set((item1.toppings || []).map(t => t.toString()).sort());
    const toppings2 = new Set((item2.toppings || []).map(t => t.toString()).sort());
    if (toppings1.size !== toppings2.size) return false;
    if ([...toppings1].join(',') !== [...toppings2].join(',')) return false;
    
    // So sánh tuychon (nếu có)
    const tuychon1 = new Map();
    const tuychon2 = new Map();
    (item1.tuychon || []).forEach(t => tuychon1.set(t.loai, t.muc));
    (item2.tuychon || []).forEach(t => tuychon2.set(t.loai, t.muc));
    
    if (tuychon1.size !== tuychon2.size) return false;
    for (const [key, value] of tuychon1.entries()) {
      if (tuychon2.get(key) !== value) return false;
    }
    
    return true;
  }

  async addToCart(maKhachHang: string, newItem: ICartItem) {
    // Validate user and get or create their cart
    const cart = await this.getOrCreateCart(maKhachHang);
    
    // Validate the new item
    await this.validateCartItem(newItem);
    
    // Check if the item already exists in the cart (same product, size, options, toppings)
    let itemExists = false;
    const updatedSanPhams = cart.sanPhams.map(item => {
      if (this.isEqualCartItem(item, newItem)) {
        itemExists = true;
        return {
          ...(typeof (item as any).toObject === 'function' ? (item as any).toObject() : item),
          soLuong: item.soLuong + newItem.soLuong,
          ghiChu: newItem.ghiChu || item.ghiChu // Update note if provided
        };
      }
      return item;
    });
    
    // If item doesn't exist in cart, add it
    if (!itemExists) {
      updatedSanPhams.push(newItem);
    }
    
    // Update cart
    const updatedCart = await cartModel.findOneAndUpdate(
      { _id: cart._id },
      { 
        sanPhams: updatedSanPhams,
        ngayCapNhat: new Date()
      },
      { new: true }
    )
    .populate('sanPhams.maSanPham', 'ten giaCoBan luaChonSize tuychon toppingCoTheThem')
    .populate('sanPhams.toppings', 'ten gia soLuongMotPhan');
    
    if (!updatedCart) {
      throw new BadRequestError('Không tìm thấy giỏ hàng sau khi cập nhật');
    }

    const totalPrice = await this.calculateTotalPrice(updatedCart);
    
    return { cart: updatedCart, totalPrice };
  }

  async updateCartItem(maKhachHang: string, itemIndex: number, updatedItem: Partial<ICartItem>) {
    // Get user's cart
    const cart = await this.getOrCreateCart(maKhachHang);
    
    // Check if item exists at the specified index
    if (itemIndex < 0 || itemIndex >= cart.sanPhams.length) {
      throw new BadRequestError('Sản phẩm không tồn tại trong giỏ hàng');
    }
    
    // Create a new item by merging the existing item with updates
    const currentItem = cart.sanPhams[itemIndex];
    const newItem: ICartItem = {
      maSanPham: updatedItem.maSanPham || currentItem.maSanPham,
      kichThuoc: updatedItem.kichThuoc || currentItem.kichThuoc,
      tuychon: updatedItem.tuychon || currentItem.tuychon,
      toppings: updatedItem.toppings || currentItem.toppings,
      soLuong: updatedItem.soLuong || currentItem.soLuong,
      ghiChu: updatedItem.ghiChu !== undefined ? updatedItem.ghiChu : currentItem.ghiChu
    };
    
    // Validate the updated item
    await this.validateCartItem(newItem);
    
    // Update the item in the cart
    const updatedSanPhams = [...cart.sanPhams];
    updatedSanPhams[itemIndex] = newItem;
    
    // Update cart
    const updatedCart = await cartModel.findOneAndUpdate(
      { _id: cart._id },
      { 
        sanPhams: updatedSanPhams,
        ngayCapNhat: new Date()
      },
      { new: true }
    )
    .populate('sanPhams.maSanPham', 'ten giaCoBan luaChonSize tuychon toppingCoTheThem')
    .populate('sanPhams.toppings', 'ten gia soLuongMotPhan');
    
    if (!updatedCart) {
      throw new BadRequestError('Không tìm thấy giỏ hàng sau khi cập nhật');
    }

    const totalPrice = await this.calculateTotalPrice(updatedCart);
    
    return { cart: updatedCart, totalPrice };
  }

  async removeFromCart(maKhachHang: string, itemIndex: number) {
    // Get user's cart
    const cart = await this.getOrCreateCart(maKhachHang);
    
    // Check if item exists at the specified index
    if (itemIndex < 0 || itemIndex >= cart.sanPhams.length) {
      throw new BadRequestError('Sản phẩm không tồn tại trong giỏ hàng');
    }
    
    // Remove the item from the cart
    const updatedSanPhams = [...cart.sanPhams];
    updatedSanPhams.splice(itemIndex, 1);
    
    // Update cart
    const updatedCart = await cartModel.findOneAndUpdate(
      { _id: cart._id },
      { 
        sanPhams: updatedSanPhams,
        ngayCapNhat: new Date()
      },
      { new: true }
    )
    .populate('sanPhams.maSanPham', 'ten giaCoBan luaChonSize tuychon toppingCoTheThem')
    .populate('sanPhams.toppings', 'ten gia soLuongMotPhan');
    
    if (!updatedCart) {
      throw new BadRequestError('Không tìm thấy giỏ hàng sau khi cập nhật');
    }

    const totalPrice = await this.calculateTotalPrice(updatedCart);
    
    return { cart: updatedCart, totalPrice };
  }

  async getCart(maKhachHang: string) {
    // Get or create user's cart
    const cart = await this.getOrCreateCart(maKhachHang);
    
    // Populate the cart data
    const populatedCart = await cartModel
      .findById(cart._id)
      .populate('sanPhams.maSanPham', 'ten giaCoBan luaChonSize tuychon toppingCoTheThem hinhAnh')
      .populate('sanPhams.toppings', 'ten gia soLuongMotPhan');

    if (!populatedCart) {
      throw new BadRequestError('Không tìm thấy giỏ hàng');
    }

    const totalPrice = await this.calculateTotalPrice(populatedCart);
    
    return { cart: populatedCart, totalPrice };
  }

  async clearCart(maKhachHang: string) {
    // Get user's cart
    const cart = await this.getOrCreateCart(maKhachHang);
    
    // Clear all items from the cart
    const updatedCart = await cartModel.findOneAndUpdate(
      { _id: cart._id },
      { 
        sanPhams: [],
        ngayCapNhat: new Date()
      },
      { new: true }
    );
    
    return { cart: updatedCart, totalPrice: 0, message: 'Đã xóa tất cả sản phẩm trong giỏ hàng' };
  }

  async calculateTotalPrice(cart: ICart): Promise<number> {
    let totalPrice = 0;
    
    if (!cart || !cart.sanPhams || cart.sanPhams.length === 0) {
      return totalPrice;
    }
    
    for (const item of cart.sanPhams) {
      const product = item.maSanPham as any;
      if (!product) continue;
      
      const sizeOption = product.luaChonSize.find((s: any) => s.tenSize === item.kichThuoc);
      const sizePrice = sizeOption ? sizeOption.giaTang || 0 : 0;
      const basePrice = product.giaCoBan || 0;
      
      // Calculate toppings price
      const toppingsPrice = (item.toppings as any[])
        .reduce((sum, topping) => sum + (topping?.gia || 0), 0);
      
      // Calculate total for this item
      const itemPrice = (basePrice + sizePrice + toppingsPrice) * item.soLuong;
      totalPrice += itemPrice;
    }
    
    return totalPrice;
  }
}

export default new CartService();
