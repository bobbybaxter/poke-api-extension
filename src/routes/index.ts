import express, { NextFunction, Request, Response } from 'express';
import pokemonRouter from './pokemon';

const router = express.Router();

router.use('/pokemon', pokemonRouter);

router.get('/', function (req: Request, res: Response, next: NextFunction) {
  res.send('respond with a resource');
});

export default router;
