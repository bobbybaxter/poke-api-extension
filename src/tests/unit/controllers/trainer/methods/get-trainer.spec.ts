import { Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { getTrainer } from '../../../../../controllers/trainer/methods/index';
import { Trainer } from '../../../../../mysql/entity/trainer';

describe('controllers/trainer/methods/getTrainer', () => {
  let mockTrainerRepository: Repository<Trainer>;
  let mockFindOne: Mock;

  beforeAll(() => {
    mockFindOne = vi.fn();

    mockTrainerRepository = {
      findOne: mockFindOne,
    } as unknown as Repository<Trainer>;
  });

  describe('when trainer is found', () => {
    let result: Trainer | null;
    const trainerId = 1;

    const expectedTrainer: Trainer = {
      id: 1,
      name: 'Ash Ketchum',
      class: 'Trainer',
      badges: [
        {
          id: 1,
          name: 'Boulder Badge',
          description: 'Pewter City Gym Badge',
          imageUrl: 'https://example.com/boulder-badge.png',
        },
      ],
      pokemon: [
        {
          id: 25,
          name: 'pikachu',
          url: 'https://pokeapi.co/api/v2/pokemon/25/',
        },
      ],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedTrainer);

      result = await getTrainer(mockTrainerRepository, trainerId);
    });

    it('should return the trainer', () => {
      expect(result).toEqual(expectedTrainer);
    });

    it('should call repository.findOne with correct parameters', () => {
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: trainerId } });
    });

    it('should call repository.findOne once', () => {
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when trainer is not found', () => {
    let result: Trainer | null;
    const nonExistentTrainerId = 999;

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(null);

      result = await getTrainer(mockTrainerRepository, nonExistentTrainerId);
    });

    it('should return null when trainer is not found', () => {
      expect(result).toBeNull();
    });

    it('should call repository.findOne with the non-existent trainer id', () => {
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: nonExistentTrainerId } });
    });

    it('should call repository.findOne once', () => {
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when trainer has no badges or pokemon', () => {
    let result: Trainer | null;
    const trainerId = 2;

    const expectedTrainer: Trainer = {
      id: 2,
      name: 'New Trainer',
      class: 'Beginner',
      badges: [],
      pokemon: [],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedTrainer);

      result = await getTrainer(mockTrainerRepository, trainerId);
    });

    it('should return trainer with empty badges and pokemon arrays', () => {
      expect(result).toEqual(expectedTrainer);
    });

    it('should handle empty collections correctly', () => {
      expect(result?.badges).toEqual([]);
      expect(result?.pokemon).toEqual([]);
    });
  });

  describe('when repository.findOne throws an error', () => {
    const trainerId = 1;

    beforeEach(() => {
      mockFindOne.mockRejectedValue(new Error('Database connection failed'));
    });

    it('should throw the error from repository.findOne', async () => {
      await expect(getTrainer(mockTrainerRepository, trainerId)).rejects.toThrow('Database connection failed');
    });

    it('should call repository.findOne with the trainer id before failing', async () => {
      try {
        await getTrainer(mockTrainerRepository, trainerId);
      } catch {
        // Expected to throw
      }
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: trainerId } });
    });
  });

  describe('when using different id types', () => {
    it('should handle zero id', async () => {
      const zeroId = 0;
      mockFindOne.mockResolvedValue(null);

      const result = await getTrainer(mockTrainerRepository, zeroId);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 0 } });
    });

    it('should handle negative id', async () => {
      const negativeId = -1;
      mockFindOne.mockResolvedValue(null);

      const result = await getTrainer(mockTrainerRepository, negativeId);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: -1 } });
    });
  });

  describe('when trainer has complex data structure', () => {
    let result: Trainer | null;
    const trainerId = 3;

    const expectedTrainer: Trainer = {
      id: 3,
      name: 'Champion Lance',
      class: 'Elite Four Champion',
      badges: [
        {
          id: 1,
          name: 'Boulder Badge',
          description: 'Pewter City Gym Badge',
          imageUrl: 'https://example.com/boulder-badge.png',
        },
        {
          id: 2,
          name: 'Cascade Badge',
          description: 'Cerulean City Gym Badge',
          imageUrl: 'https://example.com/cascade-badge.png',
        },
      ],
      pokemon: [
        {
          id: 149,
          name: 'dragonite',
          url: 'https://pokeapi.co/api/v2/pokemon/149/',
        },
        {
          id: 130,
          name: 'gyarados',
          url: 'https://pokeapi.co/api/v2/pokemon/130/',
        },
      ],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedTrainer);

      result = await getTrainer(mockTrainerRepository, trainerId);
    });

    it('should return trainer with complex nested data', () => {
      expect(result).toEqual(expectedTrainer);
    });

    it('should preserve all badges and pokemon data', () => {
      expect(result?.badges).toHaveLength(2);
      expect(result?.pokemon).toHaveLength(2);
      expect(result?.badges[0].name).toBe('Boulder Badge');
      expect(result?.pokemon[0].name).toBe('dragonite');
    });
  });
});
