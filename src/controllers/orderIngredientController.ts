import { Request, Response } from 'express';
import orderIngredientService from '../services/orderIngredientService';
import { OrderIngredientInput } from '../models/orderIngredientModel'; 

class OrderIngredientController {
  async create(req: Request, res: Response) {
    try {
      const data: OrderIngredientInput = req.body;
      const order = await orderIngredientService.create(data);
      res.status(201).json({
        success: true,
        data: order,
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
      const orders = await orderIngredientService.getAll();
      res.status(200).json({
        success: true,
        data: orders,
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
      const order = await orderIngredientService.getById(id);
      res.status(200).json({
        success: true,
        data: order,
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
      const order = await orderIngredientService.update(id, data);
      res.status(200).json({
        success: true,
        data: order,
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
      const result = await orderIngredientService.delete(id);
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

export default new OrderIngredientController();
