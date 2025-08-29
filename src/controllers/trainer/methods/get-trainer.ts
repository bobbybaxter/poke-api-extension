import { Repository } from 'typeorm';
import { Trainer } from '../../../mysql/entity/trainer';

export async function getTrainer(trainerRepository: Repository<Trainer>, id: number) {
  return await trainerRepository.findOne({ where: { id } });
}
