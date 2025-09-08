import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError } from '../types/api-response.types';

/**
 * Validation Exception Filter
 * This filter provides detailed validation error responses
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[];
    let error: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      error = 'ValidationError';
    } else {
      message = (exceptionResponse as any).message || exception.message;
      error = (exceptionResponse as any).error || 'ValidationError';
    }

    const errorResponse: ApiError = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.warn(
      `Validation error: ${request.method} ${request.url} - ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
