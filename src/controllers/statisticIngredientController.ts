import { Request, Response } from 'express';
import statisticcIngredientService from '../services/statisticcIngredientService';

class StatisticIngredientController {
  async getAll(req: Request, res: Response) {
    try {
      const data = await statisticcIngredientService.getAll();
      res.status(200).json({
        success: true,
        data,
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
      const data = await statisticcIngredientService.getById(id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new StatisticIngredientController();
