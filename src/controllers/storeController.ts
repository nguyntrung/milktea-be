import { Request, Response } from 'express';
import storeService from '../services/storeService';
import { StoreInput } from '../models/storeModel';

class StoreController {
  async getStoreInfo(req: Request, res: Response) {
    try {
      const store = await storeService.getStoreInfo();
      res.status(200).json({
        success: true,
        data: store,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateStoreInfo(req: Request, res: Response) {
    try {
      const data: Partial<StoreInput> = req.body;
      const file = req.file;
      const store = await storeService.updateStoreInfo(data, file);
      res.status(200).json({
        success: true,
        data: store,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new StoreController();
