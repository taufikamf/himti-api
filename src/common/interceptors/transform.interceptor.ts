import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Check if response is already formatted (like paginated response)
        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          return {
            status: true,
            ...data,
          };
        }
        
        // Check if response is already a BaseResponse
        if (data && typeof data === 'object' && 'status' in data) {
          return data;
        }
        
        // Handle basic message responses
        if (data && typeof data === 'object' && 'message' in data && !('data' in data)) {
          return {
            status: true,
            message: data.message,
          };
        }
        
        // Default transformation
        return {
          status: true,
          data,
        };
      }),
    );
  }
} 