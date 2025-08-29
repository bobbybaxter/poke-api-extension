import { Pokemon } from '../../../models/pokemon.types';
import HttpClientController from '../../http-client/HttpClientController';

export async function getPokemonByIdOrName({
  baseUrl,
  httpClient,
  idOrName,
}: {
  baseUrl: string;
  httpClient: HttpClientController;
  idOrName: string;
}) {
  const response = await httpClient.get<Pokemon>(`${baseUrl}/pokemon/${idOrName}`);

  return response.data;
}
