import { Repository } from 'typeorm';
import { User } from '../../../mysql/entity/user';

export async function updateUser(userRepository: Repository<User>, id: string, updateUserInput: Partial<User>) {
  return await userRepository.update(id, updateUserInput);
}
