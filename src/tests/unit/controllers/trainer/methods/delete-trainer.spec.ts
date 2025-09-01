import { DeleteResult, Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { deleteTrainer } from '../../../../../controllers/trainer/methods/index';
import { Trainer } from '../../../../../mysql/entity/trainer';

describe('controllers/trainer/methods/deleteTrainer', () => {
  let mockTrainerRepository: Repository<Trainer>;
  let mockDelete: Mock;

  beforeAll(() => {
    mockDelete = vi.fn();

    mockTrainerRepository = {
      delete: mockDelete,
    } as unknown as Repository<Trainer>;
  });

  describe('when deleting a trainer successfully', () => {
    let result: DeleteResult;
    const trainerId = 1;

    const expectedDeleteResult: DeleteResult = {
      affected: 1,
      raw: {},
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteTrainer(mockTrainerRepository, trainerId);
    });

    it('should return the delete result', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should call repository.delete with the trainer id', () => {
      expect(mockDelete).toHaveBeenCalledWith(trainerId);
    });

    it('should call repository.delete once', () => {
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('when deleting a trainer that does not exist', () => {
    let result: DeleteResult;
    const nonExistentTrainerId = 999;

    const expectedDeleteResult: DeleteResult = {
      affected: 0,
      raw: {},
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteTrainer(mockTrainerRepository, nonExistentTrainerId);
    });

    it('should return delete result with affected: 0', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should call repository.delete with the non-existent trainer id', () => {
      expect(mockDelete).toHaveBeenCalledWith(nonExistentTrainerId);
    });
  });

  describe('when deleting multiple trainers with same id call', () => {
    let result: DeleteResult;
    const trainerId = 2;

    const expectedDeleteResult: DeleteResult = {
      affected: 2,
      raw: {},
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteTrainer(mockTrainerRepository, trainerId);
    });

    it('should return delete result with affected count', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should handle multiple affected rows', () => {
      expect(result.affected).toBe(2);
    });
  });

  describe('when repository.delete throws an error', () => {
    const trainerId = 1;

    beforeEach(() => {
      mockDelete.mockRejectedValue(new Error('Database connection failed'));
    });

    it('should throw the error from repository.delete', async () => {
      await expect(deleteTrainer(mockTrainerRepository, trainerId)).rejects.toThrow('Database connection failed');
    });

    it('should call repository.delete with the trainer id before failing', async () => {
      try {
        await deleteTrainer(mockTrainerRepository, trainerId);
      } catch {
        // Expected to throw
      }
      expect(mockDelete).toHaveBeenCalledWith(trainerId);
    });
  });

  describe('when deleting with different id types', () => {
    it('should handle string id that can be converted to number', async () => {
      const stringId = '5';
      const expectedDeleteResult: DeleteResult = {
        affected: 1,
        raw: {},
      };

      mockDelete.mockResolvedValue(expectedDeleteResult);

      const result = await deleteTrainer(mockTrainerRepository, Number(stringId));

      expect(result).toEqual(expectedDeleteResult);
      expect(mockDelete).toHaveBeenCalledWith(5);
    });

    it('should handle zero id', async () => {
      const zeroId = 0;
      const expectedDeleteResult: DeleteResult = {
        affected: 0,
        raw: {},
      };

      mockDelete.mockResolvedValue(expectedDeleteResult);

      const result = await deleteTrainer(mockTrainerRepository, zeroId);

      expect(result).toEqual(expectedDeleteResult);
      expect(mockDelete).toHaveBeenCalledWith(0);
    });
  });
});
