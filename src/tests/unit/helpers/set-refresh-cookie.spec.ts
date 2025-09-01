import { Response } from 'express';
import { Mock, vi } from 'vitest';
import { setRefreshCookie } from '../../../helpers/set-refresh-cookie';

describe('helpers/setRefreshCookie', () => {
  let mockResponse: Response;
  let mockCookie: Mock;

  beforeEach(() => {
    mockCookie = vi.fn();
    mockResponse = {
      cookie: mockCookie,
    } as unknown as Response;
  });

  describe('when setting a refresh cookie', () => {
    const testToken = 'test-refresh-token-123';

    beforeEach(() => {
      setRefreshCookie(mockResponse, testToken);
    });

    it('should call res.cookie with the correct cookie name and token', () => {
      expect(mockCookie).toHaveBeenCalledWith('refresh_token', testToken, expect.any(Object));
    });

    it('should set httpOnly to true for security', () => {
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        testToken,
        expect.objectContaining({
          httpOnly: true,
        }),
      );
    });

    it('should set secure to true for HTTPS requirement', () => {
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        testToken,
        expect.objectContaining({
          secure: true,
        }),
      );
    });

    it('should set sameSite to strict for CSRF protection', () => {
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        testToken,
        expect.objectContaining({
          sameSite: 'strict',
        }),
      );
    });

    it('should set path to /refresh', () => {
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        testToken,
        expect.objectContaining({
          path: '/refresh',
        }),
      );
    });

    it('should set maxAge to one week in milliseconds', () => {
      const expectedWeekMs = 7 * 24 * 60 * 60 * 1000; // 604800000
      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        testToken,
        expect.objectContaining({
          maxAge: expectedWeekMs,
        }),
      );
    });

    it('should call res.cookie exactly once', () => {
      expect(mockCookie).toHaveBeenCalledTimes(1);
    });

    it('should set all cookie options correctly in a single call', () => {
      const expectedWeekMs = 7 * 24 * 60 * 60 * 1000;
      expect(mockCookie).toHaveBeenCalledWith('refresh_token', testToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/refresh',
        maxAge: expectedWeekMs,
      });
    });
  });

  describe('when called with different tokens', () => {
    it('should handle empty string token', () => {
      const emptyToken = '';
      setRefreshCookie(mockResponse, emptyToken);

      expect(mockCookie).toHaveBeenCalledWith('refresh_token', emptyToken, expect.any(Object));
    });

    it('should handle long token string', () => {
      const longToken = 'a'.repeat(1000);
      setRefreshCookie(mockResponse, longToken);

      expect(mockCookie).toHaveBeenCalledWith('refresh_token', longToken, expect.any(Object));
    });

    it('should handle token with special characters', () => {
      const specialToken = 'token-with.special_chars@domain.com!#$%';
      setRefreshCookie(mockResponse, specialToken);

      expect(mockCookie).toHaveBeenCalledWith('refresh_token', specialToken, expect.any(Object));
    });
  });

  describe('maxAge calculation', () => {
    it('should calculate one week correctly', () => {
      const testToken = 'test-token';
      setRefreshCookie(mockResponse, testToken);

      // Verify the calculation: 7 days * 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
      const expectedMs = 7 * 24 * 60 * 60 * 1000;
      expect(expectedMs).toBe(604800000); // One week in milliseconds

      expect(mockCookie).toHaveBeenCalledWith(
        'refresh_token',
        testToken,
        expect.objectContaining({
          maxAge: expectedMs,
        }),
      );
    });
  });
});
