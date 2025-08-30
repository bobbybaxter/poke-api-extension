import { Response } from 'express';

export function setRefreshCookie(res: Response, rawToken: string) {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  res.cookie('refresh_token', rawToken, {
    httpOnly: true,
    secure: true, // require HTTPS in production
    sameSite: 'strict',
    path: '/refresh',
    maxAge: weekMs,
  });
}
