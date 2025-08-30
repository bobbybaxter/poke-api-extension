import bcrypt from 'bcrypt';
import express, { NextFunction, Request, Response } from 'express';
import UserController from '../controllers/user/UserController';
import { setRefreshCookie } from '../helpers/set-refresh-cookie';
import { AppDataSource } from '../mysql/data-source';
import { User } from '../mysql/entity/user';
import { tokenService } from '../services/TokenService';
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

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userController.findUserByUsernameOrEmail(email || username);
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await userController.createUser({ username, email, passwordHash });
    const access = tokenService.signAccessToken(user);
    const refresh = await tokenService.issueRefreshToken(user.id);
    setRefreshCookie(res, refresh);

    return res.status(201).json({
      access_token: access,
      token_type: 'Bearer',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    const user = await userController.findUserByUsernameOrEmail(identifier);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await userController.verifyPassword(user, password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const access = tokenService.signAccessToken(user);
    const refresh = await tokenService.issueRefreshToken(user.id);
    setRefreshCookie(res, refresh);

    return res.json({
      access_token: access,
      token_type: 'Bearer',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const raw = req.cookies?.refresh_token;
    if (!raw) return res.status(401).json({ message: 'Missing refresh token' });

    const userId = await tokenService.userIdFromRefresh(raw);
    if (!userId) return res.status(401).json({ message: 'Invalid refresh token' });

    const newRaw = await tokenService.rotateRefreshToken(raw, userId);
    if (!newRaw) return res.status(401).json({ message: 'Invalid refresh token' });

    setRefreshCookie(res, newRaw);
    const access = tokenService.signAccessToken({ id: userId, username: 'n/a' }); // username is not needed for refresh
    return res.json({ access_token: access, token_type: 'Bearer' });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh failed' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const raw = req.cookies?.refresh_token;
    if (raw) await tokenService.revokeRefreshToken(raw);
    res.clearCookie('refresh_token', { path: '/refresh' });
    return res.json({ message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed' });
  }
});

export default router;
