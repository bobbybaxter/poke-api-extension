import express, { NextFunction, Request, Response } from 'express';
import { AppError } from 'src/middleware/error-handler';
import TrainerController from '../controllers/trainer/TrainerController';
import { validateBody, validateParams } from '../middleware/validation';
import { AppDataSource } from '../mysql/data-source';
import { Trainer } from '../mysql/entity/trainer';
import { trainerCreateBodySchema, trainerIdParamsSchema, trainerUpdateBodySchema } from '../validators/trainer.schemas';

const router = express.Router();
const trainerRepository = AppDataSource.getRepository(Trainer);
const trainerController = new TrainerController(trainerRepository);

router.delete(
  '/:id',
  validateParams(trainerIdParamsSchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trainer = await trainerController.deleteTrainer(parseInt(id));
      res.json(trainer);
    } catch (error) {
      const appError = new Error('Delete trainer failed') as AppError;
      appError.statusCode = 500;
      next(appError);
    }
  },
);

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const trainers = await trainerController.getTrainers();
    res.json(trainers);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:id',
  validateParams(trainerIdParamsSchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trainer = await trainerController.getTrainer(parseInt(id));
      if (!trainer) {
        const appError = new Error('Trainer not found') as AppError;
        appError.statusCode = 404;
        next(appError);
      }
      res.json(trainer);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  '/:id',
  validateParams(trainerIdParamsSchema),
  validateBody(trainerUpdateBodySchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, class: classType } = req.body;
      const trainer = await trainerController.getTrainer(parseInt(id));
      if (!trainer) {
        const appError = new Error('Trainer not found') as AppError;
        appError.statusCode = 404;
        next(appError);
      }

      const updatedTrainer = await trainerController.updateTrainer(parseInt(id), {
        name,
        class: classType,
      });
      res.json(updatedTrainer);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  '/',
  validateBody(trainerCreateBodySchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { name, class: classType } = req.body;
      const trainer = await trainerController.createTrainer({ name, class: classType });
      res.json(trainer);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
