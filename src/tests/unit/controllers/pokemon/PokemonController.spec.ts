import { vi } from 'vitest';
import PokemonController from '../../../../controllers/pokemon/PokemonController';
import HttpClient from '../../../../services/HttpClient';
import { mockModules } from '../../../helpers/mock-modules';

describe('controllers/pokemon/PokemonController', () => {
  let baseUrl: string,
    httpClientInstance: HttpClient,
    MockHttpClient: new () => HttpClient,
    mockMethods: Record<string, unknown>,
    pokemonController: PokemonController;

  beforeAll(async () => {
    baseUrl = 'https://pokeapi.co/api/v2/';
    mockMethods = {
      getPokemonByIdOrName: vi.fn(),
      listAllPokemon: vi.fn(),
    };

    const mockHttpClient = {
      default: vi.fn().mockImplementation(() => ({
        get: vi.fn(),
      })),
    };

    [MockHttpClient] = await mockModules([
      ['src/services/HttpClient', mockHttpClient],
      ['src/controllers/pokemon/methods/index', mockMethods],
    ]);

    httpClientInstance = new MockHttpClient();

    const { default: PokemonController } = await import('../../../../controllers/pokemon/PokemonController');
    pokemonController = new PokemonController(httpClientInstance);
  });

  describe('getPokemonByIdOrName', () => {
    it('should call getPokemonByIdOrName method', async () => {
      await pokemonController.getPokemonByIdOrName('1');
      expect(mockMethods.getPokemonByIdOrName).toHaveBeenCalledWith({
        baseUrl,
        httpClient: httpClientInstance,
        idOrName: '1',
      });
    });
  });

  describe('listAllPokemon', () => {
    it('should call listAllPokemon method', async () => {
      await pokemonController.listAllPokemon();
      expect(mockMethods.listAllPokemon).toHaveBeenCalledWith({
        baseUrl,
        httpClient: httpClientInstance,
      });
    });
  });
});
