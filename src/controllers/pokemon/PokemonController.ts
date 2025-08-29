import HttpClientController from '../http-client/HttpClientController';
import * as methods from './methods/index';

export default class PokemonController {
  private baseUrl: string;

  constructor(private httpClient: HttpClientController) {
    this.baseUrl = 'https://pokeapi.co/api/v2/';
  }

  async getPokemonByIdOrName(idOrName: string) {
    return await methods.getPokemonByIdOrName({ baseUrl: this.baseUrl, httpClient: this.httpClient, idOrName });
  }

  async listAllPokemon() {
    return await methods.listAllPokemon({ baseUrl: this.baseUrl, httpClient: this.httpClient });
  }
}
