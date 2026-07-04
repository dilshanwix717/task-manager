import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseSerializeInterceptor implements NestInterceptor {
  constructor(private readonly _dto: ClassConstructor<unknown>) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        return plainToClass(this._dto, data, { excludeExtraneousValues: true });
      }),
    );
  }
}
