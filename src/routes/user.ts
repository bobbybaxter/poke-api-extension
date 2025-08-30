import express, { NextFunction, Request, Response } from 'express';
import UserController from '../controllers/user/UserController';
import { auth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validation';
import { AppDataSource } from '../mysql/data-source';
import { User } from '../mysql/entity/user';
import { userIdParamsSchema, userUpdateBodySchema } from '../validators/user.schemas';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userController = new UserController(userRepository);

router.delete(
  '/:id',
  auth,
  validateParams(userIdParamsSchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userController.deleteUser(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  '/:id',
  auth,
  validateParams(userIdParamsSchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userController.getUserInfo(id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:id',
  auth,
  validateParams(userIdParamsSchema),
  validateBody(userUpdateBodySchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { username, email } = req.body;
      const user = await userController.updateUser(id, {
        username,
        email,
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
