import express, { Request, Response } from 'express';
import TrainerController from '../controllers/trainer/TrainerController';
import { AppDataSource } from '../mysql/data-source';
import { Trainer } from '../mysql/entity/trainer';

const router = express.Router();
const trainerRepository = AppDataSource.getRepository(Trainer);
const trainerController = new TrainerController(trainerRepository);

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const trainer = await trainerController.deleteTrainer(parseInt(id));
  res.json(trainer);
});

router.get('/', async (req: Request, res: Response) => {
  const trainers = await trainerController.getTrainers();
  res.json(trainers);
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const trainer = await trainerController.getTrainer(parseInt(id));
  res.json(trainer);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, class: classType } = req.body;
  const trainer = await trainerController.updateTrainer(parseInt(id), {
    name,
    class: classType,
  });
  res.json(trainer);
});

router.post('/', async (req: Request, res: Response) => {
  const { name, class: classType } = req.body;
  const trainer = await trainerController.createTrainer({ name, class: classType });
  res.json(trainer);
});

export default router;
