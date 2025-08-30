import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { NextFunction, Request, Response } from 'express';

const ajv = new Ajv();
addFormats(ajv);

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export function validateParams<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate(req.params);

    if (!valid) {
      const errors: ValidationError[] =
        validate.errors?.map((error) => ({
          field: error.instancePath.replace('/', '') || error.params?.missingProperty || 'unknown',
          message: error.message || 'Validation failed',
          value: error.data,
        })) || [];

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}

export function validateBody<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate(req.body);

    if (!valid) {
      const errors: ValidationError[] =
        validate.errors?.map((error) => ({
          field: error.instancePath.replace('/', '') || error.params?.missingProperty || 'unknown',
          message: error.message || 'Validation failed',
          value: error.data,
        })) || [];

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}

export function validateQuery<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate(req.query);

    if (!valid) {
      const errors: ValidationError[] =
        validate.errors?.map((error) => ({
          field: error.instancePath.replace('/', '') || error.params?.missingProperty || 'unknown',
          message: error.message || 'Validation failed',
          value: error.data,
        })) || [];

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
}
