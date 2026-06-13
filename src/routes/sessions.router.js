import { Router } from "express";
import passport from "passport";

import UserCurrentDTO from "../dto/UserCurrent.dto.js";
import UserRepository from "../repositories/User.repository.js";
import { Cart } from "../models/Cart.model.js";
import { transporter } from "../config/mailer.config.js";

import {
  createHash,
  isValidPassword,
  generateToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from "../utils.js";

const router = Router();
const userRepository = new UserRepository();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
      });
    }

    const userExists = await userRepository.getUserByEmail(email);

    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "El usuario ya existe",
      });
    }

    const newCart = await Cart.create({ products: [] });

    const newUser = await userRepository.createUser({
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

    const user = await userRepository.getUserByEmail(email);

    if (!user || !isValidPassword(user, password)) {
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
    const userDTO = new UserCurrentDTO(req.user);

    res.json({
      status: "success",
      payload: userDTO,
    });
  },
);

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "El email es obligatorio",
      });
    }

    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "No existe un usuario con ese email",
      });
    }

    const resetToken = generatePasswordResetToken(user);
    const resetLink = `${process.env.FRONT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `Ecommerce Backend <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Restablecer contraseña",
      html: `
        <div>
          <h2>Restablecer contraseña</h2>
          <p>Hacé click en el botón para restablecer tu contraseña.</p>
          <p>Este enlace expira en 1 hora.</p>
          <a href="${resetLink}" style="
            display:inline-block;
            padding:10px 16px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:6px;
          ">
            Restablecer contraseña
          </a>
        </div>
      `,
    });

    res.json({
      status: "success",
      message: "Correo de recuperación enviado",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al enviar correo de recuperación",
      detail: error.message,
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        status: "error",
        message: "La nueva contraseña es obligatoria",
      });
    }

    const decoded = verifyPasswordResetToken(token);
    const user = await userRepository.getUserByEmail(decoded.email);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    if (isValidPassword(user, newPassword)) {
      return res.status(400).json({
        status: "error",
        message: "No podés usar la misma contraseña anterior",
      });
    }

    const hashedPassword = createHash(newPassword);

    await userRepository.updatePassword(user._id, hashedPassword);

    res.json({
      status: "success",
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Token inválido o expirado",
      detail: error.message,
    });
  }
});

export default router;
