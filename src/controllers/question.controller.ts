import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { title, description, tags } = req.body.body || req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newQuestion = await prisma.question.create({
      data: {
        title,
        description,
        tags,
        authorId: userId,
      },
    });

    return res.status(201).json(newQuestion);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create question', details: error.message });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body.body || req.body;
    const userId = req.user?.id;

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.authorId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own questions' });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: { title, description, tags },
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update question', details: error.message });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.authorId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own questions' });
    }

    await prisma.question.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete question', details: error.message });
  }
};