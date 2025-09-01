import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { Mock, vi } from 'vitest';
import { validateBody, validateParams, validateQuery, ValidationError } from '../../../middleware/validation';

describe('middleware/validation', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockJson: Mock;
  let mockStatus: Mock;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });

    req = {
      params: {},
      body: {},
      query: {},
    };
    res = {
      status: mockStatus,
      json: mockJson,
    };
    next = vi.fn();

    vi.clearAllMocks();
  });

  describe('validateParams', () => {
    interface TestParams {
      id: string;
      name?: string;
    }

    const testSchema: JSONSchemaType<TestParams> = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string', nullable: true },
      },
      required: ['id'],
      additionalProperties: false,
    };

    describe('happy path', () => {
      it('should call next() when params are valid', () => {
        req.params = { id: '123' };

        const middleware = validateParams(testSchema);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
      });

      it('should call next() when params are valid with optional fields', () => {
        req.params = { id: '123', name: 'test' };

        const middleware = validateParams(testSchema);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
      });
    });

    describe('sad path', () => {
      it('should return 400 when required param is missing', () => {
        req.params = {};

        const middleware = validateParams(testSchema);
        middleware(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: [
            {
              field: 'id',
              message: "must have required property 'id'",
              value: undefined,
            },
          ],
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 400 when param has wrong type', () => {
        req.params = { id: 123 as unknown as string };

        const middleware = validateParams(testSchema);
        middleware(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: [
            {
              field: 'id',
              message: 'must be string',
              value: undefined,
            },
          ],
        });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('validateBody', () => {
    interface TestBody {
      email: string;
      age?: number;
    }

    const testSchema: JSONSchemaType<TestBody> = {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        age: { type: 'number', nullable: true },
      },
      required: ['email'],
      additionalProperties: false,
    };

    describe('happy path', () => {
      it('should call next() when body is valid', () => {
        req.body = { email: 'test@example.com' };

        const middleware = validateBody(testSchema);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
      });

      it('should call next() when body is valid with optional fields', () => {
        req.body = { email: 'test@example.com', age: 25 };

        const middleware = validateBody(testSchema);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
      });
    });

    describe('sad path', () => {
      it('should return 400 when required field is missing', () => {
        req.body = {};

        const middleware = validateBody(testSchema);
        middleware(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: [
            {
              field: 'email',
              message: "must have required property 'email'",
              value: undefined,
            },
          ],
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 400 when email format is invalid', () => {
        req.body = { email: 'invalid-email' };

        const middleware = validateBody(testSchema);
        middleware(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: [
            {
              field: 'email',
              message: 'must match format "email"',
              value: undefined,
            },
          ],
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 400 with multiple validation errors', () => {
        req.body = { email: 'invalid-email', age: 'not-a-number' };

        const middleware = validateBody(testSchema);
        middleware(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: expect.arrayContaining([
            expect.objectContaining({
              field: 'email',
              message: 'must match format "email"',
              value: undefined,
            }),
          ]),
        });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('validateQuery', () => {
    interface TestQuery {
      page?: string;
      limit?: string;
    }

    const testSchema: JSONSchemaType<TestQuery> = {
      type: 'object',
      properties: {
        page: { type: 'string', nullable: true },
        limit: { type: 'string', nullable: true },
      },
      required: [],
      additionalProperties: false,
    };

    describe('happy path', () => {
      it('should call next() when query is valid', () => {
        req.query = { page: '1', limit: '10' };

        const middleware = validateQuery(testSchema);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
      });

      it('should call next() when query is empty', () => {
        req.query = {};

        const middleware = validateQuery(testSchema);
        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
      });
    });

    describe('sad path', () => {
      it('should return 400 when query param has wrong type', () => {
        // Simulate express query parsing where a string is provided but schema expects number
        req.query = { page: 'invalid-number' };

        const numberSchema: JSONSchemaType<{ page?: number }> = {
          type: 'object',
          properties: {
            page: { type: 'number', nullable: true },
          },
          required: [],
          additionalProperties: false,
        };

        const middleware = validateQuery(numberSchema);
        middleware(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: [
            {
              field: 'page',
              message: 'must be number',
              value: undefined,
            },
          ],
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 400 when additional properties are provided', () => {
        req.query = { page: '1', invalidParam: 'value' };

        const middleware = validateQuery(testSchema);
        middleware(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Validation failed',
          details: [
            {
              field: 'unknown',
              message: 'must NOT have additional properties',
              value: undefined,
            },
          ],
        });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle validation errors without instancePath', () => {
      interface SimpleSchema {
        required: string;
      }

      const schema: JSONSchemaType<SimpleSchema> = {
        type: 'object',
        properties: {
          required: { type: 'string' },
        },
        required: ['required'],
        additionalProperties: false,
      };

      req.body = {};

      const middleware = validateBody(schema);
      middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [
          {
            field: 'required',
            message: "must have required property 'required'",
            value: undefined,
          },
        ],
      });
    });

    it('should handle errors without message', () => {
      // This test verifies the middleware handles edge cases in validation error processing
      interface TestSchema {
        field: string;
      }

      const schema: JSONSchemaType<TestSchema> = {
        type: 'object',
        properties: {
          field: { type: 'string' },
        },
        required: ['field'],
        additionalProperties: false,
      };

      req.body = { field: 123 };

      const middleware = validateBody(schema);
      middleware(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'field',
            message: expect.any(String),
          }),
        ]),
      });
    });
  });
});
