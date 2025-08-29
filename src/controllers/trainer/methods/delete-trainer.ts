import { Repository } from 'typeorm';
import { Trainer } from '../../../mysql/entity/trainer';

export async function deleteTrainer(trainerRepository: Repository<Trainer>, id: number) {
  return await trainerRepository.delete(id);
}
