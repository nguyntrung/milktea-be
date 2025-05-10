import { Request, Response } from 'express';
import { DonViTinh } from '../types/common';

// Lấy danh sách tất cả các giá trị enum DonViTinh
export const getAllUnitTypes = async (req: Request, res: Response) => {
  try {
    const unitTypes = Object.values(DonViTinh);
    return res.status(200).json({
      success: true,
      data: unitTypes
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
