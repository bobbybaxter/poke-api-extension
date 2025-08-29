import { buildUrlWithSearchParams } from '../../../helpers/buildUrlWithSearchParams';
import HttpClientController from '../../http-client/HttpClientController';

type AllPokemonData = {
  name: string;
  url: string;
};

type AllPokemonResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: AllPokemonData[];
};

export async function listAllPokemon({ baseUrl, httpClient }: { baseUrl: string; httpClient: HttpClientController }) {
  const allPokemon: AllPokemonData[] = [];
  let url: string | null = buildUrlWithSearchParams(`${baseUrl}/pokemon`, {
    limit: 1000,
  });

  while (url) {
    const response: { data: AllPokemonResponse } = await httpClient.get<AllPokemonResponse>(url);

    allPokemon.push(...response.data.results);
    url = response.data.next;
  }

  return allPokemon;
}
