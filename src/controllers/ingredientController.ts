import { Request, Response } from 'express';
import ingredientService from '../services/ingredientService';
import { IngredientInput } from '../models/ingredientModel';

class IngredientController {
  async create(req: Request, res: Response) {
    try {
      const data: IngredientInput = req.body;
      const ingredient = await ingredientService.create(data);
      res.status(201).json({
        success: true,
        data: ingredient,
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
      const ingredients = await ingredientService.getAll();
      res.status(200).json({
        success: true,
        data: ingredients,
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
      const ingredient = await ingredientService.getById(id);
      res.status(200).json({
        success: true,
        data: ingredient,
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
      const data: Partial<IngredientInput> = req.body;
      const ingredient = await ingredientService.update(id, data);
      res.status(200).json({
        success: true,
        data: ingredient,
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
      const result = await ingredientService.deactivate(id);
      res.status(200).json({
        success: false,
        message: 'Ingredient deactivated successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new IngredientController();
