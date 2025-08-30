import express, { Request, Response } from 'express';
import UserController from '../controllers/user/UserController';
import { auth } from '../middleware/auth';
import { AppDataSource } from '../mysql/data-source';
import { User } from '../mysql/entity/user';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userController = new UserController(userRepository);

router.delete('/:id', auth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userController.deleteUser(id);
  res.json(user);
});

router.get('/:id', auth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userController.getUserInfo(id);
  res.json(user);
});

router.patch('/:id', auth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const user = await userController.updateUser(id, {
    username,
    email,
  });
  res.json(user);
});

export default router;
