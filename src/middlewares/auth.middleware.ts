import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  try {
   const secret = process.env.JWT_ACCESS_SECRET || 'supersecret';
    const decoded = jwt.verify(token, secret) as { id: string; role?: string };
    req.user = decoded;
     return next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};