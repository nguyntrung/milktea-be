import statisticIngredientModel, {StatisticIngredientInput} from "../models/statisticIngredientModel";
import ingredientModel from "../models/ingredientModel";
import { BadRequestError } from "../utils/errors";
class StaticIngredientService{
 // Lấy toàn bộ thống kê, sắp xếp mới nhất trước
  async getAll() {
    return await statisticIngredientModel
      .find()
      .populate('maNguyenLieu', 'ten')
      .sort({ ngay: -1 });
  }

  // Lấy thống kê theo ID
  async getById(id: string) {
    const statistic = await statisticIngredientModel
      .findById(id)
      .populate('maNguyenLieu', 'ten');
    if (!statistic) {
      throw new BadRequestError('Dữ liệu thống kê không tồn tại');
    }
    return statistic;
  }
}

export default new StaticIngredientService();