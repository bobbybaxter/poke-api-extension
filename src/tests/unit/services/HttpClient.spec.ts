import axios from 'axios';
import { Mock, vi } from 'vitest';
import HttpClient from '../../../services/HttpClient';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('services/HttpClient', () => {
  let httpClient: HttpClient;
  let mockAxiosGet: Mock;

  beforeEach(() => {
    httpClient = new HttpClient();
    mockAxiosGet = vi.fn();
    mockedAxios.get = mockAxiosGet;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance of HttpClient', () => {
      expect(httpClient).toBeInstanceOf(HttpClient);
    });
  });

  describe('get', () => {
    it('should make a GET request with the provided URL', async () => {
      const url = 'https://api.example.com/data';
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosGet.mockResolvedValueOnce(mockResponse);

      const result = await httpClient.get(url);

      expect(mockAxiosGet).toHaveBeenCalledWith(url);
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('should return typed response when type parameter is provided', async () => {
      interface TestData {
        id: number;
        name: string;
      }

      const url = 'https://api.example.com/data';
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosGet.mockResolvedValueOnce(mockResponse);

      const result = await httpClient.get<TestData>(url);

      expect(mockAxiosGet).toHaveBeenCalledWith(url);
      expect(result).toEqual(mockResponse);
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('Test');
    });

    it('should handle axios errors', async () => {
      const url = 'https://api.example.com/data';
      const axiosError = new Error('Network Error');
      mockAxiosGet.mockRejectedValueOnce(axiosError);

      await expect(httpClient.get(url)).rejects.toThrow('Network Error');
      expect(mockAxiosGet).toHaveBeenCalledWith(url);
    });

    it('should handle HTTP error responses', async () => {
      const url = 'https://api.example.com/data';
      const axiosError = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };
      mockAxiosGet.mockRejectedValueOnce(axiosError);

      await expect(httpClient.get(url)).rejects.toEqual(axiosError);
      expect(mockAxiosGet).toHaveBeenCalledWith(url);
    });

    it('should work with different URL formats', async () => {
      const urls = [
        'https://api.example.com/data',
        'http://localhost:3000/api/users',
        'https://pokeapi.co/api/v2/pokemon/1',
        '/api/local/endpoint',
      ];

      for (const url of urls) {
        const mockResponse = { data: `Response for ${url}` };
        mockAxiosGet.mockResolvedValueOnce(mockResponse);

        const result = await httpClient.get(url);

        expect(mockAxiosGet).toHaveBeenCalledWith(url);
        expect(result).toEqual(mockResponse);
      }

      expect(mockAxiosGet).toHaveBeenCalledTimes(urls.length);
    });

    it('should handle empty responses', async () => {
      const url = 'https://api.example.com/empty';
      const mockResponse = { data: null };
      mockAxiosGet.mockResolvedValueOnce(mockResponse);

      const result = await httpClient.get(url);

      expect(mockAxiosGet).toHaveBeenCalledWith(url);
      expect(result.data).toBeNull();
    });

    it('should handle responses with arrays', async () => {
      const url = 'https://api.example.com/list';
      const mockResponse = { data: [{ id: 1 }, { id: 2 }, { id: 3 }] };
      mockAxiosGet.mockResolvedValueOnce(mockResponse);

      const result = await httpClient.get(url);

      expect(mockAxiosGet).toHaveBeenCalledWith(url);
      expect(result.data).toHaveLength(3);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
