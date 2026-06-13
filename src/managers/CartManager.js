import TicketRepository from "../repositories/Ticket.repository.js";
import CartRepository from "../repositories/Cart.repository.js";
import ProductRepository from "../repositories/Product.repository.js";

export default class CartManager {
  constructor() {
    this.cartRepository = new CartRepository();
    this.productRepository = new ProductRepository();
    this.ticketRepository = new TicketRepository();
  }

  async createCart() {
    return await this.cartRepository.createCart();
  }

  async getCartById(cid) {
    return await this.cartRepository.getCartById(cid);
  }

  async addProductToCart(cid, pid) {
    const cart = await this.cartRepository.getCartByIdWithoutPopulate(cid);
    if (!cart) return null;

    const productExists = await this.productRepository.getProductById(pid);
    if (!productExists) return false;

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid,
    );

    if (productIndex === -1) {
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      cart.products[productIndex].quantity += 1;
    }

    await this.cartRepository.saveCart(cart);
    return await this.cartRepository.getCartById(cid);
  }

  async deleteProductFromCart(cid, pid) {
    const cart = await this.cartRepository.getCartByIdWithoutPopulate(cid);
    if (!cart) return null;

    const initialLength = cart.products.length;

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid,
    );

    if (cart.products.length === initialLength) {
      return false;
    }

    await this.cartRepository.saveCart(cart);
    return await this.cartRepository.getCartById(cid);
  }

  async updateCart(cid, products) {
    const cart = await this.cartRepository.getCartByIdWithoutPopulate(cid);
    if (!cart) return null;

    for (const item of products) {
      const productExists = await this.productRepository.getProductById(
        item.product,
      );

      if (!productExists) {
        throw new Error(`Product not found: ${item.product}`);
      }
    }

    cart.products = products.map((item) => ({
      product: item.product,
      quantity: Number(item.quantity),
    }));

    await this.cartRepository.saveCart(cart);
    return await this.cartRepository.getCartById(cid);
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await this.cartRepository.getCartByIdWithoutPopulate(cid);
    if (!cart) return null;

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid,
    );

    if (productIndex === -1) return false;

    cart.products[productIndex].quantity = Number(quantity);

    await this.cartRepository.saveCart(cart);
    return await this.cartRepository.getCartById(cid);
  }

  async clearCart(cid) {
    const cart = await this.cartRepository.getCartByIdWithoutPopulate(cid);
    if (!cart) return null;

    cart.products = [];
    await this.cartRepository.saveCart(cart);

    return await this.cartRepository.getCartById(cid);
  }
  async purchaseCart(cid, purchaserEmail) {
    const cart = await this.cartRepository.getCartByIdWithoutPopulate(cid);

    if (!cart) return null;

    const productsNotPurchased = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = await this.productRepository.getProductById(
        item.product.toString(),
      );

      if (!product) {
        productsNotPurchased.push(item.product);
        continue;
      }

      if (product.stock >= item.quantity) {
        const newStock = product.stock - item.quantity;

        await this.productRepository.updateProduct(product._id, {
          stock: newStock,
        });

        totalAmount += product.price * item.quantity;
      } else {
        productsNotPurchased.push(item.product);
      }
    }

    if (totalAmount === 0) {
      return {
        status: "error",
        message: "No se pudo comprar ningún producto por falta de stock",
        productsNotPurchased,
      };
    }

    const ticket = await this.ticketRepository.createTicket({
      code: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      amount: totalAmount,
      purchaser: purchaserEmail,
    });

    cart.products = cart.products.filter((item) =>
      productsNotPurchased.some(
        (notPurchasedId) =>
          notPurchasedId.toString() === item.product.toString(),
      ),
    );

    await this.cartRepository.saveCart(cart);

    return {
      status: "success",
      message: "Compra realizada correctamente",
      ticket,
      productsNotPurchased,
    };
  }
}
