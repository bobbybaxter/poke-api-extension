import { Repository, UpdateResult } from 'typeorm';
import { Mock, vi } from 'vitest';
import { updateUser } from '../../../../../controllers/user/methods/index';
import { User } from '../../../../../mysql/entity/user';

describe('controllers/user/methods/updateUser', () => {
  let mockUserRepository: Repository<User>;
  let mockUpdate: Mock;

  beforeAll(() => {
    mockUpdate = vi.fn();

    mockUserRepository = {
      update: mockUpdate,
    } as unknown as Repository<User>;
  });

  describe('when updating user successfully', () => {
    let result: UpdateResult;
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const updateUserInput = {
      username: 'updateduser',
      email: 'updated@example.com',
    };

    const expectedUpdateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, userId, updateUserInput);
    });

    it('should return the update result', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should call repository.update with correct parameters', () => {
      expect(mockUpdate).toHaveBeenCalledWith(userId, updateUserInput);
    });

    it('should call repository.update once', () => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('should indicate that one record was affected', () => {
      expect(result.affected).toBe(1);
    });
  });

  describe('when updating user with partial data', () => {
    let result: UpdateResult;
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const partialUpdateInput = {
      username: 'newusername',
    };

    const expectedUpdateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, userId, partialUpdateInput);
    });

    it('should update user with partial data', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should call repository.update with partial input data', () => {
      expect(mockUpdate).toHaveBeenCalledWith(userId, partialUpdateInput);
    });
  });

  describe('when updating user email only', () => {
    let result: UpdateResult;
    const userId = '550e8400-e29b-41d4-a716-446655440002';
    const emailUpdateInput = {
      email: 'newemail@example.com',
    };

    const expectedUpdateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, userId, emailUpdateInput);
    });

    it('should update user email only', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should call repository.update with email update only', () => {
      expect(mockUpdate).toHaveBeenCalledWith(userId, emailUpdateInput);
    });
  });

  describe('when updating user password hash', () => {
    let result: UpdateResult;
    const userId = '550e8400-e29b-41d4-a716-446655440003';
    const passwordUpdateInput = {
      passwordHash: '$2b$10$newhashedpassword',
    };

    const expectedUpdateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, userId, passwordUpdateInput);
    });

    it('should update user password hash', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should call repository.update with password hash update', () => {
      expect(mockUpdate).toHaveBeenCalledWith(userId, passwordUpdateInput);
    });
  });

  describe('when user is not found', () => {
    let result: UpdateResult;
    const nonExistentUserId = '550e8400-e29b-41d4-a716-446655440999';
    const updateUserInput = {
      username: 'nonexistent',
    };

    const expectedUpdateResult: UpdateResult = {
      affected: 0,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, nonExistentUserId, updateUserInput);
    });

    it('should return update result with zero affected records', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should indicate that no records were affected', () => {
      expect(result.affected).toBe(0);
    });

    it('should call repository.update with non-existent user id', () => {
      expect(mockUpdate).toHaveBeenCalledWith(nonExistentUserId, updateUserInput);
    });
  });

  describe('when repository.update throws an error', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const updateUserInput = {
      username: 'erroruser',
    };

    beforeEach(() => {
      mockUpdate.mockRejectedValue(new Error('Database connection failed'));
    });

    it('should throw the error from repository.update', async () => {
      await expect(updateUser(mockUserRepository, userId, updateUserInput)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should call repository.update with the user id and input before failing', async () => {
      try {
        await updateUser(mockUserRepository, userId, updateUserInput);
      } catch {
        // Expected to throw
      }
      expect(mockUpdate).toHaveBeenCalledWith(userId, updateUserInput);
    });
  });

  describe('when updating with empty object', () => {
    let result: UpdateResult;
    const userId = '550e8400-e29b-41d4-a716-446655440004';
    const emptyUpdateInput = {};

    const expectedUpdateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, userId, emptyUpdateInput);
    });

    it('should handle empty update input', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should call repository.update with empty object', () => {
      expect(mockUpdate).toHaveBeenCalledWith(userId, emptyUpdateInput);
    });
  });

  describe('when updating with complex data', () => {
    let result: UpdateResult;
    const userId = '550e8400-e29b-41d4-a716-446655440005';
    const complexUpdateInput = {
      username: 'complexuser',
      email: 'complex@example.com',
      passwordHash: '$2b$10$verylongandcomplexhashedpassword',
    };

    const expectedUpdateResult: UpdateResult = {
      affected: 1,
      raw: {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 0,
        serverStatus: 2,
        warningCount: 0,
        message: '(Rows matched: 1  Changed: 1  Warnings: 0',
        protocol41: true,
        changedRows: 1,
      },
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, userId, complexUpdateInput);
    });

    it('should update user with complex data', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should call repository.update with complex input data', () => {
      expect(mockUpdate).toHaveBeenCalledWith(userId, complexUpdateInput);
    });

    it('should return detailed update result', () => {
      expect(result.affected).toBe(1);
      expect(result.raw.affectedRows).toBe(1);
      expect(result.raw.changedRows).toBe(1);
    });
  });

  describe('when using different id formats', () => {
    it('should handle empty string id', async () => {
      const emptyId = '';
      const updateInput = { username: 'test' };
      const expectedResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };

      mockUpdate.mockResolvedValue(expectedResult);

      const result = await updateUser(mockUserRepository, emptyId, updateInput);

      expect(result.affected).toBe(0);
      expect(mockUpdate).toHaveBeenCalledWith('', updateInput);
    });

    it('should handle malformed UUID', async () => {
      const malformedId = 'not-a-valid-uuid';
      const updateInput = { username: 'test' };
      const expectedResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };

      mockUpdate.mockResolvedValue(expectedResult);

      const result = await updateUser(mockUserRepository, malformedId, updateInput);

      expect(result.affected).toBe(0);
      expect(mockUpdate).toHaveBeenCalledWith('not-a-valid-uuid', updateInput);
    });

    it('should handle numeric string id', async () => {
      const numericId = '123';
      const updateInput = { username: 'test' };
      const expectedResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };

      mockUpdate.mockResolvedValue(expectedResult);

      const result = await updateUser(mockUserRepository, numericId, updateInput);

      expect(result.affected).toBe(0);
      expect(mockUpdate).toHaveBeenCalledWith('123', updateInput);
    });
  });

  describe('when updating multiple fields at once', () => {
    let result: UpdateResult;
    const userId = '550e8400-e29b-41d4-a716-446655440006';
    const multiFieldUpdateInput = {
      username: 'multiuser',
      email: 'multi@example.com',
      passwordHash: '$2b$10$newhashedpassword',
    };

    const expectedUpdateResult: UpdateResult = {
      affected: 1,
      raw: {},
      generatedMaps: [],
    };

    beforeEach(async () => {
      mockUpdate.mockResolvedValue(expectedUpdateResult);

      result = await updateUser(mockUserRepository, userId, multiFieldUpdateInput);
    });

    it('should update multiple fields successfully', () => {
      expect(result).toEqual(expectedUpdateResult);
    });

    it('should call repository.update with all field updates', () => {
      expect(mockUpdate).toHaveBeenCalledWith(userId, multiFieldUpdateInput);
    });

    it('should indicate successful update of multiple fields', () => {
      expect(result.affected).toBe(1);
    });
  });
});
