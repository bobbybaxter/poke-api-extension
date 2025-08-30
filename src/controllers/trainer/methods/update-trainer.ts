import { Repository } from 'typeorm';
import { Trainer } from '../../../mysql/entity/trainer';

export async function updateTrainer(trainerRepository: Repository<Trainer>, id: number, trainer: Partial<Trainer>) {
  await trainerRepository.update(id, trainer);
  return await trainerRepository.findOne({ where: { id } });
}
