import statisticIngredientModel, {StatisticIngredientInput} from "../models/statisticIngredientModel";
import ingredientModel from "../models/ingredientModel";
import productModel from "../models/productModel";
import orderModel from "../models/orderModel";
import orderDetailModel from "../models/orderDetailModel";
import { BadRequestError } from "../utils/errors";
import {convertToBaseUnit} from "../types/helpper"

class StatisticIngredientService{
  // Tạo thống kê nguyên liệu mới (theo input tay và tính toán tự động các phần còn lại)
  async createStatistic(input: StatisticIngredientInput) {
    const { ngay, maNguyenLieu, soLuongBanDau, soLuongNhap } = input;

    const dateKey = this.normalizeDate(ngay);

    // Kiểm tra nguyên liệu có tồn tại không
    const ingredient = await ingredientModel.findById(maNguyenLieu);
    if (!ingredient) {
      throw new BadRequestError(`Nguyên liệu không tồn tại: ${maNguyenLieu}`);
    }

    // Kiểm tra đã có thống kê cho ngày và nguyên liệu này chưa
    const existing = await statisticIngredientModel.findOne({ ngay: dateKey, maNguyenLieu });
    if (existing) {
      throw new BadRequestError(`Đã tồn tại thống kê cho nguyên liệu này vào ngày ${dateKey.toISOString().slice(0, 10)}`);
    }

    // Lấy tổng số lượng bán từ các đơn hàng trong ngày
    const orderIds = await orderModel.find({
      ngayTao: {
        $gte: dateKey,
        $lt: new Date(dateKey.getTime() + 24 * 60 * 60 * 1000),
      },
    }).select('_id');

    const orderIdList = orderIds.map(o => o._id);

    const orderDetails = await orderDetailModel.find({ maHoaDon: { $in: orderIdList } });

    let soLuongBan = 0;

    for (const detail of orderDetails) {
      const product = await productModel.findById(detail.maSanPham);
      if (!product) continue;

      // Lấy đúng size của chi tiết đơn hàng
      const size = product.luaChonSize.find(s => s.tenSize === detail.kichCo.tenSize);
      if (!size) continue;

      // Chỉ cộng nguyên liệu đúng đang xét (maNguyenLieu)
      for (const tp of size.thanhPhan) {
        if (tp.maNguyenLieu.toString() === maNguyenLieu.toString()) {
          // Quy đổi tp.soLuong từ tp.donViTinh -> ingredient.donViTinh
          const converted = convertToBaseUnit(tp.soLuong, tp.donViTinh, ingredient.donViTinh);
          soLuongBan += converted * detail.soLuong;
        }
      }
    }

    // Tính tồn kho
    const soLuongHaoHut = 0;
    const soLuongTon = soLuongBanDau + soLuongNhap - soLuongBan - soLuongHaoHut;

    // Tạo mới thống kê
    const newStat = await statisticIngredientModel.create({
      ngay: dateKey,
      maNguyenLieu,
      donViTinh:ingredient.donViTinh,
      soLuongBanDau,
      soLuongNhap,
      soLuongBan,
      soLuongHaoHut,
      soLuongTon,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    });

    return newStat;
  }

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

  // Tính tổng nguyên liệu đã dùng theo mã hóa đơn
  async calculateIngredientsUsed(maHoaDon: string) {
    // Lấy chi tiết đơn hàng theo mã hóa đơn
    const orderDetails = await orderDetailModel.find({ maHoaDon });
    if (orderDetails.length === 0) {
      throw new Error('Không tìm thấy chi tiết đơn hàng cho hóa đơn này');
    }

    // Map lưu tổng nguyên liệu đã dùng: { maNguyenLieu: soLuong }
    const ingredientUsageMap: Record<string, number> = {};

    for (const detail of orderDetails) {
      // Lấy sản phẩm
      const product = await productModel.findById(detail.maSanPham);
      if (!product) {
        throw new Error(`Sản phẩm không tồn tại: ${detail.maSanPham}`);
      }

      // Tìm size tương ứng trong product
      const sizeObj = product.luaChonSize.find(s => s.tenSize === detail.kichCo.tenSize);
      if (!sizeObj) {
        throw new Error(`Không tìm thấy size ${detail.kichCo.tenSize} trong sản phẩm ${product.ten}`);
      }

      // Tính nguyên liệu: số lượng trong thành phần * số lượng sản phẩm trong chi tiết
      for (const tp of sizeObj.thanhPhan) {
        const ingredient = await ingredientModel.findById(tp.maNguyenLieu);
        if (!ingredient) continue;

        const converted = convertToBaseUnit(tp.soLuong, tp.donViTinh, ingredient.donViTinh);
        const usedQty = converted * detail.soLuong;

        if (ingredientUsageMap[tp.maNguyenLieu]) {
          ingredientUsageMap[tp.maNguyenLieu] += usedQty;
        } else {
          ingredientUsageMap[tp.maNguyenLieu] = usedQty;
        }
      }
    }

    return ingredientUsageMap;
  }

