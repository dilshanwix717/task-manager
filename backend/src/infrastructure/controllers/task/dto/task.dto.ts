import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TaskStatusType } from 'src/domain/enums/task-status.enum';
import { PaginationQueryParams } from 'src/infrastructure/common/dtos/request.dto';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ type: String, required: true, example: 'Prepare the demo' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    required: false,
    example: 'Walk through the main flows before the review call',
  })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatusType)
  @ApiProperty({
    enum: TaskStatusType,
    required: false,
    example: TaskStatusType.TODO,
  })
  status?: TaskStatusType;

  @IsDateString()
  @ApiProperty({
    type: String,
    required: true,
    example: '2026-07-30T00:00:00.000Z',
  })
  dueDate: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class RetrieveTasksQueryParamsDto extends PaginationQueryParams {
  @IsOptional()
  @IsEnum(TaskStatusType)
  @ApiProperty({ enum: TaskStatusType, required: false })
  status?: TaskStatusType;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ type: String, required: false })
  ownerId?: string;
}

export class TaskOwnerPresenterDto {
  @Expose()
  @ApiProperty({ type: String })
  id: string;

  @Expose()
  @ApiProperty({ type: String })
  userName: string;
}

export class TaskPresenterDto {
  @Expose()
  @ApiProperty({ type: String })
  id: string;

  @Expose()
  @ApiProperty({ type: String })
  title: string;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  description: string;

  @Expose()
  @ApiProperty({ enum: TaskStatusType })
  status: TaskStatusType;

  @Expose()
  @ApiProperty({ type: Date })
  dueDate: Date;

  @Expose()
  @Type(() => TaskOwnerPresenterDto)
  @ApiProperty({ type: TaskOwnerPresenterDto })
  owner: TaskOwnerPresenterDto;

  @Expose()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: Date })
  updatedAt: Date;
}
