import mongoose from 'mongoose';
import statisticIngredientModel from "../models/statisticIngredientModel";
import ingredientModel from "../models/ingredientModel";
import productModel from "../models/productModel";
import orderModel from "../models/orderModel";
import orderDetailModel from "../models/orderDetailModel";
import orderIngredientDetailModel from "../models/orderIngredientDetailModel";
import { BadRequestError } from "../utils/errors";
import { TrangThaiDonHang } from '../types/common';
import {convertToBaseUnit} from "../types/helpper"

interface DailyIngredientStat {
  maNguyenLieu: string;
  tenNguyenLieu: string;
  donViTinh: string;
  soLuongNhap: number;
  soLuongBan: number;
  soLuongHaoHut: number;
  soLuongTon: number;
}

function round(value: number, decimals = 4): number {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
  }

class StatisticIngredientService{
  //Hàm tính thời gian
  normalizeDate(dateInput: string | Date) {
    const input = new Date(dateInput);
    return new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()));
  }
  
  async getDailyIngredientStatistic(ngay: Date) {
    const startDate = this.normalizeDate(ngay);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    const prevDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);

    const ingredients = await ingredientModel.find();
    const result = [];

    for (const ing of ingredients) {
      const maNguyenLieuId = ing.id;

      // Lấy tồn hôm trước
      const prev = await statisticIngredientModel.findOne({
        ngay: prevDate,
        maNguyenLieu: maNguyenLieuId
      });
      const tonHomTruoc = prev?.soLuongTon || 0;

      // Tổng số lượng nhập
      const nhapAgg = await orderIngredientDetailModel.aggregate([
        {
          $match: {
            maNguyenLieu: maNguyenLieuId,
            ngayTao: { $gte: startDate, $lt: endDate }
          }
        },
        {
          $group: { _id: null, total: { $sum: "$soLuong" } }
        }
      ]);
      const soLuongNhap = nhapAgg[0]?.total || 0;

      // Tổng số lượng bán
      const orders = await orderModel.find({ ngayTao: { $gte: startDate, $lt: endDate } }).select("_id");
      const orderDetails = await orderDetailModel.find({ maHoaDon: { $in: orders.map(o => o._id) } });

      let soLuongBan = 0;
      for (const detail of orderDetails) {
        const product = await productModel.findById(detail.maSanPham);
        const size = product?.luaChonSize.find(s => s.tenSize === detail.kichCo.tenSize);
        if (!product || !size) continue;

        for (const tp of size.thanhPhan) {
          if (tp.maNguyenLieu.toString() === ing.id) {
            const converted = convertToBaseUnit(tp.soLuong, tp.donViTinh, ing.donViTinh);
            soLuongBan += converted * detail.soLuong;
          }
        }
      }

      // Lấy hao hụt (nếu có) từ bản ghi đã có
      const existingStat = await statisticIngredientModel.findOne({
        ngay: startDate,
        maNguyenLieu: maNguyenLieuId
      });
      const soLuongHaoHut = existingStat?.soLuongHaoHut || 0;

      // Tính tồn cuối
      const soLuongTon = tonHomTruoc + soLuongNhap - soLuongBan - soLuongHaoHut;

      // Tạo hoặc cập nhật bản ghi thống kê
      if (!existingStat) {
        await statisticIngredientModel.create({
          ngay: startDate,
          maNguyenLieu: maNguyenLieuId,
          tenNguyenLieu: ing.ten,
          donViTinh: ing.donViTinh,
          soLuongNhap,
          soLuongBan,
          soLuongHaoHut,
          soLuongTon,
          ngayTao: new Date(),
          ngayCapNhat: new Date()
        });
      } else {
        existingStat.soLuongNhap = soLuongNhap;
        existingStat.soLuongBan = soLuongBan;
        existingStat.soLuongTon = soLuongTon;
        existingStat.ngayCapNhat = new Date();
        await existingStat.save();
      }

      result.push({
        maNguyenLieu: ing._id,
        tenNguyenLieu: ing.ten,
        donViTinh: ing.donViTinh,
        soLuongNhap,
        soLuongBan,
        soLuongHaoHut,
        soLuongTon
      });
    }

    return result;
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
    const order = await orderModel.findById(maHoaDon);
    if (!order) throw new BadRequestError(`Không tìm thấy đơn hàng với ID: ${maHoaDon}`);

    const ingredientUsageMap = await this.calculateIngredientsUsed(maHoaDon);

    for (const maNguyenLieu in ingredientUsageMap) {
      const usedQty = ingredientUsageMap[maNguyenLieu];
      const stat = await statisticIngredientModel.findOne({ ngay: dateKey, maNguyenLieu });

      if (!stat) {
        throw new BadRequestError(`Không tìm thấy thống kê cho nguyên liệu: ${maNguyenLieu}`);
      }

      const soLuongTonSauTru = round(stat.soLuongTon - usedQty);

      if (soLuongTonSauTru < 0) {
        throw new BadRequestError(
          `Không đủ nguyên liệu để trừ kho. Nguyên liệu: ${maNguyenLieu}, tồn kho bị âm (${soLuongTonSauTru})`
        );
      }

      stat.soLuongBan = round(stat.soLuongBan + usedQty);
      stat.soLuongTon = soLuongTonSauTru;
      stat.ngayCapNhat = new Date();

      await stat.save();
    }

    return { message: 'Cập nhật trừ kho nguyên liệu thành công' };
  }

  // Cập nhật hao hụt
  async updateHaoHut(
    ngay: Date,
    haoHutList: { maNguyenLieu: string; soLuongHaoHut: number }[]
  ) {
    const dateKey = this.normalizeDate(ngay);
    const updates = [];

    for (const item of haoHutList) {
      const stat = await statisticIngredientModel.findOne({
        ngay: dateKey,
        maNguyenLieu: item.maNguyenLieu,
      });

      if (!stat) {
        throw new BadRequestError(
          `Không tìm thấy thống kê cho nguyên liệu: ${item.maNguyenLieu}`
        );
      }

      const nguyenLieu = await ingredientModel.findById(item.maNguyenLieu);
      if (!nguyenLieu) {
        throw new BadRequestError(`Không tìm thấy nguyên liệu: ${item.maNguyenLieu}`);
      }

      let haoHutChuyenDoi: number;

      const dv = nguyenLieu.donViTinh.toLowerCase();
      // Nếu là đơn vị khối lượng/lít thì mới chuyển đổi từ gram/ml
      if (['kg', 'lít'].includes(dv)) {
        const fromUnit = dv === 'kg' ? 'gram' : 'ml';
        haoHutChuyenDoi = convertToBaseUnit(item.soLuongHaoHut, fromUnit, dv);
      } else {
        // Các đơn vị không chuyển đổi, giữ nguyên số nguyên
        haoHutChuyenDoi = item.soLuongHaoHut;
      }

      stat.soLuongHaoHut = haoHutChuyenDoi;
      const prevDate = new Date(dateKey.getTime() - 24 * 60 * 60 * 1000);
      const prev = await statisticIngredientModel.findOne({
        ngay: prevDate,
        maNguyenLieu: item.maNguyenLieu,
      });
      const tonHomTruoc = prev?.soLuongTon || 0;

      stat.soLuongTon = tonHomTruoc + stat.soLuongNhap - stat.soLuongBan - stat.soLuongHaoHut;

      stat.ngayCapNhat = new Date();

      if (stat.soLuongTon < 0) {
        throw new BadRequestError(
          `Số lượng tồn kho âm sau hao hụt cho nguyên liệu ${item.maNguyenLieu}`
        );
      }

      updates.push(stat.save());
    }

    await Promise.all(updates);
    return { message: 'Cập nhật hao hụt thành công' };
  }

  //Thống kê nguyên liệu theo ngày.
  async getStatisticByDay(ngay: number, thang: number, nam: number) {
    const startDate = new Date(Date.UTC(nam, thang - 1, ngay));
    const endDate = new Date(Date.UTC(nam, thang - 1, ngay + 1));

    const result = await statisticIngredientModel.aggregate([
      { $match: { ngay: { $gte: startDate, $lt: endDate } } },
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
      { $unwind: { path: '$nguyenLieus', preserveNullAndEmptyArrays: true } },
      { $sort: { '_id.ngay': 1 } },
      {
        $project: {
          ngay: '$_id.ngay',
          maNguyenLieu: '$_id.maNguyenLieu',
          tenNguyenLieu: '$nguyenLieus.ten',
          donViTinh: 1,
          tongSoLuongNhap: 1,
          tongSoLuongBan: 1,
          tongSoLuongHaoHut: 1,
          tongSoLuongTon: 1,
          ngayTK: ngay,
          thangTK: thang,
          namTK: nam,
          _id: 0
        },
      },
    ]);

    return result;
  }

  //Thống kê nguyên liệu theo tháng
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
          tongSoLuongNhap: 1,
          tongSoLuongBan: 1,
          tongSoLuongHaoHut: 1,
          soLuongTon: 1,
          thang: { $literal: thang },
          nam: { $literal: nam }
        }
      }
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
          tongSoLuongNhap: 1,
          tongSoLuongBan: 1,
          tongSoLuongHaoHut: 1,
          tongSoLuongTon: 1,
          nam: { $literal: nam }
        }
      }
    ]);

    return result;
  }

  // 1) Thống kê doanh thu & số lượng bán theo THÁNG
  // --------------------------------------------------------
  async getRevenueByMonth(month: number, year: number) {
    //Xác định ranh giới ngày tháng (UTC)
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate   = new Date(Date.UTC(year, month, 1));

    // 1.2) Tính tổng doanh thu từ collection 'donhangs'
    const doanhThuAgg = await orderModel.aggregate([
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
      }
    ]);
    const tongDoanhThu = doanhThuAgg[0]?.tongDoanhThu || 0;

    //Tính tổng số sản phẩm bán được từ 'chitiethdonhangs'
    const sanPhamAgg = await orderDetailModel.aggregate([
      // A) Convert maHoaDon:string → ObjectId
      {
        $addFields: {
          orderObjId: { $toObjectId: '$maHoaDon' }
        }
      },
      //Lookup sang collection 'donhangs' để join chi tiết với đơn hàng gốc
      {
        $lookup: {
          from: 'donhangs',
          localField: 'orderObjId',
          foreignField: '_id',
          as: 'donHang'
        }
      },
      //Unwind mảng donHang để mỗi document chỉ còn 1 object 'donHang'
      {
        $unwind: {
          path: '$donHang',
          preserveNullAndEmptyArrays: false
        }
      },
      //Match: chỉ giữ detail của các đơn đã thanh toán và order.ngayTao trong tháng
      {
        $match: {
          'donHang.thanhToan.trangThaiThanhToan': 'daThanhToan',
          'donHang.ngayTao': { $gte: startDate, $lt: endDate }
        }
      },
      //Group để cộng tổng soLuong (tính số sản phẩm bán được)
      {
        $group: {
          _id: null,
          tongSanPhamBanDuoc: { $sum: '$soLuong' }
        }
      }
    ]);
    const tongSanPhamBanDuoc = sanPhamAgg[0]?.tongSanPhamBanDuoc || 0;

    return {
      thang: month,
      nam: year,
      tongDoanhThu,
      tongSanPhamBanDuoc
    };
  }

  // --------------------------------------------------------
  //Thống kê doanh thu & số lượng bán theo NGÀY
  // --------------------------------------------------------
  async getRevenueByDay(day: number, month: number, year: number) {
    //Xác định ranh giới UTC của ngày
    const startDate = new Date(Date.UTC(year, month - 1, day));
    const endDate   = new Date(Date.UTC(year, month - 1, day + 1));

    //Tính tổng doanh thu từ 'donhangs'
    const doanhThuAgg = await orderModel.aggregate([
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
      }
    ]);
    const tongDoanhThu = doanhThuAgg[0]?.tongDoanhThu || 0;

    //Tính tổng số sản phẩm bán được từ 'chitiethdonhangs'
    const sanPhamAgg = await orderDetailModel.aggregate([
      {
        $addFields: {
          orderObjId: { $toObjectId: '$maHoaDon' }
        }
      },
      {
        $lookup: {
          from: 'donhangs',
          localField: 'orderObjId',
          foreignField: '_id',
          as: 'donHang'
        }
      },
      {
        $unwind: {
          path: '$donHang',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          'donHang.thanhToan.trangThaiThanhToan': 'daThanhToan',
          'donHang.ngayTao': { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          tongSanPhamBanDuoc: { $sum: '$soLuong' }
        }
      }
    ]);
    const tongSanPhamBanDuoc = sanPhamAgg[0]?.tongSanPhamBanDuoc || 0;

    return {
      ngay: day,
      thang: month,
      nam: year,
      tongDoanhThu,
      tongSanPhamBanDuoc
    };
  }

  // --------------------------------------------------------
  //Thống kê doanh thu & số lượng bán theo NĂM
  // --------------------------------------------------------
  async getRevenueByYear(year: number) {
    //Xác định ranh giới đầu-cuối UTC của năm
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate   = new Date(Date.UTC(year + 1, 0, 1));

    //Tính tổng doanh thu từ 'donhangs'
    const doanhThuAgg = await orderModel.aggregate([
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
      }
    ]);
    const tongDoanhThu = doanhThuAgg[0]?.tongDoanhThu || 0;

    //Tính tổng số sản phẩm bán được từ 'chitiethdonhangs'
    const sanPhamAgg = await orderDetailModel.aggregate([
      {
        $addFields: {
          orderObjId: { $toObjectId: '$maHoaDon' }
        }
      },
      {
        $lookup: {
          from: 'donhangs',
          localField: 'orderObjId',
          foreignField: '_id',
          as: 'donHang'
        }
      },
      {
        $unwind: {
          path: '$donHang',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $match: {
          'donHang.thanhToan.trangThaiThanhToan': 'daThanhToan',
          'donHang.ngayTao': { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          tongSanPhamBanDuoc: { $sum: '$soLuong' }
        }
      }
    ]);
    const tongSanPhamBanDuoc = sanPhamAgg[0]?.tongSanPhamBanDuoc || 0;

    return {
      nam: year,
      tongDoanhThu,
      tongSanPhamBanDuoc
    };
  }
}

export default new StatisticIngredientService();