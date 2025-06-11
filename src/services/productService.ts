import productModel, { ProductInput } from '../models/productModel';
import categoryModel from '../models/categoryModel';
import ingredientModel from '../models/ingredientModel';
import toppingModel from '../models/toppingModel';
import { BadRequestError } from '../utils/errors';

class ProductService {
  async create(data: ProductInput) {
    const { ten, maDanhMuc, luaChonSize, toppingCoTheThem } = data;

    // Check if product exists
    const existingProduct = await productModel.findOne({ ten });
    if (existingProduct) {
      throw new BadRequestError('Sản phẩm đã tồn tại');
    }

    // Validate maDanhMuc
    const category = await categoryModel.findById(maDanhMuc);
    if (!category) {
      throw new BadRequestError('Danh mục không tồn tại');
    }

    // Validate thanhPhan in luaChonSize
    for (const size of luaChonSize) {
      for (const item of size.thanhPhan) {
        const ingredient = await ingredientModel.findById(item.maNguyenLieu);
        if (!ingredient) {
          throw new BadRequestError(`Nguyên liệu ${item.maNguyenLieu} không tồn tại`);
        }
      }
    }

    // Validate toppingCoTheThem
    if (toppingCoTheThem) {
      for (const toppingId of toppingCoTheThem) {
        const topping = await toppingModel.findById(toppingId);
        if (!topping) {
          throw new BadRequestError(`Topping ${toppingId} không tồn tại`);
        }
      }
    }

    // Create product
    const product = await productModel.create({
      ...data,
      ngayCapNhat: new Date(),
    });

    return product;
  }

  async getAll(categoryId?: string) {
    const filter: any = {};

    // Lọc theo category nếu có truyền query
    if (categoryId) {
      filter.maDanhMuc = categoryId;
    }

    return await productModel
      .find(filter)
      .populate('maDanhMuc', 'ten')
      .populate('luaChonSize.thanhPhan.maNguyenLieu', 'ten')
      .populate('toppingCoTheThem', 'ten gia')
      .sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const product = await productModel
      .findById(id)
      .populate('maDanhMuc', 'ten')
      .populate('luaChonSize.thanhPhan.maNguyenLieu', 'ten')
      .populate('toppingCoTheThem', 'ten gia');
    if (!product) {
      throw new BadRequestError('Sản phẩm không tồn tại');
    }
    return product;
  }

  async getByCategoryId(maDanhMuc: string) {
  const products = await productModel
    .find({ maDanhMuc, hoatDong: true })
    .populate('maDanhMuc', 'ten')
    .populate('luaChonSize.thanhPhan.maNguyenLieu', 'ten')
    .populate('toppingCoTheThem', 'ten gia')
    .sort({ ngayTao: -1 });

  return products;
}

  async update(id: string, data: Partial<ProductInput>) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new BadRequestError('Sản phẩm không tồn tại');
    }

    // Validate maDanhMuc if provided
    if (data.maDanhMuc) {
      const category = await categoryModel.findById(data.maDanhMuc);
      if (!category) {
        throw new BadRequestError('Danh mục không tồn tại');
      }
    }

    // Validate thanhPhan in luaChonSize if provided
    if (data.luaChonSize) {
      for (const size of data.luaChonSize) {
        for (const item of size.thanhPhan) {
          const ingredient = await ingredientModel.findById(item.maNguyenLieu);
          if (!ingredient) {
            throw new BadRequestError(`Nguyên liệu ${item.maNguyenLieu} không tồn tại`);
          }
        }
      }
    }

    // Validate toppingCoTheThem if provided
    if (data.toppingCoTheThem) {
      for (const toppingId of data.toppingCoTheThem) {
        const topping = await toppingModel.findById(toppingId);
        if (!topping) {
          throw new BadRequestError(`Topping ${toppingId} không tồn tại`);
        }
      }
    }

    // Check if new ten is unique
    if (data.ten && data.ten !== product.ten) {
      const existingProduct = await productModel.findOne({ ten: data.ten });
      if (existingProduct) {
        throw new BadRequestError('Tên sản phẩm đã tồn tại');
      }
    }

    const updatedProduct = await productModel
      .findByIdAndUpdate(id, { ...data, ngayCapNhat: new Date() }, { new: true })
      .populate('maDanhMuc', 'ten')
      .populate('luaChonSize.thanhPhan.maNguyenLieu', 'ten')
      .populate('toppingCoTheThem', 'ten gia');
    return updatedProduct;
  }

  async delete(id: string) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new BadRequestError('Sản phẩm không tồn tại');
    }

    await productModel.findByIdAndDelete(id);
    return { message: 'Xóa sản phẩm thành công' };
  }
}

export default new ProductService();
