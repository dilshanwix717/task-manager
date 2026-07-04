import {
  Body,
  Controller,
  Inject,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../decorators/auth.decorator';
import { SignInWithEmailDto, TokenPresenterDto } from './dtos/auth.dto';
import { ISUserLoginUseCase } from 'src/infrastructure/interface-symbols/use-case.symbols';
import { IUserLoginUseCase } from '../use-cases/user-login.use-case';
import { ResponseSerializeInterceptor } from 'src/infrastructure/common/interceptors/single-response.interceptor';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject(ISUserLoginUseCase)
    private readonly _userLoginUseCase: IUserLoginUseCase,
  ) {}

  @Public()
  @Post('/login')
  @UseInterceptors(new ResponseSerializeInterceptor(TokenPresenterDto))
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiOkResponse({ type: TokenPresenterDto })
  async signInWithEmailAndPassword(@Body() credentials: SignInWithEmailDto) {
    const { email, password } = credentials;

    const access_token = await this._userLoginUseCase.execute({
      email,
      password,
    });

    return { access_token };
  }
}
