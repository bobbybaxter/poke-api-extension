import { NextFunction, Request, Response } from 'express';
import UserController from '../controllers/user/UserController';
import { AppDataSource } from '../mysql/data-source';
import { User } from '../mysql/entity/user';
import { tokenService } from '../services/TokenService';

const userController = new UserController(AppDataSource.getRepository(User));

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = (req.headers['authorization'] as string) || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    const payload = tokenService.verifyAccessToken(token);
    const user = await userController.findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
