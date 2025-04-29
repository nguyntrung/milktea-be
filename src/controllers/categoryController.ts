import { Request, Response } from 'express';
import categoryService from '../services/categoryService';
import { CategoryInput } from '../models/categoryModel';

class CategoryController {
  async create(req: Request, res: Response) {
    try {
      const data: CategoryInput = req.body;
      const category = await categoryService.create(data);
      res.status(201).json({
        success: true,
        data: category,
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
      const categories = await categoryService.getAll();
      res.status(200).json({
        success: true,
        data: categories,
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
      const category = await categoryService.getById(id);
      res.status(200).json({
        success: true,
        data: category,
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
      const data: Partial<CategoryInput> = req.body;
      const category = await categoryService.update(id, data);
      res.status(200).json({
        success: true,
        data: category,
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
      const result = await categoryService.delete(id);
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

export default new CategoryController();
