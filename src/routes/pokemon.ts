import express, { NextFunction, Request, Response } from 'express';
import PokemonController from '../controllers/pokemon/PokemonController';
import { validateParams } from '../middleware/validation';
import HttpClient from '../services/HttpClient';
import { pokemonIdOrNameSchema } from '../validators/pokemon.schemas';

const router = express.Router();
const pokemonController = new PokemonController(new HttpClient());

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
  try {
    const pokemon = await pokemonController.listAllPokemon();
    res.json(pokemon);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/:idOrName',
  validateParams(pokemonIdOrNameSchema),
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const pokemon = await pokemonController.getPokemonByIdOrName(req.params.idOrName);
      res.json(pokemon);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
