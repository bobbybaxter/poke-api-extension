import { Repository } from 'typeorm';
import { User } from '../../../mysql/entity/user';

export async function createUser(userRepository: Repository<User>, createUserInput: Partial<User>) {
  const newUser = userRepository.create(createUserInput);

  return await userRepository.save(newUser);
}
