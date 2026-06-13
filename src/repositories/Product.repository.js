import ProductDAO from "../dao/Product.dao.js";

export default class ProductRepository {
  constructor() {
    this.dao = new ProductDAO();
  }

  async getProducts(filters, options) {
    return await this.dao.getPaginated(filters, options);
  }

  async getAllProducts() {
    return await this.dao.getAll();
  }

  async getProductById(id) {
    return await this.dao.getById(id);
  }

  async getProductByCode(code) {
    return await this.dao.getByCode(code);
  }

  async createProduct(productData) {
    return await this.dao.create(productData);
  }

  async updateProduct(id, productData) {
    return await this.dao.update(id, productData);
  }

  async deleteProduct(id) {
    return await this.dao.delete(id);
  }
}
