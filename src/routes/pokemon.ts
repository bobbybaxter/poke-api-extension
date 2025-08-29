import express, { NextFunction, Request, Response } from 'express';
import PokemonController from '../controllers/pokemon/PokemonController';
import HttpClient from '../services/HttpClient';

const router = express.Router();
const pokemonController = new PokemonController(new HttpClient());

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
  const pokemon = await pokemonController.listAllPokemon();

  res.json(pokemon);
});

router.get('/:idOrName', async function (req: Request, res: Response, next: NextFunction) {
  const pokemon = await pokemonController.getPokemonByIdOrName(req.params.idOrName);

  res.json(pokemon);
});

export default router;
