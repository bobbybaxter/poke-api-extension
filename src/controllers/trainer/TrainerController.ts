import { Repository } from 'typeorm';
import { Trainer } from '../../mysql/entity/trainer';
import * as methods from './methods/index';

export default class TrainerController {
  constructor(private trainerRepository: Repository<Trainer>) {}

  async createTrainer(createTrainerInput: Partial<Trainer>) {
    return await methods.createTrainer(this.trainerRepository, createTrainerInput);
  }

  async deleteTrainer(id: number) {
    return await methods.deleteTrainer(this.trainerRepository, id);
  }

  async getTrainer(id: number) {
    return await methods.getTrainer(this.trainerRepository, id);
  }

  async getTrainers() {
    return await methods.getTrainers(this.trainerRepository);
  }

  async updateTrainer(id: number, trainer: Partial<Trainer>) {
    return await methods.updateTrainer(this.trainerRepository, id, trainer);
  }
}
