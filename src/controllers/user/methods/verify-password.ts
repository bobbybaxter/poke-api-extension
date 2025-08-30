import bcrypt from 'bcrypt';
import { User } from '../../../mysql/entity/user';

export async function verifyPassword(user: User, password: string) {
  return await bcrypt.compare(password, user.passwordHash);
}
