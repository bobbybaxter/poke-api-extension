import { Server } from 'http';
import { mockModules } from 'src/tests/helpers/mock-modules';
import { Pokemon } from 'src/types/pokemon.types';
import supertest from 'supertest';
import { vi } from 'vitest';

describe('routes/pokemon', () => {
  let request: ReturnType<typeof supertest>, server: Server;
  let mockPokemonController: {
    listAllPokemon: ReturnType<typeof vi.fn>;
    getPokemonByIdOrName: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    // Mock data for list all pokemon endpoint
    const mockPokemonList = [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
    ];

    // Mock data for get pokemon by id endpoint
    const mockPokemonData: Pokemon = {
      id: 1,
      name: 'bulbasaur',
      base_experience: 64,
      height: 7,
      is_default: true,
      order: 1,
      weight: 69,
      abilities: [
        {
          is_hidden: false,
          slot: 1,
          ability: { name: 'overgrow', url: 'https://pokeapi.co/api/v2/ability/65/' },
        },
      ],
      forms: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-form/1/' }],
      game_indices: [],
      held_items: [],
      location_area_encounters: 'https://pokeapi.co/api/v2/pokemon/1/encounters',
      moves: [],
      sprites: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
        front_shiny: null,
        front_female: null,
        front_shiny_female: null,
        back_default: null,
        back_shiny: null,
        back_female: null,
        back_shiny_female: null,
        versions: {} as Pokemon['sprites']['versions'],
      },
      cries: {
        legacy: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/1.ogg',
        latest: 'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/1.ogg',
      },
      species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
      stats: [
        {
          base_stat: 45,
          effort: 0,
          stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' },
        },
      ],
      types: [
        {
          slot: 1,
          type: { name: 'grass', url: 'https://pokeapi.co/api/v2/type/12/' },
        },
      ],
      past_types: [],
    };

    mockPokemonController = {
      listAllPokemon: vi.fn().mockResolvedValue(mockPokemonList),
      getPokemonByIdOrName: vi.fn().mockResolvedValue(mockPokemonData),
    };

    await mockModules([
      [
        'src/controllers/pokemon/PokemonController',
        { default: vi.fn().mockImplementation(() => mockPokemonController) },
      ],
    ]);

    const setupServer = await import('src/tests/helpers/setup-server');
    request = setupServer.request;
    server = setupServer.server;
  });

  afterAll(async () => {
    server.close();
  });

  describe('happy path', () => {
    describe('GET /', () => {
      it('should return a 200 with the correct data', async () => {
        const route = '/pokemon';
        const expectedResponse = [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ];

        const response = await request.get(route).expect(200);

        expect(response.body).toEqual(expectedResponse);
        expect(mockPokemonController.listAllPokemon).toHaveBeenCalledTimes(1);
      });
    });

    describe('GET /:idOrName', () => {
      it('should return a 200 with the correct data', async () => {
        const route = '/pokemon/1';

        const response = await request.get(route).expect(200);

        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('name', 'bulbasaur');
        expect(response.body).toHaveProperty('base_experience', 64);
        expect(mockPokemonController.getPokemonByIdOrName).toHaveBeenCalledWith('1');
        expect(mockPokemonController.getPokemonByIdOrName).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('sad path', () => {
    describe('GET /', () => {
      it('should return a 500 when listAllPokemon throws an error', async () => {
        // Mock the controller method to throw an error
        mockPokemonController.listAllPokemon.mockRejectedValueOnce(new Error('Internal Server Error'));

        const route = '/pokemon';
        const response = await request.get(route).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockPokemonController.listAllPokemon).toHaveBeenCalledTimes(1);
      });
    });

    describe('GET /:idOrName', () => {
      it('should return a 500 when getPokemonByIdOrName throws an error', async () => {
        // Mock the controller method to throw an error
        mockPokemonController.getPokemonByIdOrName.mockRejectedValueOnce(new Error('Internal Server Error'));

        const route = '/pokemon/1';
        const response = await request.get(route).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockPokemonController.getPokemonByIdOrName).toHaveBeenCalledWith('1');
        expect(mockPokemonController.getPokemonByIdOrName).toHaveBeenCalledTimes(1);
      });
    });
  });
});
