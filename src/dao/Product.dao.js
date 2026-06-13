import { Product } from "../models/Product.model.js";

export default class ProductDAO {
  async getPaginated(filters, options) {
    return await Product.paginate(filters, options);
  }

  async getAll() {
    return await Product.find().lean();
  }

  async getById(id) {
    return await Product.findById(id).lean();
  }

  async getByCode(code) {
    return await Product.findOne({ code });
  }

  async create(productData) {
    return await Product.create(productData);
  }

  async update(id, productData) {
    return await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }
}
