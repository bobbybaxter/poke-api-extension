import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { AppDataSource } from '../mysql/data-source';
import { RefreshToken } from '../mysql/entity/refresh-tokens';
import { User } from '../mysql/entity/user';

dotenv.config({ quiet: true });

interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

interface UserTokenData {
  id: string;
  username: string;
}

export class TokenService {
  private static readonly ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
  private static readonly ACCESS_TTL: string = process.env.ACCESS_TOKEN_TTL || '15m';
  private static readonly REFRESH_DAYS = parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || '7', 10);
  private refreshTokenRepository: Repository<RefreshToken>;
  private userRepository: Repository<User>;

  constructor() {
    if (!TokenService.ACCESS_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET environment variable is required');
    }
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    this.userRepository = AppDataSource.getRepository(User);
  }

  private sha256hex(str: string): string {
    return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
  }

  signAccessToken(user: UserTokenData): string {
    const payload: JwtPayload = { sub: String(user.id), username: user.username };

    return jwt.sign(
      payload,
      TokenService.ACCESS_SECRET as Secret,
      { expiresIn: TokenService.ACCESS_TTL } as SignOptions,
    );
  }

  async issueRefreshToken(userId: string): Promise<string> {
    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.sha256hex(raw);
    const expiresAt = new Date(Date.now() + TokenService.REFRESH_DAYS * 86400 * 1000);

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const refreshToken = this.refreshTokenRepository.create({
      user,
      tokenHash,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
    return raw; // return plaintext to client (we only store hash)
  }

  async rotateRefreshToken(oldRaw: string, userId: string): Promise<string | null> {
    const oldHash = this.sha256hex(oldRaw);
    return await AppDataSource.transaction(async (manager) => {
      const refreshTokenRepo = manager.getRepository(RefreshToken);

      const existingToken = await refreshTokenRepo.findOne({
        where: {
          tokenHash: oldHash,
          user: { id: userId },
          revoked: false,
        },
        relations: ['user'],
      });

      if (!existingToken || existingToken.expiresAt <= new Date()) {
        return null;
      }

      // Revoke old token
      existingToken.revoked = true;
      await refreshTokenRepo.save(existingToken);

      // Issue new token
      const raw = crypto.randomBytes(32).toString('hex');
      const tokenHash = this.sha256hex(raw);
      const expiresAt = new Date(Date.now() + TokenService.REFRESH_DAYS * 86400 * 1000);

      const newRefreshToken = refreshTokenRepo.create({
        user: existingToken.user,
        tokenHash,
        expiresAt,
      });

      await refreshTokenRepo.save(newRefreshToken);
      return raw;
    });
  }

  async revokeRefreshToken(rawOrHash: string): Promise<void> {
    const tokenHash = rawOrHash.length === 64 ? rawOrHash : this.sha256hex(rawOrHash);
    await this.refreshTokenRepository.update({ tokenHash }, { revoked: true });
  }

  async userIdFromRefresh(raw: string): Promise<string | null> {
    const tokenHash = this.sha256hex(raw);
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        revoked: false,
      },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt <= new Date()) {
      return null;
    }

    return refreshToken.user.id;
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, TokenService.ACCESS_SECRET as string) as JwtPayload;
  }
}

// only need one instance of the token service
export const tokenService = new TokenService();
