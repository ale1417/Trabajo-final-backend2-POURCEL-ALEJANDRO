import { Cart } from "../models/Cart.model.js";

export default class CartDAO {
  async create() {
    return await Cart.create({ products: [] });
  }

  async getById(id) {
    return await Cart.findById(id).populate("products.product").lean();
  }

  async getByIdWithoutPopulate(id) {
    return await Cart.findById(id);
  }

  async save(cart) {
    return await cart.save();
  }
}
