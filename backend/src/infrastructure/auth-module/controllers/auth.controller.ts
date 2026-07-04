import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../decorators/auth.decorator';
import {
  RegisterUserDto,
  SignInWithEmailDto,
  TokenPresenterDto,
} from './dtos/auth.dto';
import {
  ISRegisterUserUseCase,
  ISUserLoginUseCase,
} from 'src/infrastructure/interface-symbols/use-case.symbols';
import { IUserLoginUseCase } from '../use-cases/user-login.use-case';
import { IRegisterUserUseCase } from '../use-cases/register-user.use-case';
import { ResponseSerializeInterceptor } from 'src/infrastructure/common/interceptors/single-response.interceptor';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

//auth endpoints are public, keep a tighter rate limit on them than the global default
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    @Inject(ISUserLoginUseCase)
    private readonly _userLoginUseCase: IUserLoginUseCase,

    @Inject(ISRegisterUserUseCase)
    private readonly _registerUserUseCase: IRegisterUserUseCase,
  ) {}

  @Public()
  @Post('/register')
  @UseInterceptors(new ResponseSerializeInterceptor(TokenPresenterDto))
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({ type: TokenPresenterDto })
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    const access_token =
      await this._registerUserUseCase.execute(registerUserDto);

    return { access_token };
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
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
