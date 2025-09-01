import { Server } from 'http';
import { Trainer } from 'src/mysql/entity/trainer';
import { mockModules } from 'src/tests/helpers/mock-modules';
import supertest from 'supertest';
import { vi } from 'vitest';

describe('routes/trainer', () => {
  let request: ReturnType<typeof supertest>, server: Server;
  let mockTrainerController: {
    getTrainers: ReturnType<typeof vi.fn>;
    getTrainer: ReturnType<typeof vi.fn>;
    createTrainer: ReturnType<typeof vi.fn>;
    updateTrainer: ReturnType<typeof vi.fn>;
    deleteTrainer: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
    // Mock data for list all trainers endpoint
    const mockTrainersList = [
      { id: 1, name: 'Ash Ketchum', class: 'Trainer', badges: [], pokemon: [] },
      { id: 2, name: 'Misty', class: 'Gym Leader', badges: [], pokemon: [] },
    ];

    // Mock data for get trainer by id endpoint
    const mockTrainerData: Trainer = {
      id: 1,
      name: 'Ash Ketchum',
      class: 'Trainer',
      badges: [],
      pokemon: [],
    };

    // Mock data for create trainer endpoint
    const mockCreatedTrainer: Trainer = {
      id: 3,
      name: 'Brock',
      class: 'Gym Leader',
      badges: [],
      pokemon: [],
    };

    // Mock data for update trainer endpoint
    const mockUpdatedTrainer: Trainer = {
      id: 1,
      name: 'Ash Ketchum Updated',
      class: 'Pokemon Master',
      badges: [],
      pokemon: [],
    };

    mockTrainerController = {
      getTrainers: vi.fn().mockResolvedValue(mockTrainersList),
      getTrainer: vi.fn().mockResolvedValue(mockTrainerData),
      createTrainer: vi.fn().mockResolvedValue(mockCreatedTrainer),
      updateTrainer: vi.fn().mockResolvedValue(mockUpdatedTrainer),
      deleteTrainer: vi.fn().mockResolvedValue(mockTrainerData),
    };

    await mockModules([
      [
        'src/controllers/trainer/TrainerController',
        { default: vi.fn().mockImplementation(() => mockTrainerController) },
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
        const route = '/trainer';
        const expectedResponse = [
          { id: 1, name: 'Ash Ketchum', class: 'Trainer', badges: [], pokemon: [] },
          { id: 2, name: 'Misty', class: 'Gym Leader', badges: [], pokemon: [] },
        ];

        const response = await request.get(route).expect(200);

        expect(response.body).toEqual(expectedResponse);
        expect(mockTrainerController.getTrainers).toHaveBeenCalledTimes(1);
      });
    });

    describe('GET /:id', () => {
      it('should return a 200 with the correct data', async () => {
        const route = '/trainer/1';

        const response = await request.get(route).expect(200);

        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('name', 'Ash Ketchum');
        expect(response.body).toHaveProperty('class', 'Trainer');
        expect(mockTrainerController.getTrainer).toHaveBeenCalledWith(1);
        expect(mockTrainerController.getTrainer).toHaveBeenCalledTimes(1);
      });
    });

    describe('POST /', () => {
      it('should return a 200 with the created trainer data', async () => {
        const route = '/trainer';
        const requestBody = {
          name: 'Brock',
          class: 'Gym Leader',
        };

        const response = await request.post(route).send(requestBody).expect(200);

        expect(response.body).toHaveProperty('id', 3);
        expect(response.body).toHaveProperty('name', 'Brock');
        expect(response.body).toHaveProperty('class', 'Gym Leader');
        expect(mockTrainerController.createTrainer).toHaveBeenCalledWith(requestBody);
        expect(mockTrainerController.createTrainer).toHaveBeenCalledTimes(1);
      });
    });

    describe('PATCH /:id', () => {
      it('should return a 200 with the updated trainer data', async () => {
        const route = '/trainer/1';
        const requestBody = {
          name: 'Ash Ketchum Updated',
          class: 'Pokemon Master',
        };

        const response = await request.patch(route).send(requestBody).expect(200);

        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('name', 'Ash Ketchum Updated');
        expect(response.body).toHaveProperty('class', 'Pokemon Master');
        expect(mockTrainerController.getTrainer).toHaveBeenCalledWith(1);
        expect(mockTrainerController.updateTrainer).toHaveBeenCalledWith(1, requestBody);
        expect(mockTrainerController.updateTrainer).toHaveBeenCalledTimes(1);
      });
    });

    describe('DELETE /:id', () => {
      it('should return a 200 with the deleted trainer data', async () => {
        const route = '/trainer/1';

        const response = await request.delete(route).expect(200);

        expect(response.body).toHaveProperty('id', 1);
        expect(response.body).toHaveProperty('name', 'Ash Ketchum');
        expect(response.body).toHaveProperty('class', 'Trainer');
        expect(mockTrainerController.deleteTrainer).toHaveBeenCalledWith(1);
        expect(mockTrainerController.deleteTrainer).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('sad path', () => {
    describe('GET /', () => {
      it('should return a 500 when getTrainers throws an error', async () => {
        // Mock the controller method to throw an error
        mockTrainerController.getTrainers.mockRejectedValueOnce(new Error('Internal Server Error'));

        const route = '/trainer';
        const response = await request.get(route).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockTrainerController.getTrainers).toHaveBeenCalledTimes(1);
      });
    });

    describe('GET /:id', () => {
      it('should return a 500 when getTrainer throws an error', async () => {
        // Mock the controller method to throw an error
        mockTrainerController.getTrainer.mockRejectedValueOnce(new Error('Internal Server Error'));

        const route = '/trainer/1';
        const response = await request.get(route).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockTrainerController.getTrainer).toHaveBeenCalledWith(1);
        expect(mockTrainerController.getTrainer).toHaveBeenCalledTimes(1);
      });

      it('should return a 404 when getTrainer returns null (trainer not found)', async () => {
        // Mock the controller method to return null (trainer not found)
        mockTrainerController.getTrainer.mockResolvedValueOnce(null);

        const route = '/trainer/999';
        const response = await request.get(route).expect(404);

        expect(response.body).toHaveProperty('error', 'Trainer not found');
        expect(mockTrainerController.getTrainer).toHaveBeenCalledWith(999);
        expect(mockTrainerController.getTrainer).toHaveBeenCalledTimes(1);
      });
    });

    describe('POST /', () => {
      it('should return a 500 when createTrainer throws an error', async () => {
        // Mock the controller method to throw an error
        mockTrainerController.createTrainer.mockRejectedValueOnce(new Error('Internal Server Error'));

        const route = '/trainer';
        const requestBody = {
          name: 'Brock',
          class: 'Gym Leader',
        };

        const response = await request.post(route).send(requestBody).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockTrainerController.createTrainer).toHaveBeenCalledWith(requestBody);
        expect(mockTrainerController.createTrainer).toHaveBeenCalledTimes(1);
      });
    });

    describe('PATCH /:id', () => {
      it('should return a 500 when updateTrainer throws an error', async () => {
        // Mock the controller method to throw an error first for getTrainer (called before update)
        mockTrainerController.getTrainer.mockResolvedValueOnce({ id: 1, name: 'Ash', class: 'Trainer' });
        mockTrainerController.updateTrainer.mockRejectedValueOnce(new Error('Internal Server Error'));

        const route = '/trainer/1';
        const requestBody = {
          name: 'Ash Ketchum Updated',
          class: 'Pokemon Master',
        };

        const response = await request.patch(route).send(requestBody).expect(500);

        expect(response.body).toHaveProperty('error', 'Internal Server Error');
        expect(mockTrainerController.updateTrainer).toHaveBeenCalledWith(1, requestBody);
        expect(mockTrainerController.updateTrainer).toHaveBeenCalledTimes(1);
      });

      it('should return a 404 when getTrainer returns null (trainer not found)', async () => {
        // Mock the controller method to return null (trainer not found)
        mockTrainerController.getTrainer.mockResolvedValueOnce(null);

        const route = '/trainer/999';
        const requestBody = {
          name: 'Updated Name',
          class: 'Updated Class',
        };

        const response = await request.patch(route).send(requestBody).expect(404);

        expect(response.body).toHaveProperty('error', 'Trainer not found');
        expect(mockTrainerController.getTrainer).toHaveBeenCalledWith(999);
        expect(mockTrainerController.getTrainer).toHaveBeenCalledTimes(1);
        // updateTrainer should not be called when trainer is not found
        expect(mockTrainerController.updateTrainer).not.toHaveBeenCalled();
      });
    });

    describe('DELETE /:id', () => {
      it('should return a 500 when deleteTrainer throws an error', async () => {
        // Mock the controller method to throw an error
        mockTrainerController.deleteTrainer.mockRejectedValueOnce(new Error('Delete trainer failed'));

        const route = '/trainer/1';
        const response = await request.delete(route).expect(500);

        expect(response.body).toHaveProperty('error', 'Delete trainer failed');
        expect(mockTrainerController.deleteTrainer).toHaveBeenCalledWith(1);
        expect(mockTrainerController.deleteTrainer).toHaveBeenCalledTimes(1);
      });
    });
  });
});
