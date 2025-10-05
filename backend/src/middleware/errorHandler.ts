import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error (in production, use proper logging service)
  console.error(`Error ${statusCode}: ${message}`);
  console.error(err.stack);
  try {
    // Capture exception in Sentry if available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node');
    if (Sentry && Sentry.captureException) {
      Sentry.captureException(err);
    }
  } catch (e) {
    // ignore if Sentry not available
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};