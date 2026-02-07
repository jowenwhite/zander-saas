// MEDIUM-3: Validation exception filter for class-validator errors
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse() as any;

    // Check if this is a validation error from class-validator
    const isValidationError =
      Array.isArray(exceptionResponse.message) ||
      exceptionResponse.message?.includes('should not exist') ||
      exceptionResponse.message?.includes('must be');

    if (isValidationError) {
      // Format validation errors nicely
      const details = this.formatValidationErrors(exceptionResponse.message);

      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Validation Error',
        message: 'One or more fields failed validation',
        details: details,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    } else {
      // For non-validation BadRequests, return standard format
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: exceptionResponse.message || 'Bad request',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }

  private formatValidationErrors(messages: string | string[]): string[] {
    if (Array.isArray(messages)) {
      // Clean up and deduplicate messages
      return [...new Set(messages.map(m => this.cleanMessage(m)))];
    }
    return [this.cleanMessage(messages)];
  }

  private cleanMessage(message: string): string {
    // Capitalize first letter if not already
    if (message && message.length > 0) {
      return message.charAt(0).toUpperCase() + message.slice(1);
    }
    return message;
  }
}
