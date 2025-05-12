import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import cartService from '../services/cartService';
import { ICartItem } from '../models/cartModel';

class CartController {
  async getCart(req: AuthRequest, res: Response) {
    try {
      const maKhachHang = req.user.id;
      const result = await cartService.getCart(maKhachHang);
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async addToCart(req: AuthRequest, res: Response) {
    try {
      const maKhachHang = req.user.id;
      const cartItem: ICartItem = req.body;
      
      const result = await cartService.addToCart(maKhachHang, cartItem);
      
      res.status(200).json({
        success: true,
        message: 'Đã thêm sản phẩm vào giỏ hàng',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateCartItem(req: AuthRequest, res: Response) {
    try {
      const maKhachHang = req.user.id;
      const { itemIndex } = req.params;
      const updatedItem: Partial<ICartItem> = req.body;
      
      const result = await cartService.updateCartItem(
        maKhachHang, 
        parseInt(itemIndex), 
        updatedItem
      );
      
      res.status(200).json({
        success: true,
        message: 'Đã cập nhật sản phẩm trong giỏ hàng',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async removeFromCart(req: AuthRequest, res: Response) {
    try {
      const maKhachHang = req.user.id;
      const { itemIndex } = req.params;
      
      const result = await cartService.removeFromCart(
        maKhachHang, 
        parseInt(itemIndex)
      );
      
      res.status(200).json({
        success: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async clearCart(req: AuthRequest, res: Response) {
    try {
      const maKhachHang = req.user.id;
      
      const result = await cartService.clearCart(maKhachHang);
      
      res.status(200).json({
        success: true,
        message: 'Đã xóa toàn bộ giỏ hàng',
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new CartController();
