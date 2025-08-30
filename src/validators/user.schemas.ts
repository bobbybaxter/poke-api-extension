import { JSONSchemaType } from 'ajv';

export const userIdParamsSchema: JSONSchemaType<{ id: string }> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
  },
  required: ['id'],
  additionalProperties: false,
};

export const userUpdateBodySchema: JSONSchemaType<{
  username?: string;
  email?: string;
}> = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$',
      nullable: true,
    },
    email: {
      type: 'string',
      format: 'email',
      maxLength: 255,
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
};
