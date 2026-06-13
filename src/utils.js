import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "coderSecret",
    {
      expiresIn: "1h",
    },
  );
};

export const generatePasswordResetToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET || "coderSecret",
    {
      expiresIn: "1h",
    },
  );
};

export const verifyPasswordResetToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "coderSecret");
};
