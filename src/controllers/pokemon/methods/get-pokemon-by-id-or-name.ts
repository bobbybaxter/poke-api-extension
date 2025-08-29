import HttpClient from '../../../services/HttpClient';
import { Pokemon } from '../../../types/pokemon.types';

export async function getPokemonByIdOrName({
  baseUrl,
  httpClient,
  idOrName,
}: {
  baseUrl: string;
  httpClient: HttpClient;
  idOrName: string;
}) {
  const response = await httpClient.get<Pokemon>(`${baseUrl}/pokemon/${idOrName}`);

  return response.data;
}
