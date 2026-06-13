import { UserModel } from "../models/User.model.js";

export default class UserDAO {
  async getByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async getById(id) {
    return await UserModel.findById(id).lean();
  }

  async create(userData) {
    return await UserModel.create(userData);
  }

  async updatePassword(id, newPassword) {
    return await UserModel.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true },
    );
  }
}
