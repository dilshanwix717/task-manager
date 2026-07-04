import { RoleModel } from '../models/role.model';
import { IMainRepositoryInterface } from './main-repository.interface';

export interface IRoleRepositoryInterface
  extends IMainRepositoryInterface<RoleModel> {
  findAll(): Promise<RoleModel[]>;

  fetchRoleByName(name: string): Promise<RoleModel>;
}
