import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';
import { QueryResponseWithPagination } from '../dtos/response.dto';

@Injectable()
export class ArrayResponseSerializeInterceptorWithPagination
  implements NestInterceptor
{
  constructor(private readonly _dto: ClassConstructor<unknown>) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        const { count, results, currentPage, offset } =
          data as QueryResponseWithPagination<unknown>;

        const convertedResult: QueryResponseWithPagination<unknown> = {
          count,
          currentPage,
          offset,
          results: results.map((result) =>
            plainToClass(this._dto, result, { excludeExtraneousValues: true }),
          ),
        };

        return convertedResult;
      }),
    );
  }
}
