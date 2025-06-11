import { Request, Response } from 'express';
import supplierService from '../services/supplierService';
import { SupplierInput } from '../models/supplierModel';

class SupplierController {
  async create(req: Request, res: Response) {
    try {
      const data: SupplierInput = req.body;
      const supplier = await supplierService.create(data);
      res.status(201).json({
        success: true,
        data: supplier,
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
      const suppliers = await supplierService.getAll();
      res.status(200).json({
        success: true,
        data: suppliers,
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
      const supplier = await supplierService.getById(id);
      res.status(200).json({
        success: true,
        data: supplier,
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
      const data: Partial<SupplierInput> = req.body;
      const supplier = await supplierService.update(id, data);
      res.status(200).json({
        success: true,
        data: supplier,
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
      const result = await supplierService.deactivate(id);
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
        const result = await supplierService.delete(id);
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

export default new SupplierController();
