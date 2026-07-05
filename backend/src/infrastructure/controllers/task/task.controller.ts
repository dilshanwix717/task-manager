import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { Roles } from 'src/infrastructure/auth-module/role';
import {
  CurrentUser,
  User,
} from 'src/infrastructure/auth-module/decorators/current-user.decorator';
import { ResponseSerializeInterceptor } from 'src/infrastructure/common/interceptors/single-response.interceptor';
import { ArrayResponseSerializeInterceptorWithPagination } from 'src/infrastructure/common/interceptors/array-paginated-response.interceptor';
import {
  ISCreateTaskUseCase,
  ISDeleteTaskUseCase,
  ISRetrieveTaskByIdUseCase,
  ISRetrieveTasksUseCase,
  ISRetrieveTaskSummaryUseCase,
  ISUpdateTaskUseCase,
} from 'src/infrastructure/interface-symbols/use-case.symbols';
import { ICreateTaskUseCase } from 'src/application/task/create-task.use-case';
import { IRetrieveTasksUseCase } from 'src/application/task/retrieve-tasks.use-case';
import { IRetrieveTaskByIdUseCase } from 'src/application/task/retrieve-task-by-id.use-case';
import { IUpdateTaskUseCase } from 'src/application/task/update-task.use-case';
import { IDeleteTaskUseCase } from 'src/application/task/delete-task.use-case';
import { IRetrieveTaskSummaryUseCase } from 'src/application/task/retrieve-task-summary.use-case';
import {
  CreateTaskDto,
  RetrieveTasksQueryParamsDto,
  TaskPresenterDto,
  TaskSummaryPresenterDto,
  UpdateTaskDto,
} from './dto/task.dto';

@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
export class TaskController {
  constructor(
    @Inject(ISCreateTaskUseCase)
    private readonly _createTaskUseCase: ICreateTaskUseCase,

    @Inject(ISRetrieveTasksUseCase)
    private readonly _retrieveTasksUseCase: IRetrieveTasksUseCase,

    @Inject(ISRetrieveTaskByIdUseCase)
    private readonly _retrieveTaskByIdUseCase: IRetrieveTaskByIdUseCase,

    @Inject(ISUpdateTaskUseCase)
    private readonly _updateTaskUseCase: IUpdateTaskUseCase,

    @Inject(ISDeleteTaskUseCase)
    private readonly _deleteTaskUseCase: IDeleteTaskUseCase,

    @Inject(ISRetrieveTaskSummaryUseCase)
    private readonly _retrieveTaskSummaryUseCase: IRetrieveTaskSummaryUseCase,
  ) {}

  @Post()
  @Roles(UserRoleType.ADMIN, UserRoleType.USER)
  @UseInterceptors(new ResponseSerializeInterceptor(TaskPresenterDto))
  @ApiOperation({ summary: 'Create a task owned by the current user' })
  @ApiCreatedResponse({ type: TaskPresenterDto })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @User() currentUser: CurrentUser,
  ) {
    return await this._createTaskUseCase.execute({
      ...createTaskDto,
      currentUser,
    });
  }

  @Get()
  @Roles(UserRoleType.ADMIN, UserRoleType.USER)
  @UseInterceptors(
    new ArrayResponseSerializeInterceptorWithPagination(TaskPresenterDto),
  )
  @ApiOperation({
    summary:
      'Get tasks with pagination, filterable by status and owner (owner filter is admin only)',
  })
  @ApiOkResponse({ type: TaskPresenterDto, isArray: true })
  async getTasks(
    @Query() retrieveTasksQueryParamsDto: RetrieveTasksQueryParamsDto,
    @User() currentUser: CurrentUser,
  ) {
    const [tasks, total] = await this._retrieveTasksUseCase.execute({
      ...retrieveTasksQueryParamsDto,
      currentUser,
    });

    return {
      count: total,
      currentPage: retrieveTasksQueryParamsDto.page,
      offset: retrieveTasksQueryParamsDto.limit,
      results: tasks,
    };
  }

  //declared before :taskId so "summary" is not swallowed by the param route
  @Get('summary')
  @Roles(UserRoleType.ADMIN, UserRoleType.USER)
  @UseInterceptors(new ResponseSerializeInterceptor(TaskSummaryPresenterDto))
  @ApiOperation({
    summary: 'Get task counts by status (own tasks, all tasks for admins)',
  })
  @ApiOkResponse({ type: TaskSummaryPresenterDto })
  async getTaskSummary(@User() currentUser: CurrentUser) {
    return await this._retrieveTaskSummaryUseCase.execute({ currentUser });
  }

  @Get(':taskId')
  @Roles(UserRoleType.ADMIN, UserRoleType.USER)
  @UseInterceptors(new ResponseSerializeInterceptor(TaskPresenterDto))
  @ApiOperation({ summary: 'Get a single task by id' })
  @ApiOkResponse({ type: TaskPresenterDto })
  async getTaskById(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @User() currentUser: CurrentUser,
  ) {
    return await this._retrieveTaskByIdUseCase.execute({
      taskId,
      currentUser,
    });
  }

  @Patch(':taskId')
  @Roles(UserRoleType.ADMIN, UserRoleType.USER)
  @UseInterceptors(new ResponseSerializeInterceptor(TaskPresenterDto))
  @ApiOperation({ summary: 'Update a task' })
  @ApiOkResponse({ type: TaskPresenterDto })
  async updateTask(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() currentUser: CurrentUser,
  ) {
    return await this._updateTaskUseCase.execute({
      taskId,
      ...updateTaskDto,
      currentUser,
    });
  }

  @Delete(':taskId')
  @Roles(UserRoleType.ADMIN, UserRoleType.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiNoContentResponse({ description: 'Task deleted' })
  async deleteTask(
    @Param('taskId', new ParseUUIDPipe()) taskId: string,
    @User() currentUser: CurrentUser,
  ) {
    await this._deleteTaskUseCase.execute({ taskId, currentUser });
  }
}