  // Hàm chuẩn hóa ngày (đặt giờ phút giây và mili giây về 0)
  private normalizeDate(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Tính tổng nguyên liệu đã bán trong ngày cho 1 nguyên liệu
  private async calculateSoLuongBanTheoNgay(maNguyenLieu: string, dateKey: Date): Promise<number> {
    const orders = await orderModel.find({
      ngayTao: {
        $gte: dateKey,
        $lt: new Date(dateKey.getTime() + 24 * 60 * 60 * 1000),
      },
    }).select('_id');

    const orderIdList = orders.map(o => o._id);

    const orderDetails = await orderDetailModel.find({ maHoaDon: { $in: orderIdList } });

    let totalSoLuongBan = 0;

    for (const detail of orderDetails) {
      const product = await productModel.findById(detail.maSanPham);
      if (!product) continue;

      const size = product.luaChonSize.find(s => s.tenSize === detail.kichCo.tenSize);
      if (!size) continue;

      for (const tp of size.thanhPhan) {
        if (tp.maNguyenLieu.toString() === maNguyenLieu.toString()) {
          const ingredient = await ingredientModel.findById(maNguyenLieu);
          if (!ingredient) continue;

          const converted = convertToBaseUnit(tp.soLuong, tp.donViTinh, ingredient.donViTinh);
          totalSoLuongBan += converted * detail.soLuong;
        }
      }
    }

    return totalSoLuongBan;
  }

  // Cập nhật trừ kho nguyên liệu theo hóa đơn
  async deductIngredientsByOrder(maHoaDon: string, ngay: Date = new Date()) {
    const dateKey = this.normalizeDate(ngay);

    const ingredientUsageMap = await this.calculateIngredientsUsed(maHoaDon);

    for (const maNguyenLieu in ingredientUsageMap) {
      // Tính lại tổng số lượng bán của nguyên liệu này trong ngày (toàn bộ đơn hàng)
      const totalSoLuongBanTrongNgay = await this.calculateSoLuongBanTheoNgay(maNguyenLieu, dateKey);

      let stat = await statisticIngredientModel.findOne({ ngay: dateKey, maNguyenLieu });

      if (!stat) {
        const ingredient = await ingredientModel.findById(maNguyenLieu);
        if (!ingredient) {
          throw new Error(`Nguyên liệu không tồn tại: ${maNguyenLieu}`);
        }

        stat = new statisticIngredientModel({
          ngay: dateKey,
          maNguyenLieu,
          donViTinh: ingredient.donViTinh,
          soLuongBanDau: 0,
          soLuongBan: totalSoLuongBanTrongNgay,
          soLuongNhap: 0,
          soLuongHaoHut: 0,
          soLuongTon: 0,
          ngayTao: new Date(),
          ngayCapNhat: new Date(),
        });
      } else {
        stat.soLuongBan = totalSoLuongBanTrongNgay; // Gán lại thay vì cộng dồn
        stat.ngayCapNhat = new Date();
      }

      stat.soLuongTon = stat.soLuongBanDau + stat.soLuongNhap - stat.soLuongBan - stat.soLuongHaoHut;

      await stat.save();
    }

    return { message: 'Cập nhật trừ kho nguyên liệu thành công' };
  }

  async updateStatistic(id: string, input: Partial<StatisticIngredientInput>) {
    const existing = await statisticIngredientModel.findById(id);
    if (!existing) {
      throw new BadRequestError('Thống kê nguyên liệu không tồn tại');
    }

    Object.assign(existing, input, {
      ngayCapNhat: new Date(),
    });

    await existing.save();
    return existing;
  }

  // Thống kê nguyên liệu theo tháng (group theo maNguyenLieu)
  async getStatisticByMonth(thang: number, nam: number) {
    const startDate = new Date(nam, thang - 1, 1); // Đầu tháng
    const endDate = new Date(nam, thang, 1);       // Đầu tháng tiếp theo

    const result = await statisticIngredientModel.aggregate([
      { $match: { ngay: { $gte: startDate, $lt: endDate } } },
      { $sort: { ngay: 1 } },
      {
        $group: {
          _id: '$maNguyenLieu',
          donViTinh: { $first: '$donViTinh' },
          tenNguyenLieu: { $first: '$tenNguyenLieu' },
          soLuongBanDau: { $first: '$soLuongBanDau' },
          tongSoLuongNhap: { $sum: '$soLuongNhap' },
          tongSoLuongBan: { $sum: '$soLuongBan' },
          tongSoLuongHaoHut: { $sum: '$soLuongHaoHut' },
          soLuongTon: { $last: '$soLuongTon' },
        },
      },
      {
        $project: {
          _id: 0,
          maNguyenLieu: '$_id',
          tenNguyenLieu: 1,
          donViTinh: 1,
          soLuongBanDau: 1,
          tongSoLuongNhap: 1,
          tongSoLuongBan: 1,
          tongSoLuongHaoHut: 1,
          soLuongTon: 1,
        },
      },
    ]);
    return result;
  }

  async getStatisticByDay(thang: number, nam: number) {
    const startDate = new Date(nam, thang - 1, 1);
    const endDate = new Date(nam, thang, 1); // ngày đầu tháng sau

    const result = await statisticIngredientModel.aggregate([
      {
        $match: {
          ngay: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            maNguyenLieu: '$maNguyenLieu',
            ngay: {
              $dateToString: { format: '%Y-%m-%d', date: '$ngay' }, // nhóm theo ngày
            },
          },
          donViTinh: { $first: '$donViTinh' },
          tenNguyenLieu: { $first: '$tenNguyenLieu' },
          tongSoLuongBanDau: { $sum: '$soLuongBanDau' },
          tongSoLuongNhap: { $sum: '$soLuongNhap' },
          tongSoLuongBan: { $sum: '$soLuongBan' },
          tongSoLuongHaoHut: { $sum: '$soLuongHaoHut' },
          tongSoLuongTon: { $sum: '$soLuongTon' },
        },
      },
      {
        $sort: { '_id.ngay': 1 }, // sắp xếp theo ngày tăng dần
      },
      {
        $project: {
          ngay: '$_id.ngay',
          maNguyenLieu: '$_id.maNguyenLieu',
          tenNguyenLieu: 1,
          donViTinh: 1,
          tongSoLuongBanDau: 1,
          tongSoLuongNhap: 1,
          tongSoLuongBan: 1,
          tongSoLuongHaoHut: 1,
          tongSoLuongTon: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }
}

export default new StatisticIngredientService();