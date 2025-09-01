import { NextFunction, Request, Response } from 'express';
import { Mock, vi } from 'vitest';
import { AppError, errorHandler } from '../../../middleware/error-handler';

describe('middleware/error-handler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockJson: Mock;
  let mockStatus: Mock;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    req = {
      path: '/test-path',
      method: 'GET',
    };
    res = {
      status: mockStatus,
      json: mockJson,
    };
    next = vi.fn();

    // Mock console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('happy path', () => {
    it('should handle error with custom status code and message', () => {
      const error: AppError = new Error('Custom error message');
      error.statusCode = 400;

      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Custom error message',
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', {
        message: 'Custom error message',
        stack: error.stack,
        statusCode: 400,
        path: '/test-path',
        method: 'GET',
      });
    });

    it('should include stack trace in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error: AppError = new Error('Development error');
      error.statusCode = 500;

      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Development error',
        stack: error.stack,
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error: AppError = new Error('Production error');
      error.statusCode = 500;

      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Production error',
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('default behavior', () => {
    it('should use default status code 500 when not provided', () => {
      const error: AppError = new Error('Error without status code');

      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Error without status code',
      });
    });

    it('should use default message "Internal Server Error" when error message is empty', () => {
      const error: AppError = new Error('');
      error.statusCode = 400;

      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });

    it('should handle error with both missing status code and message', () => {
      const error: AppError = new Error('');

      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });
  });

  describe('logging behavior', () => {
    it('should log error details to console', () => {
      const error: AppError = new Error('Test error');
      error.statusCode = 404;

      errorHandler(error, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', {
        message: 'Test error',
        stack: error.stack,
        statusCode: 404,
        path: '/test-path',
        method: 'GET',
      });
    });

    it('should log with different request details', () => {
      req = {
        ...req,
        path: '/different-path',
        method: 'POST',
      };

      const error: AppError = new Error('Another error');
      error.statusCode = 422;

      errorHandler(error, req as Request, res as Response, next);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', {
        message: 'Another error',
        stack: error.stack,
        statusCode: 422,
        path: '/different-path',
        method: 'POST',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle error with isOperational property', () => {
      const error: AppError = new Error('Operational error');
      error.statusCode = 400;
      error.isOperational = true;

      errorHandler(error, req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Operational error',
      });
    });

    it('should handle undefined NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const error: AppError = new Error('Undefined env error');

      errorHandler(error, req as Request, res as Response, next);

      expect(mockJson).toHaveBeenCalledWith({
        error: 'Undefined env error',
      });
      // Should not include stack when NODE_ENV is undefined (not development)

      process.env.NODE_ENV = originalEnv;
    });
  });
});
