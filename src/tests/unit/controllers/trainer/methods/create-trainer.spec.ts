import { Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { createTrainer } from '../../../../../controllers/trainer/methods/index';
import { Trainer } from '../../../../../mysql/entity/trainer';

describe('controllers/trainer/methods/createTrainer', () => {
  let mockTrainerRepository: Repository<Trainer>;
  let mockCreate: Mock;
  let mockSave: Mock;

  beforeAll(() => {
    mockCreate = vi.fn();
    mockSave = vi.fn();

    mockTrainerRepository = {
      create: mockCreate,
      save: mockSave,
    } as unknown as Repository<Trainer>;
  });

  describe('when creating a trainer successfully', () => {
    let result: Trainer;
    const createTrainerInput = {
      name: 'Ash Ketchum',
      class: 'Trainer',
      badges: [],
      pokemon: [],
    };

    const expectedTrainer: Trainer = {
      id: 1,
      name: 'Ash Ketchum',
      class: 'Trainer',
      badges: [],
      pokemon: [],
    };

    beforeEach(async () => {
      mockCreate.mockReturnValue(expectedTrainer);
      mockSave.mockResolvedValue(expectedTrainer);

      result = await createTrainer(mockTrainerRepository, createTrainerInput);
    });

    it('should create and return the new trainer', () => {
      expect(result).toEqual(expectedTrainer);
    });

    it('should call repository.create with the input data', () => {
      expect(mockCreate).toHaveBeenCalledWith(createTrainerInput);
    });

    it('should call repository.save with the created trainer', () => {
      expect(mockSave).toHaveBeenCalledWith(expectedTrainer);
    });

    it('should call repository methods once each', () => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('when creating a trainer with partial data', () => {
    let result: Trainer;
    const partialInput = {
      name: 'Misty',
      class: 'Gym Leader',
    };

    const expectedTrainer: Trainer = {
      id: 2,
      name: 'Misty',
      class: 'Gym Leader',
      badges: [],
      pokemon: [],
    };

    beforeEach(async () => {
      mockCreate.mockReturnValue(expectedTrainer);
      mockSave.mockResolvedValue(expectedTrainer);

      result = await createTrainer(mockTrainerRepository, partialInput);
    });

    it('should create and return the trainer with partial data', () => {
      expect(result).toEqual(expectedTrainer);
    });

    it('should call repository.create with the partial input data', () => {
      expect(mockCreate).toHaveBeenCalledWith(partialInput);
    });
  });

  describe('when repository.create throws an error', () => {
    const createTrainerInput = {
      name: 'Brock',
      class: 'Breeder',
    };

    beforeEach(() => {
      mockCreate.mockImplementation(() => {
        throw new Error('Database connection failed');
      });
    });

    it('should throw the error from repository.create', async () => {
      await expect(createTrainer(mockTrainerRepository, createTrainerInput)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should not call repository.save if create fails', async () => {
      try {
        await createTrainer(mockTrainerRepository, createTrainerInput);
      } catch {
        // Expected to throw
      }
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('when repository.save throws an error', () => {
    const createTrainerInput = {
      name: 'Gary Oak',
      class: 'Trainer',
    };

    const createdTrainer: Trainer = {
      id: 3,
      name: 'Gary Oak',
      class: 'Trainer',
      badges: [],
      pokemon: [],
    };

    beforeEach(() => {
      mockCreate.mockReturnValue(createdTrainer);
      mockSave.mockRejectedValue(new Error('Save operation failed'));
    });

    it('should throw the error from repository.save', async () => {
      await expect(createTrainer(mockTrainerRepository, createTrainerInput)).rejects.toThrow('Save operation failed');
    });

    it('should call repository.create before failing on save', async () => {
      try {
        await createTrainer(mockTrainerRepository, createTrainerInput);
      } catch {
        // Expected to throw
      }
      expect(mockCreate).toHaveBeenCalledWith(createTrainerInput);
    });
  });
});
