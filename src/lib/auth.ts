import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'pgfinder_secret_key_123_abc';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  gender: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
