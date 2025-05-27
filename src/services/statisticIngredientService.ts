import mongoose from 'mongoose';
import statisticIngredientModel, {StatisticIngredientInput} from "../models/statisticIngredientModel";
import ingredientModel from "../models/ingredientModel";
import productModel from "../models/productModel";
import orderModel from "../models/orderModel";
import orderDetailModel from "../models/orderDetailModel";
import orderIngredientDetailModel from "../models/orderIngredientDetailModel";
import { BadRequestError } from "../utils/errors";
import {convertToBaseUnit} from "../types/helpper"

class StatisticIngredientService{
  //Hàm tính thời gian
  normalizeDate(dateInput: string | Date) {
    const input = new Date(dateInput);
    return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
  }

  async createStatistic(input: StatisticIngredientInput) {
    const { ngay, maNguyenLieu, soLuongBanDau } = input;

    const dateKey = this.normalizeDate(ngay);
    const nextDate = new Date(dateKey.getTime() + 24 * 60 * 60 * 1000); // ngày hôm sau UTC

    //Kiểm tra nguyên liệu
    const ingredient = await ingredientModel.findById(maNguyenLieu);
    if (!ingredient) {
      throw new BadRequestError(`Nguyên liệu không tồn tại: ${maNguyenLieu}`);
    }

    //Kiểm tra thống kê đã tồn tại chưa
    const existing = await statisticIngredientModel.findOne({ ngay: dateKey, maNguyenLieu });
    if (existing) {
      throw new BadRequestError(`Đã tồn tại thống kê cho nguyên liệu này vào ngày ${dateKey.toISOString().slice(0, 10)}`);
    }

    //Lấy danh sách đơn hàng trong ngày
    const orderIds = await orderModel.find({
      ngayTao: {
        $gte: dateKey,
        $lt: nextDate,
      },
    }).select('_id');

    const orderIdList = orderIds.map(o => o._id);
    const orderDetails = await orderDetailModel.find({ maHoaDon: { $in: orderIdList } });

    //Tính tổng số lượng bán
    let soLuongBan = 0;
    for (const detail of orderDetails) {
      const product = await productModel.findById(detail.maSanPham);
      if (!product) continue;

      const size = product.luaChonSize.find(s => s.tenSize === detail.kichCo.tenSize);
      if (!size) continue;

      for (const tp of size.thanhPhan) {
        if (tp.maNguyenLieu.toString() === maNguyenLieu.toString()) {
          const converted = convertToBaseUnit(tp.soLuong, tp.donViTinh, ingredient.donViTinh);
          soLuongBan += converted * detail.soLuong;
        }
      }
    }

    //Lấy chi tiết nhập nguyên liệu đúng ngày
    const maNguyenLieuId = new mongoose.Types.ObjectId(maNguyenLieu);
    const importedDetails = await orderIngredientDetailModel.find({
      maNguyenLieu: maNguyenLieuId,
      ngayTao: {
        $gte: dateKey,
        $lt: nextDate,
      },
    });

    //Tính tổng số lượng nhập
    let soLuongNhap = 0;
    for (const detail of importedDetails) {
      const converted = convertToBaseUnit(detail.soLuong, detail.donViTinh, ingredient.donViTinh);
      soLuongNhap += converted;
    }

    //Tính tồn kho
    const soLuongHaoHut = 0;
    const soLuongTon = soLuongBanDau + soLuongNhap - soLuongBan - soLuongHaoHut;

    //Tạo thống kê
    const newStat = await statisticIngredientModel.create({
      ngay: dateKey,
      maNguyenLieu,
      donViTinh: ingredient.donViTinh,
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

  //Thống kê nguyên liệu theo Tháng
  async getStatisticByMonth(thang: number, nam: number) {
    const startDate = new Date(Date.UTC(nam, thang - 1, 1));
    const endDate = new Date(Date.UTC(nam, thang, 1)); 

    const monthString = `${nam}-${String(thang).padStart(2, '0')}`;

    const result = await statisticIngredientModel.aggregate([
      {
        $addFields: {
          monthKey: { $dateToString: { format: "%Y-%m", date: "$ngay" } }
        }
      },
      {
        $match: {
          monthKey: monthString
        }
      },
      { $sort: { ngay: 1 } },
      {
        $group: {
          _id: '$maNguyenLieu',
          donViTinh: { $first: '$donViTinh' },
          soLuongBanDau: { $first: '$soLuongBanDau' },
          tongSoLuongNhap: { $sum: '$soLuongNhap' },
          tongSoLuongBan: { $sum: '$soLuongBan' },
          tongSoLuongHaoHut: { $sum: '$soLuongHaoHut' },
          soLuongTon: { $last: '$soLuongTon' },
        }
      },
      {
        $addFields: {
          maNguyenLieuObjId: { $toObjectId: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'nguyenlieus',
          localField: 'maNguyenLieuObjId',
          foreignField: '_id',
          as: 'nguyenLieus',
        }
      },
      { $unwind: { path: '$nguyenLieus', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          tenNguyenLieu: '$nguyenLieus.ten'
        }
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
          soLuongTon: 1
        }
      }
    ]);
    return result;
  }

  //Thống kê nguyên liệu theo ngày
  async getStatisticByDay(ngay: number, thang: number, nam: number) {
      const startDate = new Date(Date.UTC(nam, thang - 1, ngay));
      const endDate = new Date(Date.UTC(nam, thang - 1, ngay + 1));

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
              $dateToString: { format: '%Y-%m-%d', date: '$ngay' },
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
        $addFields: {
          maNguyenLieuObjId: { $toObjectId: '$_id.maNguyenLieu' }
        }
      },
      {
        $lookup: {
          from: 'nguyenlieus',
          localField: 'maNguyenLieuObjId',
          foreignField: '_id',
          as: 'nguyenLieus',
        },
      },
      {
        $unwind: {
          path: '$nguyenLieus',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { '_id.ngay': 1 },
      },
      {
        $project: {
          ngay: '$_id.ngay',
          maNguyenLieu: '$_id.maNguyenLieu',
          tenNguyenLieu: '$nguyenLieus.ten',
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

  //Thống kê nguyên liệu theo Năm
  async getStatisticByYear(nam: number) {
    const startDate = new Date(Date.UTC(nam, 0, 1));
    const endDate = new Date(Date.UTC(nam + 1, 0, 1));

    const result = await statisticIngredientModel.aggregate([
      { $match: { ngay: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: '$maNguyenLieu',
          tongSoLuongBanDau: { $sum: '$soLuongBanDau' },
          tongSoLuongNhap: { $sum: '$soLuongNhap' },
          tongSoLuongBan: { $sum: '$soLuongBan' },
          tongSoLuongHaoHut: { $sum: '$soLuongHaoHut' },
          tongSoLuongTon: { $last: '$soLuongTon' },
          donViTinh: { $first: '$donViTinh' }
        }
      },
      {
        $addFields: {
          maNguyenLieuObjId: { $toObjectId: '$_id' }
        }
      },
      {
        $lookup: {
          from: 'nguyenlieus',
          localField: 'maNguyenLieuObjId',
          foreignField: '_id',
          as: 'nguyenLieus',
        }
      },
      { $unwind: { path: '$nguyenLieus', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          maNguyenLieu: '$_id',
          tenNguyenLieu: '$nguyenLieus.ten',
          donViTinh: 1,
          tongSoLuongBanDau: 1,
          tongSoLuongNhap: 1,
          tongSoLuongBan: 1,
          tongSoLuongHaoHut: 1,
          tongSoLuongTon: 1
        }
      }
    ]);

    return result;
  }


  //Thống kê doanh thu theo tháng
  async getRevenueByMonth(month: number, year: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const result = await orderModel.aggregate([
      {
        $match: {
          ngayTao: { $gte: startDate, $lt: endDate },
          'thanhToan.trangThaiThanhToan': 'daThanhToan'
        }
      },
      {
        $group: {
          _id: null,
          tongDoanhThu: { $sum: '$tongTien' }
        }
      },
      {
        $project: {
          _id: 0,
          thang: { $literal: month },
          nam: { $literal: year },
          tongDoanhThu: 1
        }
      }
    ]);

    return result[0] || { thang: month, nam: year, tongDoanhThu: 0 };
  }


  //Thống kê doanh thu theo ngày
  async getRevenueByDay(day: number, month: number, year: number) {
    const startDate = new Date(Date.UTC(year, month - 1, day));
    const endDate = new Date(Date.UTC(year, month - 1, day + 1));

    const result = await orderModel.aggregate([
      {
        $match: {
          ngayTao: { $gte: startDate, $lt: endDate },
          'thanhToan.trangThaiThanhToan': 'daThanhToan'
        }
      },
      {
        $group: {
          _id: null,
          tongDoanhThu: { $sum: '$tongTien' }
        }
      },
      {
        $project: {
          _id: 0,
          ngay: { $literal: day },
          thang: { $literal: month },
          nam: { $literal: year },
          tongDoanhThu: 1
        }
      }
    ]);

    return result[0] || { ngay: day, thang: month, nam: year, tongDoanhThu: 0 };
  }

  //Thống kê doanh thu theo năm
  async getRevenueByYear(nam: number) {
    const startDate = new Date(Date.UTC(nam, 0, 1));
    const endDate = new Date(Date.UTC(nam + 1, 0, 1));

    const result = await orderModel.aggregate([
      {
        $match: {
          ngayTao: { $gte: startDate, $lt: endDate },
          'thanhToan.trangThaiThanhToan': 'daThanhToan'
        }
      },
      {
        $group: {
          _id: null,
          tongDoanhThu: { $sum: '$tongTien' }
        }
      },
      {
        $project: {
          _id: 0,
          nam: { $literal: nam },
          tongDoanhThu: 1
        }
      }
    ]);

    return result[0] || { nam, tongDoanhThu: 0 };
  }
}

export default new StatisticIngredientService();