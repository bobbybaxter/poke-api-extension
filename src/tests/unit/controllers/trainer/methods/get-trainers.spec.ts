import { Repository } from 'typeorm';
import { Mock, vi } from 'vitest';
import { getTrainers } from '../../../../../controllers/trainer/methods/index';
import { Trainer } from '../../../../../mysql/entity/trainer';

describe('controllers/trainer/methods/getTrainers', () => {
  let mockTrainerRepository: Repository<Trainer>;
  let mockFind: Mock;

  beforeAll(() => {
    mockFind = vi.fn();

    mockTrainerRepository = {
      find: mockFind,
    } as unknown as Repository<Trainer>;
  });

  describe('when there are multiple trainers', () => {
    let result: Trainer[];

    const expectedTrainers: Trainer[] = [
      {
        id: 1,
        name: 'Ash Ketchum',
        class: 'Trainer',
        badges: [
          {
            id: 1,
            name: 'Boulder Badge',
            description: 'Pewter City Gym Badge',
            imageUrl: 'https://example.com/boulder-badge.png',
          },
        ],
        pokemon: [
          {
            id: 25,
            name: 'pikachu',
            url: 'https://pokeapi.co/api/v2/pokemon/25/',
          },
        ],
      },
      {
        id: 2,
        name: 'Misty',
        class: 'Gym Leader',
        badges: [],
        pokemon: [
          {
            id: 54,
            name: 'psyduck',
            url: 'https://pokeapi.co/api/v2/pokemon/54/',
          },
          {
            id: 121,
            name: 'starmie',
            url: 'https://pokeapi.co/api/v2/pokemon/121/',
          },
        ],
      },
    ];

    beforeEach(async () => {
      mockFind.mockResolvedValue(expectedTrainers);

      result = await getTrainers(mockTrainerRepository);
    });

    it('should return all trainers', () => {
      expect(result).toEqual(expectedTrainers);
    });

    it('should return correct number of trainers', () => {
      expect(result).toHaveLength(2);
    });

    it('should call repository.find once', () => {
      expect(mockFind).toHaveBeenCalledTimes(1);
    });

    it('should call repository.find without parameters', () => {
      expect(mockFind).toHaveBeenCalledWith();
    });
  });

  describe('when there are no trainers', () => {
    let result: Trainer[];

    beforeEach(async () => {
      mockFind.mockResolvedValue([]);

      result = await getTrainers(mockTrainerRepository);
    });

    it('should return empty array when no trainers exist', () => {
      expect(result).toEqual([]);
    });

    it('should return array with length 0', () => {
      expect(result).toHaveLength(0);
    });

    it('should call repository.find once', () => {
      expect(mockFind).toHaveBeenCalledTimes(1);
    });
  });

  describe('when there is only one trainer', () => {
    let result: Trainer[];

    const singleTrainer: Trainer[] = [
      {
        id: 1,
        name: 'Brock',
        class: 'Breeder',
        badges: [
          {
            id: 1,
            name: 'Boulder Badge',
            description: 'Pewter City Gym Badge',
            imageUrl: 'https://example.com/boulder-badge.png',
          },
        ],
        pokemon: [
          {
            id: 95,
            name: 'onix',
            url: 'https://pokeapi.co/api/v2/pokemon/95/',
          },
        ],
      },
    ];

    beforeEach(async () => {
      mockFind.mockResolvedValue(singleTrainer);

      result = await getTrainers(mockTrainerRepository);
    });

    it('should return array with single trainer', () => {
      expect(result).toEqual(singleTrainer);
    });

    it('should return array with length 1', () => {
      expect(result).toHaveLength(1);
    });

    it('should preserve trainer data correctly', () => {
      expect(result[0].name).toBe('Brock');
      expect(result[0].class).toBe('Breeder');
    });
  });

  describe('when trainers have varying data completeness', () => {
    let result: Trainer[];

    const variedTrainers: Trainer[] = [
      {
        id: 1,
        name: 'Complete Trainer',
        class: 'Elite Four',
        badges: [
          {
            id: 1,
            name: 'Badge 1',
            description: 'First badge',
            imageUrl: 'https://example.com/badge1.png',
          },
          {
            id: 2,
            name: 'Badge 2',
            description: 'Second badge',
            imageUrl: 'https://example.com/badge2.png',
          },
        ],
        pokemon: [
          {
            id: 1,
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon/1/',
          },
          {
            id: 4,
            name: 'charmander',
            url: 'https://pokeapi.co/api/v2/pokemon/4/',
          },
        ],
      },
      {
        id: 2,
        name: 'New Trainer',
        class: 'Beginner',
        badges: [],
        pokemon: [],
      },
    ];

    beforeEach(async () => {
      mockFind.mockResolvedValue(variedTrainers);

      result = await getTrainers(mockTrainerRepository);
    });

    it('should return trainers with varying data completeness', () => {
      expect(result).toEqual(variedTrainers);
    });

    it('should handle trainers with full data', () => {
      expect(result[0].badges).toHaveLength(2);
      expect(result[0].pokemon).toHaveLength(2);
    });

    it('should handle trainers with empty collections', () => {
      expect(result[1].badges).toHaveLength(0);
      expect(result[1].pokemon).toHaveLength(0);
    });
  });

  describe('when repository.find throws an error', () => {
    beforeEach(() => {
      mockFind.mockRejectedValue(new Error('Database connection failed'));
    });

    it('should throw the error from repository.find', async () => {
      await expect(getTrainers(mockTrainerRepository)).rejects.toThrow('Database connection failed');
    });

    it('should call repository.find before failing', async () => {
      try {
        await getTrainers(mockTrainerRepository);
      } catch {
        // Expected to throw
      }
      expect(mockFind).toHaveBeenCalledWith();
    });
  });

  describe('when there are many trainers', () => {
    let result: Trainer[];

    const manyTrainers: Trainer[] = Array.from({ length: 50 }, (_, index) => ({
      id: index + 1,
      name: `Trainer ${index + 1}`,
      class: index % 2 === 0 ? 'Trainer' : 'Gym Leader',
      badges: [],
      pokemon: [],
    }));

    beforeEach(async () => {
      mockFind.mockResolvedValue(manyTrainers);

      result = await getTrainers(mockTrainerRepository);
    });

    it('should return all trainers when there are many', () => {
      expect(result).toHaveLength(50);
    });

    it('should preserve order of trainers', () => {
      expect(result[0].name).toBe('Trainer 1');
      expect(result[49].name).toBe('Trainer 50');
    });

    it('should handle large datasets efficiently', () => {
      expect(result).toEqual(manyTrainers);
    });
  });
});
