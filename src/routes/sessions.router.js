import { Router } from "express";
import passport from "passport";
import { UserModel } from "../models/User.model.js";
import { Cart } from "../models/Cart.model.js";
import { createHash, isValidPassword, generateToken } from "../utils.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
      });
    }

    const userExists = await UserModel.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "El usuario ya existe",
      });
    }

    const newCart = await Cart.create({ products: [] });

    const newUser = await UserModel.create({
      first_name,
      last_name,
      email,
      age,
      password: createHash(password),
      cart: newCart._id,
      role: "user",
    });

    res.status(201).json({
      status: "success",
      message: "Usuario registrado correctamente",
      payload: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        age: newUser.age,
        cart: newUser.cart,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al registrar usuario",
      detail: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son obligatorios",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    const validPassword = isValidPassword(user, password);

    if (!validPassword) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    const token = generateToken(user);

    res
      .cookie("jwtCookieToken", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      })
      .json({
        status: "success",
        message: "Login correcto",
        token,
      });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al iniciar sesión",
      detail: error.message,
    });
  }
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    res.json({
      status: "success",
      payload: req.user,
    });
  },
);

export default router;
