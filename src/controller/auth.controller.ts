import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return res.status(201).json({ message: 'User registered successfully', user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password credentials' });
  }

  if (user.isBlocked) {
    return res.status(403).json({ error: 'Account suspended. Contact administrator' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password credentials' });
  }

  const tokens = generateTokens(user.id, user.role);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return res.status(200).json({
    message: 'Login successful',
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!storedToken) {
    return res.status(401).json({ error: 'Invalid or revoked refresh token' });
  }

  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    return res.status(401).json({ error: 'Refresh token expired. Please log in again' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });

    if (!user || user.isBlocked) {
      return res.status(403).json({ error: 'User inactive or blocked' });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' });

    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token verification signature' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  return res.status(200).json({ message: 'Logged out successfully' });
};