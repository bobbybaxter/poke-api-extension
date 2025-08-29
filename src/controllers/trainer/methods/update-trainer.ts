import { Repository } from 'typeorm';
import { Trainer } from '../../../mysql/entity/trainer';

export async function updateTrainer(trainerRepository: Repository<Trainer>, id: number, trainer: Partial<Trainer>) {
  const updatedTrainer = trainerRepository.create({ ...trainer, id });
  return await trainerRepository.save(updatedTrainer);
}
