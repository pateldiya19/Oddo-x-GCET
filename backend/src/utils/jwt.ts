import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    config.jwt.secret, 
    { expiresIn: config.jwt.expiresIn as any }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    config.jwt.refreshSecret, 
    { expiresIn: config.jwt.refreshExpiresIn as any }
  );
};

export const verifyAccessToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.secret as string) as { userId: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, config.jwt.refreshSecret as string) as { userId: string };
};
