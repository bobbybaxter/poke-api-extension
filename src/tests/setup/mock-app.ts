/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import indexRouter from 'src/routes/index';
import { vi } from 'vitest';

dotenv.config();

// Mock the data source to avoid database initialization during tests
vi.mock('../../mysql/data-source', () => ({
  AppDataSource: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getRepository: vi.fn(),
    isInitialized: true,
  },
}));

// Mock the error handler
vi.mock('../../middleware/error-handler', () => ({
  errorHandler: vi.fn((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ error: err.message });
  }),
}));

const app = express();

// Basic middleware setup for tests
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

// Mock error handler
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.statusCode || 500).json({ error: err.message });
});

export default app;
