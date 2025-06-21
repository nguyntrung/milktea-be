import { Request, Response } from 'express';
import productService from '../services/productService';
import { ProductInput } from '../models/productModel';
import cloudinary from '../config/cloudinary';
import { BadRequestError } from '../utils/errors';

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
      const categoryId = req.query.category as string;
      const products = await productService.getAll(categoryId);

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

  async getPaginated(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const categoryId = req.query.category as string;

      if (isNaN(page) || page < 1) {
        throw new BadRequestError('Số trang không hợp lệ');
      }
      if (isNaN(limit) || limit < 1) {
        throw new BadRequestError('Giới hạn không hợp lệ');
      }

      const result = await productService.getPaginated(page, limit, categoryId);

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

  async getByCategoryId(req: Request, res: Response) {
    try {
      const { maDanhMuc } = req.params;
      const products = await productService.getByCategoryId(maDanhMuc);
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

  async uploadToCloudinary(req: Request, res: Response) {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        throw new Error('No files uploaded');
      }

      const uploadPromises = req.files.map(async (file: Express.Multer.File) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'products',
          resource_type: 'image',
        });
        return result.secure_url;
      });

      const imageUrls = await Promise.all(uploadPromises);
      res.status(200).json({
        success: true,
        data: imageUrls,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error uploading images to Cloudinary',
      });
    }
  }
}

export default new ProductController();
