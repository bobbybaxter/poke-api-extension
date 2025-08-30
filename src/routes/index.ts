import bcrypt from 'bcrypt';
import express, { NextFunction, Request, Response } from 'express';
import { AppError } from 'src/middleware/error-handler';
import UserController from '../controllers/user/UserController';
import { setRefreshCookie } from '../helpers/set-refresh-cookie';
import { validateBody } from '../middleware/validation';
import { AppDataSource } from '../mysql/data-source';
import { User } from '../mysql/entity/user';
import { tokenService } from '../services/TokenService';
import { loginBodySchema, registerBodySchema } from '../validators/auth.schemas';
import pokemonRouter from './pokemon';
import trainerRouter from './trainer';
import userRouter from './user';

const router = express.Router();
const userController = new UserController(AppDataSource.getRepository(User));
const saltRounds = 10;

router.use('/pokemon', pokemonRouter);
router.use('/trainer', trainerRouter);
router.use('/user', userRouter);

router.get('/', function (req: Request, res: Response, next: NextFunction) {
  res.send('');
});

router.post(
  '/register',
  validateBody(registerBodySchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;

      const existingUser = await userController.findUserByUsernameOrEmail(email || username);
      if (existingUser) return res.status(409).json({ message: 'User already exists' });

      const passwordHash = await bcrypt.hash(password, saltRounds);
      const user = await userController.createUser({ username, email, passwordHash });
      const access = tokenService.signAccessToken(user);
      const refresh = await tokenService.issueRefreshToken(user.id);
      setRefreshCookie(res, refresh);

      res.status(201).json({
        access_token: access,
        token_type: 'Bearer',
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      const appError = new Error('Registration failed') as AppError;
      appError.statusCode = 500;
      next(appError);
    }
  },
);

router.post('/login', validateBody(loginBodySchema), async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;

    const user = await userController.findUserByUsernameOrEmail(identifier);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await userController.verifyPassword(user, password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const access = tokenService.signAccessToken(user);
    const refresh = await tokenService.issueRefreshToken(user.id);
    setRefreshCookie(res, refresh);

    res.json({
      access_token: access,
      token_type: 'Bearer',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    const appError = new Error('Login failed') as AppError;
    appError.statusCode = 500;
    next(appError);
  }
});

router.post('/refresh', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.cookies?.refresh_token;
    if (!raw) return res.status(401).json({ message: 'Missing refresh token' });

    const userId = await tokenService.userIdFromRefresh(raw);
    if (!userId) return res.status(401).json({ message: 'Invalid refresh token' });

    const newRaw = await tokenService.rotateRefreshToken(raw, userId);
    if (!newRaw) return res.status(401).json({ message: 'Invalid refresh token' });

    setRefreshCookie(res, newRaw);
    const access = tokenService.signAccessToken({ id: userId, username: 'n/a' }); // username is not needed for refresh
    res.json({ access_token: access, token_type: 'Bearer' });
  } catch (error) {
    const appError = new Error('Refresh failed') as AppError;
    appError.statusCode = 401;
    next(appError);
  }
});

router.post('/logout', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const raw = req.cookies?.refresh_token;
    if (raw) await tokenService.revokeRefreshToken(raw);
    res.clearCookie('refresh_token', { path: '/refresh' });
    res.json({ message: 'Logged out' });
  } catch (error) {
    const appError = new Error('Logout failed') as AppError;
    appError.statusCode = 500;
    next(appError);
  }
});

export default router;
