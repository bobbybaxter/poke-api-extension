import { Repository } from 'typeorm';
import { User } from '../../../mysql/entity/user';

export async function findUserByUsernameOrEmail(userRepository: Repository<User>, identifier: string) {
  return await userRepository.findOne({ where: [{ username: identifier }, { email: identifier }] });
}
