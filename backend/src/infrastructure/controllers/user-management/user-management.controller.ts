import {
  Controller,
  Get,
  Inject,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { Roles } from 'src/infrastructure/auth-module/role';
import { ArrayResponseSerializeInterceptorWithPagination } from 'src/infrastructure/common/interceptors/array-paginated-response.interceptor';
import { ISRetrieveUsersUseCase } from 'src/infrastructure/interface-symbols/use-case.symbols';
import { IRetrieveUsersUseCase } from 'src/application/user-management/retrieve-users.use-case';
import { RetrieveUsersQueryParamsDto, UserPresenterDto } from './dto/user.dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserManagementController {
  constructor(
    @Inject(ISRetrieveUsersUseCase)
    private readonly _retrieveUsersUseCase: IRetrieveUsersUseCase,
  ) {}

  @Get()
  @Roles(UserRoleType.ADMIN)
  @UseInterceptors(
    new ArrayResponseSerializeInterceptorWithPagination(UserPresenterDto),
  )
  @ApiOperation({
    summary: 'Get users with pagination, admin only (used for owner filtering)',
  })
  @ApiOkResponse({ type: UserPresenterDto, isArray: true })
  async getUsers(
    @Query() retrieveUsersQueryParamsDto: RetrieveUsersQueryParamsDto,
  ) {
    const [users, total] = await this._retrieveUsersUseCase.execute(
      retrieveUsersQueryParamsDto,
    );

    return {
      count: total,
      currentPage: retrieveUsersQueryParamsDto.page,
      offset: retrieveUsersQueryParamsDto.limit,
      results: users,
    };
  }
}
