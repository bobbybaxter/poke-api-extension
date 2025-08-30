import { Repository } from 'typeorm';
import { User } from '../../../mysql/entity/user';

export async function findUserById(userRepository: Repository<User>, id: string) {
  return await userRepository.findOne({ where: { id } });
}
