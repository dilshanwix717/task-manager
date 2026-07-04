import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { RoleGuard } from './role.guards';

describe('RoleGuard', () => {
  let guard: RoleGuard;

  const reflector = {
    getAllAndOverride: jest.fn(),
  };

  const buildContext = (user?: { role: UserRoleType }): ExecutionContext =>
    ({
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new RoleGuard(reflector as unknown as Reflector);
  });

  it('allows public routes without a user', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce(undefined) // roles
      .mockReturnValueOnce(true); // isPublic

    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('denies when no user is attached to the request', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce([UserRoleType.USER])
      .mockReturnValueOnce(false);

    expect(guard.canActivate(buildContext())).toBe(false);
  });

  it('denies a user whose role is not allowed', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce([UserRoleType.ADMIN])
      .mockReturnValueOnce(false);

    expect(guard.canActivate(buildContext({ role: UserRoleType.USER }))).toBe(
      false,
    );
  });

  it('allows a user whose role matches', () => {
    reflector.getAllAndOverride
      .mockReturnValueOnce([UserRoleType.ADMIN, UserRoleType.USER])
      .mockReturnValueOnce(false);

    expect(guard.canActivate(buildContext({ role: UserRoleType.USER }))).toBe(
      true,
    );
  });
});
