import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class PaginationQueryParams {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsNotEmpty()
  page: number = 1; // Default value 1

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsNotEmpty()
  limit: number = 10; // Default value 10
}
