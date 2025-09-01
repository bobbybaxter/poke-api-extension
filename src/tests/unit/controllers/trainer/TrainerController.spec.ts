import { Repository } from 'typeorm';
import { vi } from 'vitest';
import TrainerController from '../../../../controllers/trainer/TrainerController';
import { Trainer } from '../../../../mysql/entity/trainer';
import { mockModules } from '../../../helpers/mock-modules';

describe('controllers/trainer/TrainerController', () => {
  let trainerRepository: Repository<Trainer>,
    MockRepository: new () => Repository<Trainer>,
    mockMethods: Record<string, unknown>,
    trainerController: TrainerController;

  beforeAll(async () => {
    mockMethods = {
      createTrainer: vi.fn(),
      deleteTrainer: vi.fn(),
      getTrainer: vi.fn(),
      getTrainers: vi.fn(),
      updateTrainer: vi.fn(),
    };

    const mockRepository = {
      Repository: vi.fn().mockImplementation(() => ({
        save: vi.fn(),
        find: vi.fn(),
        findOne: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      })),
    };

    [MockRepository] = await mockModules([
      ['typeorm', mockRepository],
      ['src/controllers/trainer/methods/index', mockMethods],
    ]);

    trainerRepository = new MockRepository();

    const { default: TrainerController } = await import('../../../../controllers/trainer/TrainerController');
    trainerController = new TrainerController(trainerRepository);
  });

  describe('createTrainer', () => {
    it('should call createTrainer method', async () => {
      const createTrainerInput = { name: 'Ash Ketchum', age: 10 };
      await trainerController.createTrainer(createTrainerInput);
      expect(mockMethods.createTrainer).toHaveBeenCalledWith(trainerRepository, createTrainerInput);
    });
  });

  describe('deleteTrainer', () => {
    it('should call deleteTrainer method', async () => {
      const trainerId = 1;
      await trainerController.deleteTrainer(trainerId);
      expect(mockMethods.deleteTrainer).toHaveBeenCalledWith(trainerRepository, trainerId);
    });
  });

  describe('getTrainer', () => {
    it('should call getTrainer method', async () => {
      const trainerId = 1;
      await trainerController.getTrainer(trainerId);
      expect(mockMethods.getTrainer).toHaveBeenCalledWith(trainerRepository, trainerId);
    });
  });

  describe('getTrainers', () => {
    it('should call getTrainers method', async () => {
      await trainerController.getTrainers();
      expect(mockMethods.getTrainers).toHaveBeenCalledWith(trainerRepository);
    });
  });

  describe('updateTrainer', () => {
    it('should call updateTrainer method', async () => {
      const trainerId = 1;
      const updateTrainerInput = { name: 'Gary Oak', age: 11 };
      await trainerController.updateTrainer(trainerId, updateTrainerInput);
      expect(mockMethods.updateTrainer).toHaveBeenCalledWith(trainerRepository, trainerId, updateTrainerInput);
    });
  });
});
