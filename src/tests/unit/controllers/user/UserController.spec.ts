import { Repository } from 'typeorm';
import { vi } from 'vitest';
import UserController from '../../../../controllers/user/UserController';
import { User } from '../../../../mysql/entity/user';
import { mockModules } from '../../../helpers/mock-modules';

describe('controllers/user/UserController', () => {
  let userRepository: Repository<User>,
    MockRepository: new () => Repository<User>,
    mockMethods: Record<string, unknown>,
    userController: UserController;

  beforeAll(async () => {
    mockMethods = {
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      findUserById: vi.fn(),
      findUserByUsernameOrEmail: vi.fn(),
      getUserInfo: vi.fn(),
      updateUser: vi.fn(),
      verifyPassword: vi.fn(),
    };

    const mockRepository = {
      Repository: vi.fn().mockImplementation(() => ({
        save: vi.fn(),
        find: vi.fn(),
        findOne: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
      })),
    };

    [MockRepository] = await mockModules([
      ['typeorm', mockRepository],
      ['src/controllers/user/methods/index', mockMethods],
    ]);

    userRepository = new MockRepository();

    const { default: UserController } = await import('../../../../controllers/user/UserController');
    userController = new UserController(userRepository);
  });

  describe('createUser', () => {
    it('should call createUser method', async () => {
      const createUserInput = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
      };
      await userController.createUser(createUserInput);
      expect(mockMethods.createUser).toHaveBeenCalledWith(userRepository, createUserInput);
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser method', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      await userController.deleteUser(userId);
      expect(mockMethods.deleteUser).toHaveBeenCalledWith(userRepository, userId);
    });
  });

  describe('findUserById', () => {
    it('should call findUserById method', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      await userController.findUserById(userId);
      expect(mockMethods.findUserById).toHaveBeenCalledWith(userRepository, userId);
    });
  });

  describe('findUserByUsernameOrEmail', () => {
    it('should call findUserByUsernameOrEmail method', async () => {
      const identifier = 'testuser';
      await userController.findUserByUsernameOrEmail(identifier);
      expect(mockMethods.findUserByUsernameOrEmail).toHaveBeenCalledWith(userRepository, identifier);
    });
  });

  describe('getUserInfo', () => {
    it('should call getUserInfo method', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      await userController.getUserInfo(userId);
      expect(mockMethods.getUserInfo).toHaveBeenCalledWith(userRepository, userId);
    });
  });

  describe('updateUser', () => {
    it('should call updateUser method', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserInput = {
        username: 'updateduser',
        email: 'updated@example.com',
      };
      await userController.updateUser(userId, updateUserInput);
      expect(mockMethods.updateUser).toHaveBeenCalledWith(userRepository, userId, updateUserInput);
    });
  });

  describe('verifyPassword', () => {
    it('should call verifyPassword method', async () => {
      const user: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        createdAt: new Date(),
        refreshTokens: [],
      };
      const password = 'plainpassword';
      await userController.verifyPassword(user, password);
      expect(mockMethods.verifyPassword).toHaveBeenCalledWith(user, password);
    });
  });
});
