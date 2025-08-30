import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Badge } from './entity/badge';
import { RefreshToken } from './entity/refresh-tokens';
import { Trainer } from './entity/trainer';
import { User } from './entity/user';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [Trainer, Badge, User, RefreshToken],
  synchronize: true,
  subscribers: [],
  migrations: [],
});
