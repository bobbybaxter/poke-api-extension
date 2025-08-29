import { Trainer } from 'src/mysql/entity/trainer';
import { Repository } from 'typeorm';

export async function createTrainer(trainerRepository: Repository<Trainer>, createTrainerInput: Partial<Trainer>) {
  const newTrainer = await trainerRepository.create(createTrainerInput);

  return await trainerRepository.save(newTrainer);
}
