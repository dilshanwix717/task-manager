import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryParams } from 'src/infrastructure/common/dtos/request.dto';

export class RetrieveUsersQueryParamsDto extends PaginationQueryParams {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String, required: false })
  userName?: string;
}

export class UserRolePresenterDto {
  @Expose()
  @ApiProperty({ type: String })
  name: string;
}

export class UserPresenterDto {
  @Expose()
  @ApiProperty({ type: String })
  id: string;

  @Expose()
  @ApiProperty({ type: String })
  userName: string;

  @Expose()
  @ApiProperty({ type: String })
  email: string;

  @Expose()
  @Type(() => UserRolePresenterDto)
  @ApiProperty({ type: UserRolePresenterDto })
  role: UserRolePresenterDto;
}
