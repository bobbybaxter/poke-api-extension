import { DeleteResult, Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { deleteUser } from '../../../../../controllers/user/methods/index';
import { User } from '../../../../../mysql/entity/user';

describe('controllers/user/methods/deleteUser', () => {
  let mockUserRepository: Repository<User>;
  let mockDelete: Mock;

  beforeAll(() => {
    mockDelete = vi.fn();

    mockUserRepository = {
      delete: mockDelete,
    } as unknown as Repository<User>;
  });

  describe('when deleting user successfully', () => {
    let result: DeleteResult;
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    const expectedDeleteResult: DeleteResult = {
      affected: 1,
      raw: {},
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteUser(mockUserRepository, userId);
    });

    it('should return the delete result', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should call repository.delete with correct parameters', () => {
      expect(mockDelete).toHaveBeenCalledWith(userId);
    });

    it('should call repository.delete once', () => {
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('should indicate that one record was affected', () => {
      expect(result.affected).toBe(1);
    });
  });

  describe('when user is not found', () => {
    let result: DeleteResult;
    const nonExistentUserId = '550e8400-e29b-41d4-a716-446655440999';

    const expectedDeleteResult: DeleteResult = {
      affected: 0,
      raw: {},
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteUser(mockUserRepository, nonExistentUserId);
    });

    it('should return delete result with zero affected records', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should indicate that no records were affected', () => {
      expect(result.affected).toBe(0);
    });

    it('should call repository.delete with non-existent user id', () => {
      expect(mockDelete).toHaveBeenCalledWith(nonExistentUserId);
    });

    it('should call repository.delete once', () => {
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('when repository.delete throws an error', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    beforeEach(() => {
      mockDelete.mockRejectedValue(new Error('Database connection failed'));
    });

    it('should throw the error from repository.delete', async () => {
      await expect(deleteUser(mockUserRepository, userId)).rejects.toThrow('Database connection failed');
    });

    it('should call repository.delete with the user id before failing', async () => {
      try {
        await deleteUser(mockUserRepository, userId);
      } catch {
        // Expected to throw
      }
      expect(mockDelete).toHaveBeenCalledWith(userId);
    });
  });

  describe('when database constraint violation occurs', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    beforeEach(() => {
      mockDelete.mockRejectedValue(new Error('Foreign key constraint violation'));
    });

    it('should throw the constraint violation error', async () => {
      await expect(deleteUser(mockUserRepository, userId)).rejects.toThrow('Foreign key constraint violation');
    });

    it('should call repository.delete before failing', async () => {
      try {
        await deleteUser(mockUserRepository, userId);
      } catch {
        // Expected to throw
      }
      expect(mockDelete).toHaveBeenCalledWith(userId);
    });
  });

  describe('when using different id formats', () => {
    it('should handle empty string id', async () => {
      const emptyId = '';
      const expectedResult: DeleteResult = { affected: 0, raw: {} };

      mockDelete.mockResolvedValue(expectedResult);

      const result = await deleteUser(mockUserRepository, emptyId);

      expect(result.affected).toBe(0);
      expect(mockDelete).toHaveBeenCalledWith('');
    });

    it('should handle malformed UUID', async () => {
      const malformedId = 'not-a-valid-uuid';
      const expectedResult: DeleteResult = { affected: 0, raw: {} };

      mockDelete.mockResolvedValue(expectedResult);

      const result = await deleteUser(mockUserRepository, malformedId);

      expect(result.affected).toBe(0);
      expect(mockDelete).toHaveBeenCalledWith('not-a-valid-uuid');
    });

    it('should handle numeric string id', async () => {
      const numericId = '123';
      const expectedResult: DeleteResult = { affected: 0, raw: {} };

      mockDelete.mockResolvedValue(expectedResult);

      const result = await deleteUser(mockUserRepository, numericId);

      expect(result.affected).toBe(0);
      expect(mockDelete).toHaveBeenCalledWith('123');
    });

    it('should handle whitespace in id', async () => {
      const whitespaceId = ' 550e8400-e29b-41d4-a716-446655440000 ';
      const expectedResult: DeleteResult = { affected: 0, raw: {} };

      mockDelete.mockResolvedValue(expectedResult);

      const result = await deleteUser(mockUserRepository, whitespaceId);

      expect(result.affected).toBe(0);
      expect(mockDelete).toHaveBeenCalledWith(' 550e8400-e29b-41d4-a716-446655440000 ');
    });
  });

  describe('when delete operation affects multiple records (edge case)', () => {
    let result: DeleteResult;
    const userId = '550e8400-e29b-41d4-a716-446655440002';

    const expectedDeleteResult: DeleteResult = {
      affected: 2,
      raw: {
        fieldCount: 0,
        affectedRows: 2,
        insertId: 0,
        serverStatus: 2,
        warningCount: 0,
        message: '',
        protocol41: true,
        changedRows: 0,
      },
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteUser(mockUserRepository, userId);
    });

    it('should return delete result with multiple affected records', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should indicate that multiple records were affected', () => {
      expect(result.affected).toBe(2);
    });

    it('should return detailed delete result', () => {
      expect(result.raw.affectedRows).toBe(2);
    });
  });

  describe('when delete operation returns detailed raw response', () => {
    let result: DeleteResult;
    const userId = '550e8400-e29b-41d4-a716-446655440003';

    const expectedDeleteResult: DeleteResult = {
      affected: 1,
      raw: {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 0,
        serverStatus: 2,
        warningCount: 0,
        message: '',
        protocol41: true,
        changedRows: 0,
      },
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteUser(mockUserRepository, userId);
    });

    it('should return detailed delete result', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should preserve raw database response details', () => {
      expect(result.raw.fieldCount).toBe(0);
      expect(result.raw.affectedRows).toBe(1);
      expect(result.raw.protocol41).toBe(true);
    });
  });

  describe('when delete operation has warnings', () => {
    let result: DeleteResult;
    const userId = '550e8400-e29b-41d4-a716-446655440004';

    const expectedDeleteResult: DeleteResult = {
      affected: 1,
      raw: {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 0,
        serverStatus: 2,
        warningCount: 1,
        message: 'Warning: some warning message',
        protocol41: true,
        changedRows: 0,
      },
    };

    beforeEach(async () => {
      mockDelete.mockResolvedValue(expectedDeleteResult);

      result = await deleteUser(mockUserRepository, userId);
    });

    it('should return delete result with warnings', () => {
      expect(result).toEqual(expectedDeleteResult);
    });

    it('should preserve warning information', () => {
      expect(result.raw.warningCount).toBe(1);
      expect(result.raw.message).toBe('Warning: some warning message');
    });
  });

  describe('when performing bulk delete scenarios', () => {
    it('should handle successful deletion', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440005';
      const successResult: DeleteResult = { affected: 1, raw: {} };

      mockDelete.mockResolvedValue(successResult);

      const result = await deleteUser(mockUserRepository, userId);

      expect(result.affected).toBe(1);
      expect(mockDelete).toHaveBeenCalledWith(userId);
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('should handle no deletion when user does not exist', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440006';
      const noResult: DeleteResult = { affected: 0, raw: {} };

      mockDelete.mockResolvedValue(noResult);

      const result = await deleteUser(mockUserRepository, userId);

      expect(result.affected).toBe(0);
      expect(mockDelete).toHaveBeenCalledWith(userId);
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });
  });
});
