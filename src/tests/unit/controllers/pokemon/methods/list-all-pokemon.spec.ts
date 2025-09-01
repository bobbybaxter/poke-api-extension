import { Mock, vi } from 'vitest';
import { AllPokemonData, listAllPokemon } from '../../../../../controllers/pokemon/methods/list-all-pokemon';
import HttpClient from '../../../../../services/HttpClient';
import { mockModules } from '../../../../helpers/mock-modules';

describe('controllers/pokemon/methods/listAllPokemon', () => {
  let MockHttpClient: new () => HttpClient, httpClientGet: Mock;

  beforeAll(async () => {
    httpClientGet = vi.fn();

    const mockHttpClient = {
      default: vi.fn().mockImplementation(() => ({
        get: httpClientGet,
      })),
    };

    [MockHttpClient] = await mockModules([['src/services/HttpClient', mockHttpClient]]);
  });

  describe('when there is only one page', () => {
    let result: AllPokemonData[];

    beforeEach(async () => {
      httpClientGet = vi.fn().mockResolvedValue({
        data: {
          count: 2,
          next: null,
          previous: null,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          ],
        },
      });

      result = await listAllPokemon({
        baseUrl: 'https://pokeapi.co/api/v2',
        httpClient: new MockHttpClient(),
      });
    });

    it('should return all pokemon', async () => {
      expect(result).toEqual([
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      ]);
    });
  });

  describe('when there are multiple pages with two pages', () => {
    let result: AllPokemonData[];

    beforeEach(async () => {
      const page1Response = {
        data: {
          count: 4,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=2&limit=1000',
          previous: null,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          ],
        },
      };

      const page2Response = {
        data: {
          count: 4,
          next: null,
          previous: 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=1000',
          results: [
            { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
            { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
          ],
        },
      };

      httpClientGet = vi.fn().mockResolvedValueOnce(page1Response).mockResolvedValueOnce(page2Response);

      result = await listAllPokemon({
        baseUrl: 'https://pokeapi.co/api/v2',
        httpClient: new MockHttpClient(),
      });
    });

    it('should handle pagination and return all pokemon from multiple pages', async () => {
      expect(result).toEqual([
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
      ]);
    });

    it('should call httpClient.get twice for two pages', async () => {
      expect(httpClientGet).toHaveBeenCalledTimes(2);
      expect(httpClientGet).toHaveBeenNthCalledWith(1, 'https://pokeapi.co/api/v2/pokemon?limit=1000');
      expect(httpClientGet).toHaveBeenNthCalledWith(2, 'https://pokeapi.co/api/v2/pokemon?offset=2&limit=1000');
    });
  });

  describe('when there are no pokemon', () => {
    let result: AllPokemonData[];

    beforeEach(async () => {
      httpClientGet = vi.fn().mockResolvedValue({
        data: {
          count: 0,
          next: null,
          previous: null,
          results: [],
        },
      });

      result = await listAllPokemon({
        baseUrl: 'https://pokeapi.co/api/v2',
        httpClient: new MockHttpClient(),
      });
    });

    it('should return empty array when no pokemon are found', async () => {
      expect(result).toEqual([]);
    });

    it('should call httpClient.get once', async () => {
      expect(httpClientGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('when there are multiple pages with three pages', () => {
    let result: AllPokemonData[];

    beforeEach(async () => {
      const page1Response = {
        data: {
          count: 6,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=2&limit=1000',
          previous: null,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          ],
        },
      };

      const page2Response = {
        data: {
          count: 6,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=4&limit=1000',
          previous: 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=1000',
          results: [
            { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
            { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
          ],
        },
      };

      const page3Response = {
        data: {
          count: 6,
          next: null,
          previous: 'https://pokeapi.co/api/v2/pokemon?offset=2&limit=1000',
          results: [
            { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' },
            { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
          ],
        },
      };

      httpClientGet = vi
        .fn()
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response)
        .mockResolvedValueOnce(page3Response);

      result = await listAllPokemon({
        baseUrl: 'https://pokeapi.co/api/v2',
        httpClient: new MockHttpClient(),
      });
    });

    it('should handle multiple pages correctly with proper pagination flow', async () => {
      expect(result).toEqual([
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon/3/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' },
        { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
      ]);
    });

    it('should call httpClient.get three times for three pages', async () => {
      expect(httpClientGet).toHaveBeenCalledTimes(3);
      expect(httpClientGet).toHaveBeenNthCalledWith(1, 'https://pokeapi.co/api/v2/pokemon?limit=1000');
      expect(httpClientGet).toHaveBeenNthCalledWith(2, 'https://pokeapi.co/api/v2/pokemon?offset=2&limit=1000');
      expect(httpClientGet).toHaveBeenNthCalledWith(3, 'https://pokeapi.co/api/v2/pokemon?offset=4&limit=1000');
    });
  });
});
