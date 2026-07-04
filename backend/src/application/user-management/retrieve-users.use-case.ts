import { Inject, Injectable } from '@nestjs/common';
import { UserModel } from 'src/domain/models/user.model';
import { IUserAccountRepositoryInterface } from 'src/domain/repositories/user-account.repository-interface';
import { IUseCase } from 'src/infrastructure/abstract/use-case.interface';
import { ISUserAccountRepository } from 'src/infrastructure/interface-symbols/repository.symbols';

interface IRetrieveUsersParams {
  page: number;
  limit: number;
  userName?: string;
}

export type IRetrieveUsersUseCase = IUseCase<
  IRetrieveUsersParams,
  [UserModel[], number]
>;

@Injectable()
export class RetrieveUsersUseCase implements IRetrieveUsersUseCase {
  constructor(
    @Inject(ISUserAccountRepository)
    private readonly _userAccountRepository: IUserAccountRepositoryInterface,
  ) {}

  async execute({
    page,
    limit,
    userName,
  }: IRetrieveUsersParams): Promise<[UserModel[], number]> {
    return await this._userAccountRepository.findAllUsers(
      page,
      limit,
      userName,
    );
  }
}
