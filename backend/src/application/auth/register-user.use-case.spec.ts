import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import {
  ISRoleRepository,
  ISUserAccountRepository,
} from 'src/infrastructure/interface-symbols/repository.symbols';
import { PasswordService } from 'src/infrastructure/auth-module/services/password.service';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  const userAccountRepository = {
    checkEmailExists: jest.fn(),
    checkUserNameExists: jest.fn(),
    create: jest.fn(),
  };

  const roleRepository = {
    fetchRoleByName: jest.fn(),
  };

  const passwordService = {
    hashPassword: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const registration = {
    userName: 'alice',
    email: 'alice@example.com',
    password: 'plain-password',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: ISUserAccountRepository, useValue: userAccountRepository },
        { provide: ISRoleRepository, useValue: roleRepository },
        { provide: PasswordService, useValue: passwordService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get(RegisterUserUseCase);
  });

  it('rejects a duplicate email with a conflict', async () => {
    userAccountRepository.checkEmailExists.mockResolvedValue(true);

    await expect(useCase.execute(registration)).rejects.toThrow(
      ConflictException,
    );

    expect(userAccountRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate username with a conflict', async () => {
    userAccountRepository.checkEmailExists.mockResolvedValue(false);
    userAccountRepository.checkUserNameExists.mockResolvedValue(true);

    await expect(useCase.execute(registration)).rejects.toThrow(
      ConflictException,
    );

    expect(userAccountRepository.create).not.toHaveBeenCalled();
  });

  it('hashes the password, assigns the USER role and signs the new user in', async () => {
    userAccountRepository.checkEmailExists.mockResolvedValue(false);
    userAccountRepository.checkUserNameExists.mockResolvedValue(false);
    roleRepository.fetchRoleByName.mockResolvedValue({
      id: 'role-1',
      name: UserRoleType.USER,
    });
    passwordService.hashPassword.mockResolvedValue('hashed-password');
    userAccountRepository.create.mockResolvedValue({
      id: 'user-1',
      userName: registration.userName,
    });
    jwtService.signAsync.mockResolvedValue('signed-token');

    const token = await useCase.execute(registration);

    expect(token).toBe('signed-token');
    expect(roleRepository.fetchRoleByName).toHaveBeenCalledWith(
      UserRoleType.USER,
    );
    expect(userAccountRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: registration.userName,
        email: registration.email,
        password: 'hashed-password',
      }),
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      userId: 'user-1',
      name: registration.userName,
      role: UserRoleType.USER,
    });
  });
});
