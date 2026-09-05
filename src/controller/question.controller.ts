import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const createQuestion = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, description, tags } = req.body as { title: string; description: string; tags: string[] };

  // Database transaction for question and tag connections
  const question = await prisma.$transaction(async (tx) => {
    // 1. Process tags - find existing or create new ones
    const tagInstances = await Promise.all(
      tags.map(async (tagName) => {
        const normalizedName = tagName.toLowerCase().trim();
        return tx.tag.upsert({
          where: { name: normalizedName },
          update: {},
          create: { name: normalizedName },
        });
      })
    );

    // 2. Create the question entity
    const newQuestion = await tx.question.create({
      data: {
        title,
        description,
        authorId: userId,
        tags: {
          create: tagInstances.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        author: { select: { id: true, name: true, profilePic: true } },
      },
    });

    // 3. Increment User Reputation by +5 points for asking a question
    await tx.user.update({
      where: { id: userId },
      data: { reputation: { increment: 5 } },
    });

    return newQuestion;
  });

  return res.status(201).json({ message: 'Question created successfully', question });
};

export const getQuestions = async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const sort = (req.query.sort as string) || 'newest';
  const skip = (page - 1) * limit;

  // Build dynamic search filter
  const whereClause: any = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { some: { tag: { name: { contains: search, mode: 'insensitive' } } } } },
        ],
      }
    : {};

  // Build dynamic sorting filter
  let orderByClause: any = { createdAt: 'desc' };
  if (sort === 'popular') {
    orderByClause = { votes: { _count: 'desc' } };
  } else if (sort === 'unanswered') {
    whereClause.answers = { none: {} };
  }

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: orderByClause,
      include: {
        author: { select: { id: true, name: true, profilePic: true } },
        tags: { include: { tag: true } },
        _count: { select: { answers: true, votes: true } },
      },
    }),
    prisma.question.count({ where: whereClause }),
  ]);

  return res.status(200).json({
    data: questions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getQuestionById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, profilePic: true, reputation: true } },
      tags: { include: { tag: true } },
      answers: {
        include: {
          author: { select: { id: true, name: true, profilePic: true, reputation: true } },
          comments: { include: { author: { select: { id: true, name: true } } } },
          _count: { select: { votes: true } },
        },
        orderBy: { isAccepted: 'desc' },
      },
      comments: { include: { author: { select: { id: true, name: true } } } },
      _count: { select: { votes: true } },
    },
  });

  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  return res.status(200).json(question);
};

export const updateQuestion = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { title, description } = req.body;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (question.authorId !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized to update this question' });
  }

  const updatedQuestion = await prisma.question.update({
    where: { id },
    data: { title, description },
  });

  return res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
};

export const deleteQuestion = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (question.authorId !== userId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized to delete this question' });
  }

  await prisma.question.delete({ where: { id } });

  return res.status(200).json({ message: 'Question deleted successfully' });
};