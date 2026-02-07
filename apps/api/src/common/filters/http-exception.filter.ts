// MEDIUM-3: Global exception filter with response sanitization
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Skip if response already sent (handled by another filter)
    if (response.headersSent) {
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'An unexpected error occurred';
    let error = 'Internal Server Error';

    // Handle entity.too.large from express body-parser
    if (this.isEntityTooLargeError(exception)) {
      status = HttpStatus.PAYLOAD_TOO_LARGE;
      error = 'Payload Too Large';
      message = 'Request payload exceeds the maximum allowed size';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || exception.message;
        error = responseObj.error || this.getErrorName(status);
      } else {
        message = exceptionResponse as string;
      }
    }

    // Log full error details internally (for debugging)
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${error}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // SECURITY: Sanitize error messages to prevent info leakage
    const sanitizedMessage = this.sanitizeMessage(message, status);

    // Build error response
    const errorResponse = {
      statusCode: status,
      error: error,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private isEntityTooLargeError(exception: unknown): boolean {
    if (typeof exception === 'object' && exception !== null) {
      const exc = exception as Record<string, any>;
      return (
        exc.type === 'entity.too.large' ||
        exc.message?.includes('request entity too large') ||
        exc.status === 413
      );
    }
    return false;
  }

  private getErrorName(status: number): string {
    const statusNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      409: 'Conflict',
      413: 'Payload Too Large',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return statusNames[status] || 'Error';
  }

  private sanitizeMessage(message: string | string[], status: number): string | string[] {
    // SECURITY: For 500 errors, always return generic message
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'An unexpected error occurred. Please try again later.';
    }

    // Allow validation messages through (400 errors from class-validator)
    if (status === HttpStatus.BAD_REQUEST && Array.isArray(message)) {
      return message;
    }

    // Sanitize single string messages
    if (typeof message === 'string') {
      return this.sanitizeString(message);
    }

    // Sanitize array of messages
    if (Array.isArray(message)) {
      return message.map(m => this.sanitizeString(m));
    }

    return message;
  }

  private sanitizeString(message: string): string {
    const lowerMessage = message.toLowerCase();

    // SECURITY: Remove potential database/ORM references
    if (
      lowerMessage.includes('prisma') ||
      lowerMessage.includes('database') ||
      lowerMessage.includes('sql') ||
      lowerMessage.includes('postgres') ||
      lowerMessage.includes('mysql') ||
      lowerMessage.includes('constraint') ||
      lowerMessage.includes('foreign key')
    ) {
      return 'A database error occurred';
    }

    // SECURITY: Remove file paths
    if (
      (message.includes('/') || message.includes('\\')) &&
      (message.includes('.ts') || message.includes('.js') || message.includes('node_modules'))
    ) {
      return 'An internal error occurred';
    }

    // SECURITY: Remove stack trace indicators
    if (
      lowerMessage.includes('at ') ||
      lowerMessage.includes('error:') ||
      message.includes('    at ')
    ) {
      return 'An internal error occurred';
    }

    return message;
  }
}
