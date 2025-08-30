import { JSONSchemaType } from 'ajv';

export const pokemonIdOrNameSchema: JSONSchemaType<{ idOrName: string }> = {
  type: 'object',
  properties: {
    idOrName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9\\-]+$',
    },
  },
  required: ['idOrName'],
  additionalProperties: false,
};
