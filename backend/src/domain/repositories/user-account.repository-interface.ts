import { UserModel } from '../models/user.model';
import { IMainRepositoryInterface } from './main-repository.interface';

export interface IUserAccountRepositoryInterface
  extends IMainRepositoryInterface<UserModel> {
  checkAdminExists(): Promise<UserModel>;

  findUserByEmail(email: string): Promise<UserModel>;

  checkEmailExists(email: string): Promise<boolean>;

  checkUserNameExists(userName: string): Promise<boolean>;

  findAllUsers(
    page: number,
    limit: number,
    userName?: string,
  ): Promise<[UserModel[], number]>;
}
