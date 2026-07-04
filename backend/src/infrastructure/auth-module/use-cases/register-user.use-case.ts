import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { UserModel } from 'src/domain/models/user.model';
import { IRoleRepositoryInterface } from 'src/domain/repositories/role.repository-interface';
import { IUserAccountRepositoryInterface } from 'src/domain/repositories/user-account.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import {
  ISRoleRepository,
  ISUserAccountRepository,
} from 'src/infrastructure/interface-symbols/repository.symbols';
import { PasswordService } from '../services/password.service';

interface IRegisterUserParams {
  userName: string;
  email: string;
  password: string;
}

export type IRegisterUserUseCase = IUseCase<IRegisterUserParams, string>;

@Injectable()
export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(
    @Inject(ISUserAccountRepository)
    private readonly _userAccountRepository: IUserAccountRepositoryInterface,

    @Inject(ISRoleRepository)
    private readonly _roleRepository: IRoleRepositoryInterface,

    private readonly _passwordService: PasswordService,

    private readonly _jwtService: JwtService,
  ) {}

  async execute({
    userName,
    email,
    password,
  }: IRegisterUserParams): Promise<string> {
    //reject duplicate accounts before creating anything
    const emailExists =
      await this._userAccountRepository.checkEmailExists(email);

    if (emailExists)
      throw new ConflictException(`An account already exists for ${email}.`);

    const userNameExists =
      await this._userAccountRepository.checkUserNameExists(userName);

    if (userNameExists)
      throw new ConflictException(`The username ${userName} is already taken.`);

    //every self-registered account gets the USER role, admins are seeded separately
    const userRole = await this._roleRepository.fetchRoleByName(
      UserRoleType.USER,
    );

    const hashedPassword = await this._passwordService.hashPassword(password);

    const newUser = new UserModel();
    newUser.userName = userName;
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.role = userRole;

    const createdUser = await this._userAccountRepository.create(newUser);

    //sign the new user in right away
    const tokenPayload = {
      userId: createdUser.id,
      name: createdUser.userName,
      role: userRole.name,
    };

    return await this._jwtService.signAsync(tokenPayload);
  }
}
