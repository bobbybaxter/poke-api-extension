import bcrypt from 'bcrypt';
import { Mock, vi } from 'vitest';
import { verifyPassword } from '../../../../../controllers/user/methods/index';
import { User } from '../../../../../mysql/entity/user';

// Mock bcrypt module
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('controllers/user/methods/verifyPassword', () => {
  let mockBcryptCompare: Mock;

  beforeAll(() => {
    mockBcryptCompare = vi.mocked(bcrypt.compare);
  });

  describe('when password is correct', () => {
    let result: boolean;
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const password = 'correctpassword';

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(true);

      result = await verifyPassword(user, password);
    });

    it('should return true when password is correct', () => {
      expect(result).toBe(true);
    });

    it('should call bcrypt.compare with correct parameters', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(password, user.passwordHash);
    });

    it('should call bcrypt.compare once', () => {
      expect(mockBcryptCompare).toHaveBeenCalledTimes(1);
    });
  });

  describe('when password is incorrect', () => {
    let result: boolean;
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'janedoe',
      email: 'jane@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const wrongPassword = 'wrongpassword';

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(false);

      result = await verifyPassword(user, wrongPassword);
    });

    it('should return false when password is incorrect', () => {
      expect(result).toBe(false);
    });

    it('should call bcrypt.compare with incorrect password', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(wrongPassword, user.passwordHash);
    });

    it('should call bcrypt.compare once', () => {
      expect(mockBcryptCompare).toHaveBeenCalledTimes(1);
    });
  });

  describe('when password is empty string', () => {
    let result: boolean;
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const emptyPassword = '';

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(false);

      result = await verifyPassword(user, emptyPassword);
    });

    it('should return false when password is empty', () => {
      expect(result).toBe(false);
    });

    it('should call bcrypt.compare with empty password', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(emptyPassword, user.passwordHash);
    });
  });

  describe('when user has empty password hash', () => {
    let result: boolean;
    const userWithEmptyHash: User = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'nohashuser',
      email: 'nohash@example.com',
      passwordHash: '',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const password = 'somepassword';

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(false);

      result = await verifyPassword(userWithEmptyHash, password);
    });

    it('should return false when password hash is empty', () => {
      expect(result).toBe(false);
    });

    it('should call bcrypt.compare with empty hash', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(password, '');
    });
  });

  describe('when bcrypt.compare throws an error', () => {
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440004',
      username: 'erroruser',
      email: 'error@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const password = 'testpassword';

    beforeEach(() => {
      mockBcryptCompare.mockRejectedValue(new Error('Bcrypt comparison failed'));
    });

    it('should throw the error from bcrypt.compare', async () => {
      await expect(verifyPassword(user, password)).rejects.toThrow('Bcrypt comparison failed');
    });

    it('should call bcrypt.compare before failing', async () => {
      try {
        await verifyPassword(user, password);
      } catch {
        // Expected to throw
      }
      expect(mockBcryptCompare).toHaveBeenCalledWith(password, user.passwordHash);
    });
  });

  describe('when using special characters in password', () => {
    let result: boolean;
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440005',
      username: 'specialuser',
      email: 'special@example.com',
      passwordHash: '$2b$10$hashedpasswordwithspecialchars',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const specialPassword = 'p@ssw0rd!#$%^&*()';

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(true);

      result = await verifyPassword(user, specialPassword);
    });

    it('should handle special characters in password', () => {
      expect(result).toBe(true);
    });

    it('should call bcrypt.compare with special characters', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(specialPassword, user.passwordHash);
    });
  });

  describe('when using unicode characters in password', () => {
    let result: boolean;
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440006',
      username: 'unicodeuser',
      email: 'unicode@example.com',
      passwordHash: '$2b$10$hashedpasswordwithunicode',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const unicodePassword = 'пароль123🔐';

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(true);

      result = await verifyPassword(user, unicodePassword);
    });

    it('should handle unicode characters in password', () => {
      expect(result).toBe(true);
    });

    it('should call bcrypt.compare with unicode characters', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(unicodePassword, user.passwordHash);
    });
  });

  describe('when using very long password', () => {
    let result: boolean;
    const user: User = {
      id: '550e8400-e29b-41d4-a716-446655440007',
      username: 'longpassuser',
      email: 'longpass@example.com',
      passwordHash: '$2b$10$hashedlongpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };
    const longPassword = 'a'.repeat(500);

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(true);

      result = await verifyPassword(user, longPassword);
    });

    it('should handle very long passwords', () => {
      expect(result).toBe(true);
    });

    it('should call bcrypt.compare with long password', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(longPassword, user.passwordHash);
    });
  });

  describe('when user has complex data but only password verification is needed', () => {
    let result: boolean;
    const complexUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440008',
      username: 'complexuser',
      email: 'complex@example.com',
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
    const password = 'correctpassword';

    beforeEach(async () => {
      mockBcryptCompare.mockResolvedValue(true);

      result = await verifyPassword(complexUser, password);
    });

    it('should verify password regardless of other user data complexity', () => {
      expect(result).toBe(true);
    });

    it('should only use user password hash for verification', () => {
      expect(mockBcryptCompare).toHaveBeenCalledWith(password, complexUser.passwordHash);
    });
  });

  describe('when dealing with different hash formats', () => {
    it('should handle bcrypt hash with different cost factors', async () => {
      const user: User = {
        id: '550e8400-e29b-41d4-a716-446655440009',
        username: 'hashuser',
        email: 'hash@example.com',
        passwordHash: '$2b$12$differentcostfactorhashedpassword',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        refreshTokens: [],
      };
      const password = 'testpassword';

      mockBcryptCompare.mockResolvedValue(true);

      const result = await verifyPassword(user, password);

      expect(result).toBe(true);
      expect(mockBcryptCompare).toHaveBeenCalledWith(password, '$2b$12$differentcostfactorhashedpassword');
    });

    it('should handle malformed hash gracefully', async () => {
      const user: User = {
        id: '550e8400-e29b-41d4-a716-446655440010',
        username: 'malformeduser',
        email: 'malformed@example.com',
        passwordHash: 'not-a-valid-bcrypt-hash',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        refreshTokens: [],
      };
      const password = 'testpassword';

      mockBcryptCompare.mockRejectedValue(new Error('Invalid hash format'));

      await expect(verifyPassword(user, password)).rejects.toThrow('Invalid hash format');
      expect(mockBcryptCompare).toHaveBeenCalledWith(password, 'not-a-valid-bcrypt-hash');
    });
  });
});
