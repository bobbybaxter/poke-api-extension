import express, { NextFunction, Request, Response } from 'express';
import pokemonRouter from './pokemon';
import trainerRouter from './trainer';

const router = express.Router();

router.use('/pokemon', pokemonRouter);
router.use('/trainer', trainerRouter);

router.get('/', function (req: Request, res: Response, next: NextFunction) {
  res.send('');
});

export default router;
