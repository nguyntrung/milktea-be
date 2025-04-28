import { Request, Response } from 'express';
import productService from '../services/productService';
import { ProductInput } from '../models/productModel';

class ProductController {
  async create(req: Request, res: Response) {
    try {
      const data: ProductInput = req.body;
      const product = await productService.create(data);
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAll();
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const product = await productService.getById(id);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const data: Partial<ProductInput> = req.body;
      const product = await productService.update(id, data);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await productService.delete(id);
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
}

export default new ProductController();
