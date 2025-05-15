import { Request, Response } from 'express';
import orderIngredientDetailService from '../services/orderIngredientDetailService';
import { OrderIngredientDetailInput } from '../models/orderIngredientDetailModel'; 

class OrderIngredientDetailController {
  async create(req: Request, res: Response) {
    try {
      const data: OrderIngredientDetailInput = req.body;
      const orderIngredientDetail = await orderIngredientDetailService.create(data);
      res.status(201).json({
        success: true,
        data: orderIngredientDetail,
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
      const orderIngredientDetails = await orderIngredientDetailService.getAll();
      res.status(200).json({
        success: true,
        data: orderIngredientDetails,
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
      const orderIngredientDetail = await orderIngredientDetailService.getById(id);
      res.status(200).json({
        success: true,
        data: orderIngredientDetail,
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
      const data = req.body;
      const updatedOrderIngredientDetail = await orderIngredientDetailService.update(id, data);
      res.status(200).json({
        success: true,
        data: updatedOrderIngredientDetail,
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
      const result = await orderIngredientDetailService.delete(id);
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

export default new OrderIngredientDetailController();
