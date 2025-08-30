import { User } from 'src/mysql/entity/user';
import { Repository } from 'typeorm';
import * as methods from './methods/index';

export default class UserController {
  constructor(private userRepository: Repository<User>) {}

  async createUser(createUserInput: Partial<User>) {
    return await methods.createUser(this.userRepository, createUserInput);
  }

  async deleteUser(id: string) {
    return await methods.deleteUser(this.userRepository, id);
  }

  async findUserById(id: string) {
    return await methods.findUserById(this.userRepository, id);
  }

  async findUserByUsernameOrEmail(identifier: string) {
    return await methods.findUserByUsernameOrEmail(this.userRepository, identifier);
  }

  async getUserInfo(id: string) {
    return await methods.getUserInfo(this.userRepository, id);
  }

  async updateUser(id: string, updateUserInput: Partial<User>) {
    return await methods.updateUser(this.userRepository, id, updateUserInput);
  }

  async verifyPassword(user: User, password: string) {
    return await methods.verifyPassword(user, password);
  }
}
