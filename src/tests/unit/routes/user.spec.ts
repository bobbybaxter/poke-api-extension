import { Server } from 'http';
import { User } from 'src/mysql/entity/user';
import { mockModules } from 'src/tests/helpers/mock-modules';
import supertest from 'supertest';
import { vi } from 'vitest';

describe('routes/user', () => {
  let request: ReturnType<typeof supertest>, server: Server;
  let mockUserController: {
    getUserInfo: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    // Mock data for get user by id endpoint
    const mockUserData: Partial<User> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
    };

    // Mock data for update user endpoint
    const mockUpdatedUser: Partial<User> = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'updateduser',
      email: 'updated@example.com',
      createdAt: new Date('2023-01-01T00:00:00.000Z'),
    };

    mockUserController = {
      getUserInfo: vi.fn().mockResolvedValue(mockUserData),
      updateUser: vi.fn().mockResolvedValue(mockUpdatedUser),
      deleteUser: vi.fn().mockResolvedValue(mockUserData),
    };

    // Mock the auth middleware to always pass
    await mockModules([
      ['src/controllers/user/UserController', { default: vi.fn().mockImplementation(() => mockUserController) }],
      ['src/middleware/auth', { auth: vi.fn((req: any, res: any, next: any) => next()) }],
    ]);

    const setupServer = await import('src/tests/helpers/setup-server');
    request = setupServer.request;
    server = setupServer.server;
  });

  afterAll(async () => {
    server.close();
  });

  describe('happy path', () => {
    describe('GET /:id', () => {
      it('should return a 200 with the correct data', async () => {
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const route = `/user/${userId}`;

        const response = await request.get(route).expect(200);

        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('email', 'test@example.com');
        expect(mockUserController.getUserInfo).toHaveBeenCalledWith(userId);
        expect(mockUserController.getUserInfo).toHaveBeenCalledTimes(1);
      });
    });

    describe('PATCH /:id', () => {
      it('should return a 200 with the updated user data', async () => {
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const route = `/user/${userId}`;
        const requestBody = {
          username: 'updateduser',
          email: 'updated@example.com',
        };

        const response = await request.patch(route).send(requestBody).expect(200);

        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('username', 'updateduser');
        expect(response.body).toHaveProperty('email', 'updated@example.com');
        expect(mockUserController.updateUser).toHaveBeenCalledWith(userId, requestBody);
        expect(mockUserController.updateUser).toHaveBeenCalledTimes(1);
      });
    });

    describe('DELETE /:id', () => {
      it('should return a 200 with the deleted user data', async () => {
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const route = `/user/${userId}`;

        const response = await request.delete(route).expect(200);

        expect(response.body).toHaveProperty('id', userId);
        expect(response.body).toHaveProperty('username', 'testuser');
        expect(response.body).toHaveProperty('email', 'test@example.com');
        expect(mockUserController.deleteUser).toHaveBeenCalledWith(userId);
        expect(mockUserController.deleteUser).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('sad path', () => {
    describe('GET /:id', () => {
      it('should return a 500 when getUserInfo throws an error', async () => {
        // Mock the controller method to throw an error
        mockUserController.getUserInfo.mockRejectedValueOnce(new Error('Internal Server Error'));

        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const route = `/user/${userId}`;
        const response = await request.get(route).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockUserController.getUserInfo).toHaveBeenCalledWith(userId);
        expect(mockUserController.getUserInfo).toHaveBeenCalledTimes(1);
      });
    });

    describe('PATCH /:id', () => {
      it('should return a 500 when updateUser throws an error', async () => {
        // Mock the controller method to throw an error
        mockUserController.updateUser.mockRejectedValueOnce(new Error('Internal Server Error'));

        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const route = `/user/${userId}`;
        const requestBody = {
          username: 'updateduser',
          email: 'updated@example.com',
        };

        const response = await request.patch(route).send(requestBody).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockUserController.updateUser).toHaveBeenCalledWith(userId, requestBody);
        expect(mockUserController.updateUser).toHaveBeenCalledTimes(1);
      });
    });

    describe('DELETE /:id', () => {
      it('should return a 500 when deleteUser throws an error', async () => {
        // Mock the controller method to throw an error
        mockUserController.deleteUser.mockRejectedValueOnce(new Error('Internal Server Error'));

        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const route = `/user/${userId}`;
        const response = await request.delete(route).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockUserController.deleteUser).toHaveBeenCalledWith(userId);
        expect(mockUserController.deleteUser).toHaveBeenCalledTimes(1);
      });
    });
  });
});
