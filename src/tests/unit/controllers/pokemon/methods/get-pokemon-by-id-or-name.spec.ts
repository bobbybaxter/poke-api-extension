import { vi } from 'vitest';
import { getPokemonByIdOrName } from '../../../../../controllers/pokemon/methods';
import HttpClient from '../../../../../services/HttpClient';
import { mockModules } from '../../../../helpers/mock-modules';

describe('controllers/pokemon/methods/getPokemonByIdOrName', () => {
  let MockHttpClient: new () => HttpClient;

  beforeAll(async () => {
    const mockHttpClient = {
      default: vi.fn().mockImplementation(() => ({
        get: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Pikachu' } }),
      })),
    };

    [MockHttpClient] = await mockModules([['src/services/HttpClient', mockHttpClient]]);
  });

  it('should return the correct pokemon', async () => {
    const pokemon = await getPokemonByIdOrName({
      baseUrl: 'https://pokeapi.co/api/v2/',
      httpClient: new MockHttpClient(),
      idOrName: '1',
    });

    expect(pokemon).toEqual({ id: 1, name: 'Pikachu' });
  });
});
