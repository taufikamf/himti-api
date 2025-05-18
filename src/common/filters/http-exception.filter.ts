import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    
    const errorResponse = exception.getResponse();
    const errorMessage = typeof errorResponse === 'object' && 'message' in errorResponse
      ? errorResponse['message']
      : exception.message;

    const responseBody = {
      status: false,
      message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `${request.method} ${request.url} ${status} - ${JSON.stringify(errorMessage)}`,
    );

    response.status(status).json(responseBody);
  }
} 