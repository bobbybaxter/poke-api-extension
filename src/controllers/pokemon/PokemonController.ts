import HttpClient from '../../services/HttpClient';
import * as methods from './methods/index';

export default class PokemonController {
  private baseUrl: string;

  constructor(private httpClient: HttpClient) {
    this.baseUrl = 'https://pokeapi.co/api/v2/';
  }

  async getPokemonByIdOrName(idOrName: string) {
    return await methods.getPokemonByIdOrName({ baseUrl: this.baseUrl, httpClient: this.httpClient, idOrName });
  }

  async listAllPokemon() {
    return await methods.listAllPokemon({ baseUrl: this.baseUrl, httpClient: this.httpClient });
  }
}
