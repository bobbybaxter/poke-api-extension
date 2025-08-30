import { Repository } from 'typeorm';
import { User } from '../../../mysql/entity/user';

export async function deleteUser(userRepository: Repository<User>, id: string) {
  return await userRepository.delete(id);
}
