import passport from "passport";
import { authorization } from "../middlewares/authorization.middleware.js";
import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const cartManager = new CartManager();

router.post("/", async (req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({
      error: "Internal error",
      detail: err.message,
    });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);

    if (!cart) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({
      error: "Internal error",
      detail: err.message,
    });
  }
});

router.post(
  "/:cid/product/:pid",
  passport.authenticate("jwt", { session: false }),
  authorization("user"),
  async (req, res) => {
    try {
      const result = await cartManager.addProductToCart(
        req.params.cid,
        req.params.pid,
      );

      if (result === null) {
        return res.status(404).json({
          error: "Cart not found",
        });
      }

      if (result === false) {
        return res.status(404).json({
          error: "Product not found",
        });
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({
        error: "Internal error",
        detail: err.message,
      });
    }
  },
);
router.post(
  "/:cid/purchase",
  passport.authenticate("jwt", { session: false }),
  authorization("user"),
  async (req, res) => {
    try {
      const result = await cartManager.purchaseCart(
        req.params.cid,
        req.user.email,
      );

      if (!result) {
        return res.status(404).json({
          status: "error",
          message: "Cart not found",
        });
      }

      if (result.status === "error") {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Error al finalizar la compra",
        detail: err.message,
      });
    }
  },
);
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const result = await cartManager.deleteProductFromCart(
      req.params.cid,
      req.params.pid,
    );

    if (result === null) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }

    if (result === false) {
      return res.status(404).json({
        error: "Product not found in cart",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Internal error",
      detail: err.message,
    });
  }
});

router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        error: "Bad request",
        detail: "products must be an array",
      });
    }

    const result = await cartManager.updateCart(req.params.cid, products);

    if (!result) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: "Bad request",
      detail: err.message,
    });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || Number(quantity) < 1) {
      return res.status(400).json({
        error: "Bad request",
        detail: "quantity must be a number greater than 0",
      });
    }

    const result = await cartManager.updateProductQuantity(
      req.params.cid,
      req.params.pid,
      quantity,
    );

    if (result === null) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }

    if (result === false) {
      return res.status(404).json({
        error: "Product not found in cart",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({
      error: "Bad request",
      detail: err.message,
    });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const result = await cartManager.clearCart(req.params.cid);

    if (!result) {
      return res.status(404).json({
        error: "Cart not found",
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Internal error",
      detail: err.message,
    });
  }
});

export default router;
