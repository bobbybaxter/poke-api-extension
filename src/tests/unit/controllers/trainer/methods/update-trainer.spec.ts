import { Repository, UpdateResult } from 'typeorm';
import { Mock, vi } from 'vitest';
import { updateTrainer } from '../../../../../controllers/trainer/methods/index';
import { Trainer } from '../../../../../mysql/entity/trainer';

describe('controllers/trainer/methods/updateTrainer', () => {
  let mockTrainerRepository: Repository<Trainer>;
  let mockUpdate: Mock;
  let mockFindOne: Mock;

  beforeAll(() => {
    mockUpdate = vi.fn();
    mockFindOne = vi.fn();

    mockTrainerRepository = {
      update: mockUpdate,
      findOne: mockFindOne,
    } as unknown as Repository<Trainer>;
  });

  describe('when updating a trainer successfully', () => {
    let result: Trainer | null;
    const trainerId = 1;
    const updateData = {
      name: 'Updated Ash Ketchum',
      class: 'Pokemon Master',
    };

    const updateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    const updatedTrainer: Trainer = {
      id: 1,
      name: 'Updated Ash Ketchum',
      class: 'Pokemon Master',
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
      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockResolvedValue(updatedTrainer);

      result = await updateTrainer(mockTrainerRepository, trainerId, updateData);
    });

    it('should return the updated trainer', () => {
      expect(result).toEqual(updatedTrainer);
    });

    it('should call repository.update with correct parameters', () => {
      expect(mockUpdate).toHaveBeenCalledWith(trainerId, updateData);
    });

    it('should call repository.findOne with correct parameters', () => {
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: trainerId } });
    });

    it('should call repository methods once each', () => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when updating a trainer with partial data', () => {
    let result: Trainer | null;
    const trainerId = 2;
    const partialUpdateData = {
      name: 'Misty Waters',
    };

    const updateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    const updatedTrainer: Trainer = {
      id: 2,
      name: 'Misty Waters',
      class: 'Gym Leader',
      badges: [],
      pokemon: [
        {
          id: 54,
          name: 'psyduck',
          url: 'https://pokeapi.co/api/v2/pokemon/54/',
        },
      ],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockResolvedValue(updatedTrainer);

      result = await updateTrainer(mockTrainerRepository, trainerId, partialUpdateData);
    });

    it('should update trainer with partial data', () => {
      expect(result).toEqual(updatedTrainer);
    });

    it('should call repository.update with partial data', () => {
      expect(mockUpdate).toHaveBeenCalledWith(trainerId, partialUpdateData);
    });
  });

  describe('when updating a trainer that does not exist', () => {
    let result: Trainer | null;
    const nonExistentTrainerId = 999;
    const updateData = {
      name: 'Non-existent Trainer',
    };

    const updateResult: UpdateResult = {
      affected: 0,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockResolvedValue(null);

      result = await updateTrainer(mockTrainerRepository, nonExistentTrainerId, updateData);
    });

    it('should return null when trainer is not found after update', () => {
      expect(result).toBeNull();
    });

    it('should call repository.update even for non-existent trainer', () => {
      expect(mockUpdate).toHaveBeenCalledWith(nonExistentTrainerId, updateData);
    });

    it('should call repository.findOne to check for updated trainer', () => {
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: nonExistentTrainerId } });
    });
  });

  describe('when updating trainer with complex data', () => {
    let result: Trainer | null;
    const trainerId = 3;
    const complexUpdateData = {
      name: 'Champion Lance',
      class: 'Dragon Master',
      badges: [
        {
          id: 1,
          name: 'Elite Badge',
          description: 'Elite Four Badge',
          imageUrl: 'https://example.com/elite-badge.png',
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

    const updateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    const updatedTrainer: Trainer = {
      id: 3,
      name: 'Champion Lance',
      class: 'Dragon Master',
      badges: [
        {
          id: 1,
          name: 'Elite Badge',
          description: 'Elite Four Badge',
          imageUrl: 'https://example.com/elite-badge.png',
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
      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockResolvedValue(updatedTrainer);

      result = await updateTrainer(mockTrainerRepository, trainerId, complexUpdateData);
    });

    it('should handle complex nested data updates', () => {
      expect(result).toEqual(updatedTrainer);
    });

    it('should preserve complex data structure', () => {
      expect(result?.badges).toHaveLength(1);
      expect(result?.pokemon).toHaveLength(2);
      expect(result?.badges[0].name).toBe('Elite Badge');
      expect(result?.pokemon[0].name).toBe('dragonite');
    });
  });

  describe('when repository.update throws an error', () => {
    const trainerId = 1;
    const updateData = {
      name: 'Failed Update',
    };

    beforeEach(() => {
      mockUpdate.mockRejectedValue(new Error('Update operation failed'));
    });

    it('should throw the error from repository.update', async () => {
      await expect(updateTrainer(mockTrainerRepository, trainerId, updateData)).rejects.toThrow(
        'Update operation failed',
      );
    });

    it('should not call repository.findOne if update fails', async () => {
      try {
        await updateTrainer(mockTrainerRepository, trainerId, updateData);
      } catch {
        // Expected to throw
      }
      expect(mockFindOne).not.toHaveBeenCalled();
    });
  });

  describe('when repository.findOne throws an error after successful update', () => {
    const trainerId = 1;
    const updateData = {
      name: 'Update Success, Find Fail',
    };

    const updateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(() => {
      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockRejectedValue(new Error('Find operation failed'));
    });

    it('should throw the error from repository.findOne', async () => {
      await expect(updateTrainer(mockTrainerRepository, trainerId, updateData)).rejects.toThrow(
        'Find operation failed',
      );
    });

    it('should call repository.update before failing on findOne', async () => {
      try {
        await updateTrainer(mockTrainerRepository, trainerId, updateData);
      } catch {
        // Expected to throw
      }
      expect(mockUpdate).toHaveBeenCalledWith(trainerId, updateData);
    });
  });

  describe('when updating with different id types', () => {
    it('should handle zero id', async () => {
      const zeroId = 0;
      const updateData = { name: 'Zero ID Trainer' };

      const updateResult: UpdateResult = {
        affected: 0,
        raw: {},
        generatedMaps: [],
      };

      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockResolvedValue(null);

      const result = await updateTrainer(mockTrainerRepository, zeroId, updateData);

      expect(result).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith(0, updateData);
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 0 } });
    });

    it('should handle negative id', async () => {
      const negativeId = -1;
      const updateData = { name: 'Negative ID Trainer' };

      const updateResult: UpdateResult = {
        affected: 0,
        raw: {},
        generatedMaps: [],
      };

      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockResolvedValue(null);

      const result = await updateTrainer(mockTrainerRepository, negativeId, updateData);

      expect(result).toBeNull();
      expect(mockUpdate).toHaveBeenCalledWith(-1, updateData);
    });
  });

  describe('when updating with empty data object', () => {
    let result: Trainer | null;
    const trainerId = 4;
    const emptyUpdateData = {};

    const updateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    const unchangedTrainer: Trainer = {
      id: 4,
      name: 'Unchanged Trainer',
      class: 'Trainer',
      badges: [],
      pokemon: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(updateResult);
      mockFindOne.mockResolvedValue(unchangedTrainer);

      result = await updateTrainer(mockTrainerRepository, trainerId, emptyUpdateData);
    });

    it('should handle empty update data object', () => {
      expect(result).toEqual(unchangedTrainer);
    });

    it('should call repository.update with empty object', () => {
      expect(mockUpdate).toHaveBeenCalledWith(trainerId, emptyUpdateData);
    });
  });
});
