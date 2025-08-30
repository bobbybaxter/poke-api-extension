import { JSONSchemaType } from 'ajv';

export const trainerIdParamsSchema: JSONSchemaType<{ id: string }> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[0-9]+$',
      minLength: 1,
    },
  },
  required: ['id'],
  additionalProperties: false,
};

export const trainerCreateBodySchema: JSONSchemaType<{
  name: string;
  class: string;
}> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-zA-Z0-9\\s\\-\\.]+$',
    },
    class: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9\\s\\-]+$',
    },
  },
  required: ['name', 'class'],
  additionalProperties: false,
};

// Schema for trainer update request body
export const trainerUpdateBodySchema: JSONSchemaType<{
  name?: string;
  class?: string;
}> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-zA-Z0-9\\s\\-\\.]+$',
      nullable: true,
    },
    class: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9\\s\\-]+$',
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
};
