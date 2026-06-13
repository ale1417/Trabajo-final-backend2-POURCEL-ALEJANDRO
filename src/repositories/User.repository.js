import UserDAO from "../dao/User.dao.js";

export default class UserRepository {
  constructor() {
    this.dao = new UserDAO();
  }

  async getUserByEmail(email) {
    return await this.dao.getByEmail(email);
  }

  async getUserById(id) {
    return await this.dao.getById(id);
  }

  async createUser(userData) {
    return await this.dao.create(userData);
  }

  async updatePassword(id, newPassword) {
    return await this.dao.updatePassword(id, newPassword);
  }
}
