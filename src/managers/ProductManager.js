import ProductRepository from "../repositories/Product.repository.js";

export default class ProductManager {
  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getProducts({ limit = 10, page = 1, sort, query } = {}) {
    const filters = {};

    if (query) {
      if (query === "true" || query === "false") {
        filters.status = query === "true";
      } else {
        filters.category = query;
      }
    }

    const options = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      lean: true,
    };

    if (sort === "asc") {
      options.sort = { price: 1 };
    } else if (sort === "desc") {
      options.sort = { price: -1 };
    }

    const result = await this.productRepository.getProducts(filters, options);

    return {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `?page=${result.prevPage}&limit=${options.limit}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`
        : null,
      nextLink: result.hasNextPage
        ? `?page=${result.nextPage}&limit=${options.limit}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`
        : null,
    };
  }

  async getAllProductsRaw() {
    return await this.productRepository.getAllProducts();
  }

  async getProductById(id) {
    return await this.productRepository.getProductById(id);
  }

  async addProduct(productData) {
    const required = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
      "thumbnails",
    ];

    for (const field of required) {
      if (productData[field] === undefined) {
        throw new Error(`Missing field: ${field}`);
      }
    }

    if (!Array.isArray(productData.thumbnails)) {
      throw new Error("thumbnails must be an array of strings");
    }

    const codeExists = await this.productRepository.getProductByCode(
      productData.code,
    );

    if (codeExists) {
      throw new Error("code must be unique");
    }

    const newProduct = await this.productRepository.createProduct({
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: Number(productData.price),
      status:
        productData.status === "false" ? false : Boolean(productData.status),
      stock: Number(productData.stock),
      category: productData.category,
      thumbnails: productData.thumbnails,
    });

    return newProduct;
  }

  async updateProduct(id, updates) {
    const { _id, id: ignoredId, ...safeUpdates } = updates;

    if (safeUpdates.price !== undefined) {
      safeUpdates.price = Number(safeUpdates.price);
    }

    if (safeUpdates.stock !== undefined) {
      safeUpdates.stock = Number(safeUpdates.stock);
    }

    if (safeUpdates.status !== undefined) {
      safeUpdates.status =
        safeUpdates.status === "false" ? false : Boolean(safeUpdates.status);
    }

    return await this.productRepository.updateProduct(id, safeUpdates);
  }

  async deleteProduct(id) {
    const deleted = await this.productRepository.deleteProduct(id);
    return !!deleted;
  }
}
