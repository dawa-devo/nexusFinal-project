import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';

export class AnswerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = req.user!.userId;
      const { questionId, content } = req.body;

      const question = await db.question.findUnique({ where: { id: questionId } });
      if (!question) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      const answer = await db.answer.create({
        data: { content, questionId, authorId },
        include: { author: { select: { id: true, name: true } } },
      });

      res.status(201).json({ success: true, message: 'Answer posted successfully', data: answer });
    } catch (error) {
      next(error);
    }
  }

  static async vote(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const answerId = req.params.id;
      const { value } = req.body;

      const vote = await db.vote.upsert({
        where: { userId_answerId: { userId, answerId } },
        update: { value },
        create: { userId, answerId, value },
      });

      res.status(200).json({ success: true, message: 'Vote recorded', data: vote });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const { id } = req.params;

      const answer = await db.answer.findUnique({ where: { id } });
      if (!answer) {
        return res.status(404).json({ success: false, message: 'Answer not found' });
      }

      if (answer.authorId !== userId && role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      await db.answer.delete({ where: { id } });
      res.status(200).json({ success: true, message: 'Answer deleted' });
    } catch (error) {
      next(error);
    }
  }
}