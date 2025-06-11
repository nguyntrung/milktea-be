import { Request, Response } from 'express';
import toppingService from '../services/toppingService';
import { ToppingInput } from '../models/toppingModel';

class ToppingController {
  async create(req: Request, res: Response) {
    try {
      const data: ToppingInput = req.body;
      const topping = await toppingService.create(data);
      res.status(201).json({
        success: true,
        data: topping,
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
      const toppings = await toppingService.getAll();
      res.status(200).json({
        success: true,
        data: toppings,
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
      const topping = await toppingService.getById(id);
      res.status(200).json({
        success: true,
        data: topping,
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
      const data: Partial<ToppingInput> = req.body;
      const topping = await toppingService.update(id, data);
      res.status(200).json({
        success: true,
        data: topping,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await toppingService.deactivate(id);
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

    async delete(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const result = await toppingService.delete(id);
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

export default new ToppingController();
