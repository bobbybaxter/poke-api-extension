import { Server } from 'http';
import { mockModules } from 'src/tests/helpers/mock-modules';
import supertest from 'supertest';
import { vi } from 'vitest';

describe('routes/index', () => {
  let request: ReturnType<typeof supertest>, server: Server;
  let mockUserController: {
    findUserByUsernameOrEmail: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    verifyPassword: ReturnType<typeof vi.fn>;
  };
  let mockTokenService: {
    signAccessToken: ReturnType<typeof vi.fn>;
    issueRefreshToken: ReturnType<typeof vi.fn>;
    userIdFromRefresh: ReturnType<typeof vi.fn>;
    rotateRefreshToken: ReturnType<typeof vi.fn>;
    revokeRefreshToken: ReturnType<typeof vi.fn>;
  };
  let mockBcrypt: {
    hash: ReturnType<typeof vi.fn>;
  };
  let mockSetRefreshCookie: ReturnType<typeof vi.fn>;
  let mockValidateBody: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    // Mock user data
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashedpassword123',
    };

    const mockCreatedUser = {
      id: 2,
      username: 'newuser',
      email: 'new@example.com',
      passwordHash: 'hashedpassword456',
    };

    // Mock token data
    const mockAccessToken = 'mock.access.token';
    const mockRefreshToken = 'mockrefreshtoken123';

    // Set up controller mocks
    mockUserController = {
      findUserByUsernameOrEmail: vi.fn().mockResolvedValue(mockUser),
      createUser: vi.fn().mockResolvedValue(mockCreatedUser),
      verifyPassword: vi.fn().mockResolvedValue(true),
    };

    // Set up service mocks
    mockTokenService = {
      signAccessToken: vi.fn().mockReturnValue(mockAccessToken),
      issueRefreshToken: vi.fn().mockResolvedValue(mockRefreshToken),
      userIdFromRefresh: vi.fn().mockResolvedValue(1),
      rotateRefreshToken: vi.fn().mockResolvedValue('newrefreshtoken123'),
      revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
    };

    // Set up bcrypt mock
    mockBcrypt = {
      hash: vi.fn().mockResolvedValue('hashedpassword456'),
    };

    // Set up helper mocks
    mockSetRefreshCookie = vi.fn();

    // Set up validation middleware mock
    mockValidateBody = vi.fn((schema) => (req: any, res: any, next: any) => next());
    const mockValidateParams = vi.fn((schema) => (req: any, res: any, next: any) => next());
    const mockValidateQuery = vi.fn((schema) => (req: any, res: any, next: any) => next());

    // Set up AppDataSource mock
    const mockAppDataSource = {
      getRepository: vi.fn().mockReturnValue({}),
    };

    await mockModules([
      ['src/controllers/user/UserController', { default: vi.fn().mockImplementation(() => mockUserController) }],
      ['src/services/TokenService', { tokenService: mockTokenService }],
      ['bcrypt', { default: mockBcrypt }],
      ['src/helpers/set-refresh-cookie', { setRefreshCookie: mockSetRefreshCookie }],
      [
        'src/middleware/validation',
        {
          validateBody: mockValidateBody,
          validateParams: mockValidateParams,
          validateQuery: mockValidateQuery,
        },
      ],
      ['src/mysql/data-source', { AppDataSource: mockAppDataSource }],
      ['src/mysql/entity/user', { User: vi.fn() }],
    ]);

    const setupServer = await import('src/tests/helpers/setup-server');
    request = setupServer.request;
    server = setupServer.server;
  });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Don't set up default implementations - let each test set them explicitly
    // This avoids conflicts with mockResolvedValueOnce calls
  });

  afterAll(async () => {
    server?.close();
  });

  describe('happy path', () => {
    describe('GET /', () => {
      it('should return a 200 with empty response', async () => {
        const route = '/';

        const response = await request.get(route).expect(200);

        expect(response.text).toBe('');
      });
    });

    describe('POST /register', () => {
      it('should return a 201 with user data and tokens when registering with username', async () => {
        // Set up all required mocks for registration
        mockUserController.findUserByUsernameOrEmail.mockResolvedValue(null);
        mockBcrypt.hash.mockResolvedValue('hashedpassword456');
        mockUserController.createUser.mockResolvedValue({
          id: 2,
          username: 'newuser',
          email: 'new@example.com',
          passwordHash: 'hashedpassword456',
        });
        mockTokenService.signAccessToken.mockReturnValue('mock.access.token');
        mockTokenService.issueRefreshToken.mockResolvedValue('mockrefreshtoken123');

        const route = '/register';
        const requestBody = {
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
        };

        const response = await request.post(route).send(requestBody).expect(201);

        expect(response.body).toHaveProperty('access_token', 'mock.access.token');
        expect(response.body).toHaveProperty('token_type', 'Bearer');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id', 2);
        expect(response.body.user).toHaveProperty('username', 'newuser');
        expect(response.body.user).toHaveProperty('email', 'new@example.com');

        expect(mockUserController.findUserByUsernameOrEmail).toHaveBeenCalledWith('new@example.com');
        expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
        expect(mockUserController.createUser).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'new@example.com',
          passwordHash: 'hashedpassword456',
        });
        expect(mockTokenService.signAccessToken).toHaveBeenCalledWith({
          id: 2,
          username: 'newuser',
          email: 'new@example.com',
          passwordHash: 'hashedpassword456',
        });
        expect(mockTokenService.issueRefreshToken).toHaveBeenCalledWith(2);
        expect(mockSetRefreshCookie).toHaveBeenCalledWith(expect.any(Object), 'mockrefreshtoken123');
      });

      it('should return a 201 when registering with valid data', async () => {
        // Set up all required mocks for registration
        mockUserController.findUserByUsernameOrEmail.mockResolvedValue(null);
        mockBcrypt.hash.mockResolvedValue('hashedpassword456');
        mockUserController.createUser.mockResolvedValue({
          id: 3,
          username: 'newuser2',
          email: 'newuser2@example.com',
          passwordHash: 'hashedpassword456',
        });
        mockTokenService.signAccessToken.mockReturnValue('mock.access.token');
        mockTokenService.issueRefreshToken.mockResolvedValue('mockrefreshtoken123');

        const route = '/register';
        const requestBody = {
          username: 'newuser2',
          email: 'newuser2@example.com',
          password: 'password123',
        };

        const response = await request.post(route).send(requestBody).expect(201);

        expect(response.body).toHaveProperty('access_token');
        expect(mockUserController.findUserByUsernameOrEmail).toHaveBeenCalledWith('newuser2@example.com');
      });
    });

    describe('POST /login', () => {
      it('should return a 200 with user data and tokens when login is successful', async () => {
        // Set up all required mocks for login
        mockUserController.findUserByUsernameOrEmail.mockResolvedValue({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: 'hashedpassword123',
        });
        mockUserController.verifyPassword.mockResolvedValue(true);
        mockTokenService.signAccessToken.mockReturnValue('mock.access.token');
        mockTokenService.issueRefreshToken.mockResolvedValue('mockrefreshtoken123');
        const route = '/login';
        const requestBody = {
          identifier: 'testuser',
          password: 'password123',
        };

        const response = await request.post(route).send(requestBody).expect(200);

        expect(response.body).toHaveProperty('access_token', 'mock.access.token');
        expect(response.body).toHaveProperty('token_type', 'Bearer');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id', 1);
        expect(response.body.user).toHaveProperty('username', 'testuser');
        expect(response.body.user).toHaveProperty('email', 'test@example.com');

        expect(mockUserController.findUserByUsernameOrEmail).toHaveBeenCalledWith('testuser');
        expect(mockUserController.verifyPassword).toHaveBeenCalledWith(
          {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
          },
          'password123',
        );
        expect(mockTokenService.signAccessToken).toHaveBeenCalledWith({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: 'hashedpassword123',
        });
        expect(mockTokenService.issueRefreshToken).toHaveBeenCalledWith(1);
        expect(mockSetRefreshCookie).toHaveBeenCalledWith(expect.any(Object), 'mockrefreshtoken123');
      });
    });

    describe('POST /refresh', () => {
      it('should return a 200 with new access token when refresh is successful', async () => {
        const route = '/refresh';

        const response = await request.post(route).set('Cookie', 'refresh_token=mockrefreshtoken123').expect(200);

        expect(response.body).toHaveProperty('access_token', 'mock.access.token');
        expect(response.body).toHaveProperty('token_type', 'Bearer');

        expect(mockTokenService.userIdFromRefresh).toHaveBeenCalledWith('mockrefreshtoken123');
        expect(mockTokenService.rotateRefreshToken).toHaveBeenCalledWith('mockrefreshtoken123', 1);
        expect(mockTokenService.signAccessToken).toHaveBeenCalledWith({ id: 1, username: 'n/a' });
        expect(mockSetRefreshCookie).toHaveBeenCalledWith(expect.any(Object), 'newrefreshtoken123');
      });
    });

    describe('POST /logout', () => {
      it('should return a 200 with logout message when logout is successful', async () => {
        const route = '/logout';

        const response = await request.post(route).set('Cookie', 'refresh_token=mockrefreshtoken123').expect(200);

        expect(response.body).toHaveProperty('message', 'Logged out');

        expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('mockrefreshtoken123');
      });

      it('should return a 200 even without refresh token cookie', async () => {
        const route = '/logout';

        const response = await request.post(route).expect(200);

        expect(response.body).toHaveProperty('message', 'Logged out');

        expect(mockTokenService.revokeRefreshToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('sad path', () => {
    describe('POST /register', () => {
      it('should return a 409 when user already exists', async () => {
        // Mock existing user
        mockUserController.findUserByUsernameOrEmail.mockResolvedValueOnce({
          id: 1,
          username: 'existinguser',
          email: 'existing@example.com',
        });

        const route = '/register';
        const requestBody = {
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
        };

        const response = await request.post(route).send(requestBody).expect(409);

        expect(response.body).toHaveProperty('message', 'User already exists');
        expect(mockUserController.findUserByUsernameOrEmail).toHaveBeenCalledWith('existing@example.com');
        expect(mockUserController.createUser).not.toHaveBeenCalled();
      });

      it('should return a 500 when registration fails', async () => {
        // Set up mocks where createUser throws error
        mockUserController.findUserByUsernameOrEmail.mockResolvedValue(null);
        mockBcrypt.hash.mockResolvedValue('hashedpassword456');
        mockUserController.createUser.mockRejectedValue(new Error('Database error'));
        mockTokenService.signAccessToken.mockReturnValue('mock.access.token');
        mockTokenService.issueRefreshToken.mockResolvedValue('mockrefreshtoken123');

        const route = '/register';
        const requestBody = {
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
        };

        const response = await request.post(route).send(requestBody).expect(500);

        expect(response.body).toHaveProperty('error', 'Registration failed');
        expect(mockUserController.createUser).toHaveBeenCalled();
      });
    });

    describe('POST /login', () => {
      it('should return a 401 when user is not found', async () => {
        mockUserController.findUserByUsernameOrEmail.mockResolvedValue(null);

        const route = '/login';
        const requestBody = {
          identifier: 'nonexistentuser',
          password: 'password123',
        };

        const response = await request.post(route).send(requestBody).expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid credentials');
        expect(mockUserController.findUserByUsernameOrEmail).toHaveBeenCalledWith('nonexistentuser');
        expect(mockUserController.verifyPassword).not.toHaveBeenCalled();
      });

      it('should return a 401 when password is incorrect', async () => {
        mockUserController.findUserByUsernameOrEmail.mockResolvedValue({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: 'hashedpassword123',
        });
        mockUserController.verifyPassword.mockResolvedValue(false);

        const route = '/login';
        const requestBody = {
          identifier: 'testuser',
          password: 'wrongpassword',
        };

        const response = await request.post(route).send(requestBody).expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid credentials');
        expect(mockUserController.verifyPassword).toHaveBeenCalledWith(
          {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
          },
          'wrongpassword',
        );
      });

      it('should return a 500 when login fails with unexpected error', async () => {
        mockUserController.findUserByUsernameOrEmail.mockRejectedValue(new Error('Database error'));

        const route = '/login';
        const requestBody = {
          identifier: 'testuser',
          password: 'password123',
        };

        const response = await request.post(route).send(requestBody).expect(500);

        expect(response.body).toHaveProperty('error', 'Login failed');
      });
    });

    describe('POST /refresh', () => {
      it('should return a 401 when refresh token is missing', async () => {
        const route = '/refresh';

        const response = await request.post(route).expect(401);

        expect(response.body).toHaveProperty('message', 'Missing refresh token');
        expect(mockTokenService.userIdFromRefresh).not.toHaveBeenCalled();
      });

      it('should return a 401 when refresh token is invalid (userIdFromRefresh returns null)', async () => {
        mockTokenService.userIdFromRefresh.mockResolvedValue(null);

        const route = '/refresh';

        const response = await request.post(route).set('Cookie', 'refresh_token=invalidtoken').expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid refresh token');
        expect(mockTokenService.userIdFromRefresh).toHaveBeenCalledWith('invalidtoken');
        expect(mockTokenService.rotateRefreshToken).not.toHaveBeenCalled();
      });

      it('should return a 401 when token rotation fails', async () => {
        mockTokenService.userIdFromRefresh.mockResolvedValue(1);
        mockTokenService.rotateRefreshToken.mockResolvedValue(null);

        const route = '/refresh';

        const response = await request.post(route).set('Cookie', 'refresh_token=mockrefreshtoken123').expect(401);

        expect(response.body).toHaveProperty('message', 'Invalid refresh token');
        expect(mockTokenService.rotateRefreshToken).toHaveBeenCalledWith('mockrefreshtoken123', 1);
      });

      it('should return a 401 when refresh fails with unexpected error', async () => {
        mockTokenService.userIdFromRefresh.mockRejectedValue(new Error('Token service error'));

        const route = '/refresh';

        const response = await request.post(route).set('Cookie', 'refresh_token=mockrefreshtoken123').expect(401);

        expect(response.body).toHaveProperty('error', 'Refresh failed');
      });
    });

    describe('POST /logout', () => {
      it('should return a 500 when logout fails with unexpected error', async () => {
        mockTokenService.revokeRefreshToken.mockRejectedValue(new Error('Token service error'));

        const route = '/logout';

        const response = await request.post(route).set('Cookie', 'refresh_token=mockrefreshtoken123').expect(500);

        expect(response.body).toHaveProperty('error', 'Logout failed');
        expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('mockrefreshtoken123');
      });
    });
  });
});
