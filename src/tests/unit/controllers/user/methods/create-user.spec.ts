import { Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { createUser } from '../../../../../controllers/user/methods/index';
import { User } from '../../../../../mysql/entity/user';

describe('controllers/user/methods/createUser', () => {
  let mockUserRepository: Repository<User>;
  let mockCreate: Mock;
  let mockSave: Mock;

  beforeAll(() => {
    mockCreate = vi.fn();
    mockSave = vi.fn();

    mockUserRepository = {
      create: mockCreate,
      save: mockSave,
    } as unknown as Repository<User>;
  });

  describe('when creating a user successfully', () => {
    let result: User;
    const createUserInput = {
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: '$2b$10$hashedpassword',
    };

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'johndoe',
      email: 'john@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockCreate.mockReturnValue(expectedUser);
      mockSave.mockResolvedValue(expectedUser);

      result = await createUser(mockUserRepository, createUserInput);
    });

    it('should create and return the new user', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should call repository.create with the input data', () => {
      expect(mockCreate).toHaveBeenCalledWith(createUserInput);
    });

    it('should call repository.save with the created user', () => {
      expect(mockSave).toHaveBeenCalledWith(expectedUser);
    });

    it('should call repository methods once each', () => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });

  describe('when creating a user with partial data', () => {
    let result: User;
    const partialInput = {
      username: 'janedoe',
      email: 'jane@example.com',
    };

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'janedoe',
      email: 'jane@example.com',
      passwordHash: '',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockCreate.mockReturnValue(expectedUser);
      mockSave.mockResolvedValue(expectedUser);

      result = await createUser(mockUserRepository, partialInput);
    });

    it('should create and return the user with partial data', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should call repository.create with the partial input data', () => {
      expect(mockCreate).toHaveBeenCalledWith(partialInput);
    });
  });

  describe('when creating a user with only username', () => {
    let result: User;
    const minimalInput = {
      username: 'testuser',
    };

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440002',
      username: 'testuser',
      email: '',
      passwordHash: '',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockCreate.mockReturnValue(expectedUser);
      mockSave.mockResolvedValue(expectedUser);

      result = await createUser(mockUserRepository, minimalInput);
    });

    it('should create and return the user with minimal data', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should call repository.create with the minimal input data', () => {
      expect(mockCreate).toHaveBeenCalledWith(minimalInput);
    });
  });

  describe('when repository.create throws an error', () => {
    const createUserInput = {
      username: 'erroruser',
      email: 'error@example.com',
      passwordHash: '$2b$10$hashedpassword',
    };

    beforeEach(() => {
      mockCreate.mockImplementation(() => {
        throw new Error('Database connection failed');
      });
    });

    it('should throw the error from repository.create', async () => {
      await expect(createUser(mockUserRepository, createUserInput)).rejects.toThrow('Database connection failed');
    });

    it('should not call repository.save if create fails', async () => {
      try {
        await createUser(mockUserRepository, createUserInput);
      } catch {
        // Expected to throw
      }
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('when repository.save throws an error', () => {
    const createUserInput = {
      username: 'saveuser',
      email: 'save@example.com',
      passwordHash: '$2b$10$hashedpassword',
    };

    const createdUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'saveuser',
      email: 'save@example.com',
      passwordHash: '$2b$10$hashedpassword',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(() => {
      mockCreate.mockReturnValue(createdUser);
      mockSave.mockRejectedValue(new Error('Save operation failed'));
    });

    it('should throw the error from repository.save', async () => {
      await expect(createUser(mockUserRepository, createUserInput)).rejects.toThrow('Save operation failed');
    });

    it('should call repository.create before failing on save', async () => {
      try {
        await createUser(mockUserRepository, createUserInput);
      } catch {
        // Expected to throw
      }
      expect(mockCreate).toHaveBeenCalledWith(createUserInput);
    });
  });

  describe('when creating user with empty object', () => {
    let result: User;
    const emptyInput = {};

    const expectedUser: User = {
      id: '550e8400-e29b-41d4-a716-446655440004',
      username: '',
      email: '',
      passwordHash: '',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      refreshTokens: [],
    };

    beforeEach(async () => {
      mockCreate.mockReturnValue(expectedUser);
      mockSave.mockResolvedValue(expectedUser);

      result = await createUser(mockUserRepository, emptyInput);
    });

    it('should handle empty input object', () => {
      expect(result).toEqual(expectedUser);
    });

    it('should call repository.create with empty object', () => {
      expect(mockCreate).toHaveBeenCalledWith(emptyInput);
    });
  });
});
