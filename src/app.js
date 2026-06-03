import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "passport";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import sessionsRouter from "./routes/sessions.router.js";

import ProductManager from "./managers/ProductManager.js";
import CartManager from "./managers/CartManager.js";
import { initializePassport } from "./config/passport.config.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = 8080;

const productManager = new ProductManager();
const cartManager = new CartManager();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve("src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve("src/public")));

initializePassport();
app.use(passport.initialize());

app.set("io", io);
app.set("productManager", productManager);
app.set("cartManager", cartManager);

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);

io.on("connection", async (socket) => {
  try {
    const products = await productManager.getAllProductsRaw();
    socket.emit("productsUpdated", products);
  } catch (error) {
    console.log("Error al cargar productos por websocket:", error.message);
  }

  socket.on("createProduct", async (productData) => {
    try {
      await productManager.addProduct(productData);
      const updatedProducts = await productManager.getAllProductsRaw();
      io.emit("productsUpdated", updatedProducts);

      socket.emit("operationResult", {
        success: true,
        message: "Producto creado correctamente",
      });
    } catch (error) {
      socket.emit("operationResult", {
        success: false,
        message: error.message,
      });
    }
  });

  socket.on("deleteProduct", async (pid) => {
    try {
      const deleted = await productManager.deleteProduct(pid);

      if (!deleted) {
        socket.emit("operationResult", {
          success: false,
          message: "Product not found",
        });
        return;
      }

      const updatedProducts = await productManager.getAllProductsRaw();
      io.emit("productsUpdated", updatedProducts);

      socket.emit("operationResult", {
        success: true,
        message: "Producto eliminado correctamente",
      });
    } catch (error) {
      socket.emit("operationResult", {
        success: false,
        message: error.message,
      });
    }
  });
});

const startServer = async () => {
  try {
    console.log("Intentando conectar a Mongo...");

    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Mongo conectado");

    httpServer.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar con Mongo:", error.message);
  }
};

startServer();
