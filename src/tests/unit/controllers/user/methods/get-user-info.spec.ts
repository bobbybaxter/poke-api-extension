import { Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { getUserInfo } from '../../../../../controllers/user/methods/index';
import { User } from '../../../../../mysql/entity/user';

describe('controllers/user/methods/getUserInfo', () => {
  let mockUserRepository: Repository<User>;
  let mockFindOne: Mock;

  beforeAll(() => {
    mockFindOne = vi.fn();

    mockUserRepository = {
      findOne: mockFindOne,
    } as unknown as Repository<User>;
  });

  describe('when user is found', () => {
    let result: User | null;
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [
        {
          id: 'token-1',
          token: 'refresh-token-123',
          expirationDate: new Date('2023-12-31T23:59:59Z'),
          user: {} as User,
        },
      ],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await getUserInfo(mockUserRepository, userId);
    });

    it('should return the user info', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should call repository.findOne with correct parameters', () => {
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should call repository.findOne once', () => {
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user is not found', () => {
    let result: User | null;
    const nonExistentUserId = '550e8400-e29b-41d4-a716-446655440999';

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(null);

      result = await getUserInfo(mockUserRepository, nonExistentUserId);
    });

    it('should return null when user is not found', () => {
      expect(result).toBeNull();
    });

    it('should call repository.findOne with the non-existent user id', () => {
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: nonExistentUserId } });
    });

    it('should call repository.findOne once', () => {
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user has no refresh tokens', () => {
    let result: User | null;
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'newuser',
      email: 'new@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await getUserInfo(mockUserRepository, userId);
    });

    it('should return user info with empty refresh tokens array', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should handle empty refresh tokens correctly', () => {
      expect(result?.refreshTokens).toEqual([]);
    });
  });

  describe('when repository.findOne throws an error', () => {
    const userId = '550e8400-e29b-41d4-a716-446655440000';

    beforeEach(() => {
      mockFindOne.mockRejectedValue(new Error('Database connection failed'));
    });

    it('should throw the error from repository.findOne', async () => {
      await expect(getUserInfo(mockUserRepository, userId)).rejects.toThrow('Database connection failed');
    });

    it('should call repository.findOne with the user id before failing', async () => {
      try {
        await getUserInfo(mockUserRepository, userId);
      } catch {
        // Expected to throw
      }
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('when using different id formats', () => {
    it('should handle empty string id', async () => {
      const emptyId = '';
      mockFindOne.mockResolvedValue(null);

      const result = await getUserInfo(mockUserRepository, emptyId);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: '' } });
    });

    it('should handle malformed UUID', async () => {
      const malformedId = 'not-a-valid-uuid';
      mockFindOne.mockResolvedValue(null);

      const result = await getUserInfo(mockUserRepository, malformedId);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: 'not-a-valid-uuid' } });
    });

    it('should handle numeric string id', async () => {
      const numericId = '123';
      mockFindOne.mockResolvedValue(null);

      const result = await getUserInfo(mockUserRepository, numericId);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });
  });

  describe('when user has sensitive information', () => {
    let result: User | null;
    const userId = '550e8400-e29b-41d4-a716-446655440002';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      username: 'sensitiveuser',
      email: 'sensitive@example.com',
      passwordHash: '$2b$10$verylongandcomplexhashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [
        {
          id: 'token-1',
          token: 'sensitive-refresh-token-123',
          expirationDate: new Date('2023-12-31T23:59:59Z'),
          user: {} as User,
        },
      ],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await getUserInfo(mockUserRepository, userId);
    });

    it('should return complete user info including sensitive data', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should include password hash in the response', () => {
      expect(result?.passwordHash).toBe('$2b$10$verylongandcomplexhashedpassword');
    });

    it('should include refresh tokens in the response', () => {
      expect(result?.refreshTokens).toHaveLength(1);
      expect(result?.refreshTokens[0].token).toBe('sensitive-refresh-token-123');
    });
  });

  describe('when user has multiple refresh tokens', () => {
    let result: User | null;
    const userId = '550e8400-e29b-41d4-a716-446655440003';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'multitoken',
      email: 'multi@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [
        {
          id: 'token-1',
          token: 'refresh-token-123',
          expirationDate: new Date('2023-12-31T23:59:59Z'),
          user: {} as User,
        },
        {
          id: 'token-2',
          token: 'refresh-token-456',
          expirationDate: new Date('2024-01-31T23:59:59Z'),
          user: {} as User,
        },
        {
          id: 'token-3',
          token: 'refresh-token-789',
          expirationDate: new Date('2024-02-28T23:59:59Z'),
          user: {} as User,
        },
      ],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await getUserInfo(mockUserRepository, userId);
    });

    it('should return user info with all refresh tokens', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should preserve all refresh tokens data', () => {
      expect(result?.refreshTokens).toHaveLength(3);
      expect(result?.refreshTokens[0].token).toBe('refresh-token-123');
      expect(result?.refreshTokens[1].token).toBe('refresh-token-456');
      expect(result?.refreshTokens[2].token).toBe('refresh-token-789');
    });
  });

  describe('when user has old creation date', () => {
    let result: User | null;
    const userId = '550e8400-e29b-41d4-a716-446655440004';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440004',
      username: 'olduser',
      email: 'old@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2020-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await getUserInfo(mockUserRepository, userId);
    });

    it('should return user info with historical creation date', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should preserve the original creation date', () => {
      expect(result?.createdAt).toEqual(new Date('2020-01-01T00:00:00Z'));
    });
  });
});
