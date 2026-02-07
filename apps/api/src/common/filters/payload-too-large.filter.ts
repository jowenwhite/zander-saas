// MEDIUM-2: Exception filter for payload size errors
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  PayloadTooLargeException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(PayloadTooLargeException)
export class PayloadTooLargeExceptionFilter implements ExceptionFilter {
  catch(exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      error: 'Payload Too Large',
      message: 'Request payload exceeds the maximum allowed size',
      limits: {
        json: '1mb',
        urlencoded: '1mb',
        raw: '5mb',
        fileUpload: '10mb per file',
      },
    });
  }
}

// Also catch generic entity too large errors from express
@Catch()
export class EntityTooLargeFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Check if this is a payload size error
    if (
      exception?.type === 'entity.too.large' ||
      exception?.message?.includes('request entity too large') ||
      exception?.status === 413
    ) {
      response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        error: 'Payload Too Large',
        message: 'Request payload exceeds the maximum allowed size',
        limits: {
          json: '1mb',
          urlencoded: '1mb',
          raw: '5mb',
          fileUpload: '10mb per file',
        },
      });
      return;
    }

    // Re-throw other exceptions
    throw exception;
  }
}
