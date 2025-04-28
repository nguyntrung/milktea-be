import productModel, { ProductInput } from '../models/productModel';
import categoryModel from '../models/categoryModel';
import ingredientModel from '../models/ingredientModel';
import toppingModel from '../models/toppingModel';
import { BadRequestError } from '../utils/errors';

class ProductService {
  async create(data: ProductInput) {
    const { ten, maDanhMuc, nguyenLieu, toppingCoSan, toppingCoTheThem } = data;

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

    // Validate nguyenLieu
    for (const item of nguyenLieu) {
      const ingredient = await ingredientModel.findById(item.maNguyenLieu);
      if (!ingredient) {
        throw new BadRequestError(`Nguyên liệu ${item.maNguyenLieu} không tồn tại`);
      }
    }

    // Validate toppingCoSan and toppingCoTheThem
    if (toppingCoSan) {
      for (const toppingId of toppingCoSan) {
        const topping = await toppingModel.findById(toppingId);
        if (!topping) {
          throw new BadRequestError(`Topping ${toppingId} không tồn tại`);
        }
      }
    }
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

  async getAll() {
    return await productModel
      .find()
      .populate('maDanhMuc', 'ten')
      .populate('nguyenLieu.maNguyenLieu', 'ten')
      .populate('toppingCoSan', 'ten gia')
      .populate('toppingCoTheThem', 'ten gia')
      .sort({ ngayTao: -1 });
  }

  async getById(id: string) {
    const product = await productModel
      .findById(id)
      .populate('maDanhMuc', 'ten')
      .populate('nguyenLieu.maNguyenLieu', 'ten')
      .populate('toppingCoSan', 'ten gia')
      .populate('toppingCoTheThem', 'ten gia');
    if (!product) {
      throw new BadRequestError('Sản phẩm không tồn tại');
    }
    return product;
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

    // Validate nguyenLieu if provided
    if (data.nguyenLieu) {
      for (const item of data.nguyenLieu) {
        const ingredient = await ingredientModel.findById(item.maNguyenLieu);
        if (!ingredient) {
          throw new BadRequestError(`Nguyên liệu ${item.maNguyenLieu} không tồn tại`);
        }
      }
    }

    // Validate toppingCoSan and toppingCoTheThem if provided
    if (data.toppingCoSan) {
      for (const toppingId of data.toppingCoSan) {
        const topping = await toppingModel.findById(toppingId);
        if (!topping) {
          throw new BadRequestError(`Topping ${toppingId} không tồn tại`);
        }
      }
    }
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
      .populate('nguyenLieu.maNguyenLieu', 'ten')
      .populate('toppingCoSan', 'ten gia')
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
