import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { ISUserAccountRepository } from 'src/infrastructure/interface-symbols/repository.symbols';
import { PasswordService } from 'src/infrastructure/auth-module/services/password.service';
import { UserLoginUseCase } from './user-login.use-case';

describe('UserLoginUseCase', () => {
  let useCase: UserLoginUseCase;

  const userAccountRepository = {
    findUserByEmail: jest.fn(),
  };

  const passwordService = {
    compareWithHashedPassword: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  const existingUser = {
    id: 'user-1',
    userName: 'alice',
    email: 'alice@example.com',
    password: 'hashed-password',
    role: { name: 'USER' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        UserLoginUseCase,
        { provide: ISUserAccountRepository, useValue: userAccountRepository },
        { provide: PasswordService, useValue: passwordService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get(UserLoginUseCase);
  });

  it('rejects when no account exists for the email', async () => {
    userAccountRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'ghost@example.com', password: 'whatever' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when the password does not match', async () => {
    userAccountRepository.findUserByEmail.mockResolvedValue(existingUser);
    passwordService.compareWithHashedPassword.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: existingUser.email, password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('returns a signed token carrying the user id, name and role', async () => {
    userAccountRepository.findUserByEmail.mockResolvedValue(existingUser);
    passwordService.compareWithHashedPassword.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('signed-token');

    const token = await useCase.execute({
      email: existingUser.email,
      password: 'correct',
    });

    expect(token).toBe('signed-token');
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'alice',
      role: 'USER',
    });
  });
});
