import express, { NextFunction, Request, Response } from 'express';
import HttpClientController from '../controllers/http-client/HttpClientController';
import PokemonController from '../controllers/pokemon/PokemonController';

const router = express.Router();
const pokemonController = new PokemonController(new HttpClientController());

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
  const pokemon = await pokemonController.listAllPokemon();

  res.json(pokemon);
});

router.get('/:idOrName', async function (req: Request, res: Response, next: NextFunction) {
  const pokemon = await pokemonController.getPokemonByIdOrName(req.params.idOrName);

  res.json(pokemon);
});

export default router;
