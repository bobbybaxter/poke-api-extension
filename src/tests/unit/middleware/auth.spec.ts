import { NextFunction, Request, Response } from 'express';
import { Mock, vi } from 'vitest';
import { mockModules } from '../../helpers/mock-modules';

describe('middleware/auth', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockJson: Mock;
  let mockStatus: Mock;
  let mockUserController: {
    findUserById: Mock;
  };
  let mockTokenService: {
    verifyAccessToken: Mock;
  };
  let auth: (req: Request, res: Response, next: NextFunction) => Promise<Response | undefined>;

  beforeAll(async () => {
    mockUserController = {
      findUserById: vi.fn(),
    };

    mockTokenService = {
      verifyAccessToken: vi.fn(),
    };

    const mockAppDataSource = {
      getRepository: vi.fn().mockReturnValue({}),
    };

    await mockModules([
      ['src/controllers/user/UserController', { default: vi.fn().mockImplementation(() => mockUserController) }],
      ['src/services/TokenService', { tokenService: mockTokenService }],
      ['src/mysql/data-source', { AppDataSource: mockAppDataSource }],
      ['src/mysql/entity/user', { User: vi.fn() }],
    ]);

    const authModule = await import('../../../middleware/auth');
    auth = authModule.auth;
  });

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    req = {
      headers: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
    };
    next = vi.fn();

    vi.clearAllMocks();
  });

  describe('happy path', () => {
    it('should call next() when valid token and user exists', async () => {
      const mockPayload = { sub: 'user123' };
      const mockUser = { id: 'user123', username: 'testuser' };

      req.headers = { authorization: 'Bearer valid-token' };
      mockTokenService.verifyAccessToken.mockReturnValue(mockPayload);
      mockUserController.findUserById.mockResolvedValue(mockUser);

      await auth(req as Request, res as Response, next);

      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserController.findUserById).toHaveBeenCalledWith('user123');
      expect(next).toHaveBeenCalledTimes(1);
      expect(mockStatus).not.toHaveBeenCalled();
    });
  });

  describe('sad path', () => {
    it('should return 401 when no authorization header is provided', async () => {
      req.headers = {};

      await auth(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is empty', async () => {
      req.headers = { authorization: '' };

      await auth(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Missing Bearer token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not contain Bearer token', async () => {
      req.headers = { authorization: 'Basic some-token' };
      mockTokenService.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token format');
      });

      await auth(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification fails', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      mockTokenService.verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await auth(req as Request, res as Response, next);

      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith('invalid-token');
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not found', async () => {
      const mockPayload = { sub: 'nonexistent-user' };

      req.headers = { authorization: 'Bearer valid-token' };
      mockTokenService.verifyAccessToken.mockReturnValue(mockPayload);
      mockUserController.findUserById.mockResolvedValue(null);

      await auth(req as Request, res as Response, next);

      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserController.findUserById).toHaveBeenCalledWith('nonexistent-user');
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when findUserById throws an error', async () => {
      const mockPayload = { sub: 'user123' };

      req.headers = { authorization: 'Bearer valid-token' };
      mockTokenService.verifyAccessToken.mockReturnValue(mockPayload);
      mockUserController.findUserById.mockRejectedValue(new Error('Database error'));

      await auth(req as Request, res as Response, next);

      expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockUserController.findUserById).toHaveBeenCalledWith('user123');
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
