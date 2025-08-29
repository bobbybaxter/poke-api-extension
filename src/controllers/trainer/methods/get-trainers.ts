import { Repository } from 'typeorm';
import { Trainer } from '../../../mysql/entity/trainer';

export async function getTrainers(trainerRepository: Repository<Trainer>) {
  return await trainerRepository.find();
}
