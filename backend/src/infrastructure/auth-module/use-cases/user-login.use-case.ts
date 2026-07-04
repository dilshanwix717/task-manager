import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserAccountRepositoryInterface } from 'src/domain/repositories/user-account.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import { ISUserAccountRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { PasswordService } from '../services/password.service';
import { JwtService } from '@nestjs/jwt';

interface IUserLoginParams {
  email: string;
  password: string;
}

export type IUserLoginUseCase = IUseCase<IUserLoginParams, string>;

@Injectable()
export class UserLoginUseCase implements IUserLoginUseCase {
  constructor(
    @Inject(ISUserAccountRepository)
    private readonly _userAccountRepository: IUserAccountRepositoryInterface,

    private readonly _passwordService: PasswordService,

    private readonly _jwtService: JwtService,
  ) {}

  async execute({ email, password }: IUserLoginParams): Promise<string> {
    //check the user exists
    //keep the error message identical for both cases to avoid leaking which accounts exist
    const existingUser =
      await this._userAccountRepository.findUserByEmail(email);

    if (!existingUser)
      throw new UnauthorizedException('Invalid email or password.');

    const { password: hashedPassword } = existingUser;

    const matchingPassword =
      await this._passwordService.compareWithHashedPassword(
        password,
        hashedPassword,
      );

    if (!matchingPassword)
      throw new UnauthorizedException('Invalid email or password.');

    //if password matches, generate a jwt token and return it.
    const tokenPayload = {
      userId: existingUser.id,
      name: existingUser.userName,
      role: existingUser.role.name,
    };

    return await this._jwtService.signAsync(tokenPayload);
  }
}
