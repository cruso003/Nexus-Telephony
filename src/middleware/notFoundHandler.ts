import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `The requested resource ${req.method} ${req.path} was not found`,
      status: 404,
    },
  });
};