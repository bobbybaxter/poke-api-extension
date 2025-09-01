// this is run before every test suite
import 'reflect-metadata';
import nock from 'nock';
import { vi } from 'vitest';

vi.mock('src/app.ts', () => import('./mock-app.ts'));
vi.mock('src/bin/www.ts', () => import('./mock-server.ts'));

beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect(/127\.0\.0\.1|localhost:80/);
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});
