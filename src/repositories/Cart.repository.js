import CartDAO from "../dao/Cart.dao.js";

export default class CartRepository {
  constructor() {
    this.dao = new CartDAO();
  }

  async createCart() {
    return await this.dao.create();
  }

  async getCartById(id) {
    return await this.dao.getById(id);
  }

  async getCartByIdWithoutPopulate(id) {
    return await this.dao.getByIdWithoutPopulate(id);
  }

  async saveCart(cart) {
    return await this.dao.save(cart);
  }
}
