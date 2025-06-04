import { Request, Response } from 'express';
import bannerService from '../services/bannerService';
import { BannerInput } from '../models/bannerModel';

class BannerController {
  async getAll(req: Request, res: Response) {
    try {
      const banners = await bannerService.getAll();
      res.status(200).json({
        success: true,
        data: banners,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getByPositionAndStatus(req: Request, res: Response) {
    try {
      const { viTri, hienThi } = req.query;
      const banners = await bannerService.getByPositionAndStatus(
        viTri as string,
        hienThi === 'true'
      );
      res.status(200).json({
        success: true,
        data: banners,
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
      const banner = await bannerService.getById(id);
      res.status(200).json({
        success: true,
        data: banner,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data: BannerInput = req.body;
      const file = req.file;
      const banner = await bannerService.create(data, file);
      res.status(201).json({
        success: true,
        data: banner,
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
      const data: Partial<BannerInput> = req.body;
      const file = req.file;
      const banner = await bannerService.update(id, data, file);
      res.status(200).json({
        success: true,
        data: banner,
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
      await bannerService.delete(id);
      res.status(200).json({
        success: true,
        message: 'Xóa banner thành công',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new BannerController();
