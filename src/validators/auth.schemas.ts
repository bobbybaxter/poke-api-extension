import { JSONSchemaType } from 'ajv';

export const registerBodySchema: JSONSchemaType<{
  username: string;
  email: string;
  password: string;
}> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$',
    },
    email: {
      type: 'string',
      format: 'email',
      maxLength: 255,
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 128,
    },
  },
  required: ['username', 'email', 'password'],
  additionalProperties: false,
};

export const loginBodySchema: JSONSchemaType<{
  identifier: string;
  password: string;
}> = {
  type: 'object',
  properties: {
    identifier: {
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    password: {
      type: 'string',
      minLength: 1,
      maxLength: 128,
    },
  },
  required: ['identifier', 'password'],
  additionalProperties: false,
};
