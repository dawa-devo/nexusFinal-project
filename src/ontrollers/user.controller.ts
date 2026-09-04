import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      profilePic: true,
      role: true,
      reputation: true,
      createdAt: true,
      _count: {
        select: {
          questions: true,
          answers: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  // Count total accepted answers provided by this specific user
  const acceptedAnswersCount = await prisma.answer.count({
    where: {
      authorId: id,
      isAccepted: true,
    },
  });

  return res.status(200).json({
    ...user,
    stats: {
      questionsCount: user._count.questions,
      answersCount: user._count.answers,
      acceptedAnswersCount,
    },
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { name, bio } = req.body;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { name, bio },
    select: { id: true, name: true, bio: true, profilePic: true, updatedAt: true },
  });

  return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
};

export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an image file' });
  }

  const imageUrl = req.file.path; // Cloudinary secure image URL from Multer engine

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profilePic: imageUrl },
    select: { id: true, name: true, profilePic: true },
  });

  return res.status(200).json({ message: 'Profile picture uploaded successfully', user: updatedUser });
};