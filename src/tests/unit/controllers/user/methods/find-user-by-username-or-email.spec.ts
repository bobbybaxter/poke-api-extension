import { Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { findUserByUsernameOrEmail } from '../../../../../controllers/user/methods/index';
import { User } from '../../../../../mysql/entity/user';

describe('controllers/user/methods/findUserByUsernameOrEmail', () => {
  let mockUserRepository: Repository<User>;
  let mockFindOne: Mock;

  beforeAll(() => {
    mockFindOne = vi.fn();

    mockUserRepository = {
      findOne: mockFindOne,
    } as unknown as Repository<User>;
  });

  describe('when user is found by username', () => {
    let result: User | null;
    const username = 'johndoe';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await findUserByUsernameOrEmail(mockUserRepository, username);
    });

    it('should return the user', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should call repository.findOne with correct parameters for username search', () => {
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: username }, { email: username }],
      });
    });

    it('should call repository.findOne once', () => {
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user is found by email', () => {
    let result: User | null;
    const email = 'john@example.com';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await findUserByUsernameOrEmail(mockUserRepository, email);
    });

    it('should return the user when searching by email', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should call repository.findOne with correct parameters for email search', () => {
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: email }, { email: email }],
      });
    });

    it('should call repository.findOne once', () => {
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user is not found', () => {
    let result: User | null;
    const nonExistentIdentifier = 'nonexistent';

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(null);

      result = await findUserByUsernameOrEmail(mockUserRepository, nonExistentIdentifier);
    });

    it('should return null when user is not found', () => {
      expect(result).toBeNull();
    });

    it('should call repository.findOne with the non-existent identifier', () => {
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: nonExistentIdentifier }, { email: nonExistentIdentifier }],
      });
    });

    it('should call repository.findOne once', () => {
      expect(mockFindOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('when repository.findOne throws an error', () => {
    const identifier = 'testuser';

    beforeEach(() => {
      mockFindOne.mockRejectedValue(new Error('Database connection failed'));
    });

    it('should throw the error from repository.findOne', async () => {
      await expect(findUserByUsernameOrEmail(mockUserRepository, identifier)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should call repository.findOne with the identifier before failing', async () => {
      try {
        await findUserByUsernameOrEmail(mockUserRepository, identifier);
      } catch {
        // Expected to throw
      }
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: identifier }, { email: identifier }],
      });
    });
  });

  describe('when using different identifier formats', () => {
    it('should handle empty string identifier', async () => {
      const emptyIdentifier = '';
      mockFindOne.mockResolvedValue(null);

      const result = await findUserByUsernameOrEmail(mockUserRepository, emptyIdentifier);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: '' }, { email: '' }],
      });
    });

    it('should handle special characters in identifier', async () => {
      const specialIdentifier = 'user@domain.com';
      mockFindOne.mockResolvedValue(null);

      const result = await findUserByUsernameOrEmail(mockUserRepository, specialIdentifier);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: specialIdentifier }, { email: specialIdentifier }],
      });
    });

    it('should handle numeric identifier', async () => {
      const numericIdentifier = '12345';
      mockFindOne.mockResolvedValue(null);

      const result = await findUserByUsernameOrEmail(mockUserRepository, numericIdentifier);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: numericIdentifier }, { email: numericIdentifier }],
      });
    });

    it('should handle whitespace in identifier', async () => {
      const whitespaceIdentifier = ' spaced user ';
      mockFindOne.mockResolvedValue(null);

      const result = await findUserByUsernameOrEmail(mockUserRepository, whitespaceIdentifier);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: whitespaceIdentifier }, { email: whitespaceIdentifier }],
      });
    });
  });

  describe('when user has complex data with refresh tokens', () => {
    let result: User | null;
    const identifier = 'poweruser';

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'poweruser',
      email: 'power@example.com',
      passwordHash: '$2b$10$complexhashedpassword',
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
      ],
    };

    beforeEach(async () => {
      mockFindOne.mockResolvedValue(expectedUser);

      result = await findUserByUsernameOrEmail(mockUserRepository, identifier);
    });

    it('should return user with complex nested data', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should preserve all user data including refresh tokens', () => {
      expect(result?.refreshTokens).toHaveLength(2);
      expect(result?.username).toBe('poweruser');
      expect(result?.email).toBe('power@example.com');
    });
  });

  describe('when searching with case sensitivity considerations', () => {
    it('should search exactly as provided (case sensitive)', async () => {
      const upperCaseIdentifier = 'JOHNDOE';
      mockFindOne.mockResolvedValue(null);

      const result = await findUserByUsernameOrEmail(mockUserRepository, upperCaseIdentifier);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: 'JOHNDOE' }, { email: 'JOHNDOE' }],
      });
    });

    it('should search exactly as provided for mixed case', async () => {
      const mixedCaseIdentifier = 'JohnDoe@Example.COM';
      mockFindOne.mockResolvedValue(null);

      const result = await findUserByUsernameOrEmail(mockUserRepository, mixedCaseIdentifier);

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: [{ username: mixedCaseIdentifier }, { email: mixedCaseIdentifier }],
      });
    });
  });
});
