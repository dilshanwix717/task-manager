import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserModel } from 'src/domain/models/user.model';
import { IUserAccountRepositoryInterface } from 'src/domain/repositories/user-account.repository-interface';
import {
  EntityManager,
  DeepPartial,
  Repository,
  FindOptionsWhere,
  Like,
} from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleType } from 'src/domain/enums/user-role.enum';
import { Mapper } from '../utils/mappers/mapper.util';

@Injectable()
export class UserAccountRepository implements IUserAccountRepositoryInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userAccountRepository: Repository<UserEntity>,
  ) {}
  async findUserByEmail(email: string): Promise<UserModel> {
    const user = await this._userAccountRepository.findOne({
      where: {
        email: email,
      },
      relations: {
        role: true,
      },
    });

    return Mapper.toModel(user, UserModel);
  }
  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this._userAccountRepository.findOne({
      where: {
        email: email,
      },
    });

    return user ? true : false;
  }
  async checkUserNameExists(userName: string): Promise<boolean> {
    const user = await this._userAccountRepository.findOne({
      where: {
        userName: userName,
      },
    });

    return user ? true : false;
  }
  async findAllUsers(
    page: number,
    limit: number,
    userName?: string,
  ): Promise<[UserModel[], number]> {
    const whereClause: FindOptionsWhere<UserEntity> = {};

    if (userName) whereClause.userName = Like(`%${userName}%`);

    //get only active users
    whereClause.status = true;

    const numericPage = Number(page);
    const numericLimit = Number(limit);
    const numericSkip = (numericPage - 1) * numericLimit;

    const [users, total] = await this._userAccountRepository.findAndCount({
      where: whereClause,
      relations: {
        role: true,
      },
      select: {
        id: true,
        userName: true,
        email: true,
        role: { id: true, name: true },
        //createdAt must be selected because the query orders by it
        createdAt: true,
      },
      take: numericLimit,
      skip: numericSkip,
      order: { createdAt: 'DESC' },
    });

    return [Mapper.toModels(users, UserModel), total];
  }
  async checkAdminExists(): Promise<UserModel> {
    const admin = await this._userAccountRepository.findOne({
      where: {
        role: {
          name: UserRoleType.ADMIN,
        },
      },
      relations: {
        role: true,
      },
    });

    return Mapper.toModel(admin, UserModel);
  }

  async findById(id: string): Promise<UserModel> {
    const user = await this._userAccountRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        role: true,
      },
      select: {
        id: true,
        userName: true,
        email: true,
        status: true,
        role: { id: true, name: true },
      },
    });

    return Mapper.toModel(user, UserModel);
  }
  async update(
    userAccount: DeepPartial<UserModel>,
    entityManager?: EntityManager,
  ): Promise<UserModel> {
    let userAccountInstance = plainToInstance(UserEntity, userAccount);

    userAccountInstance =
      this._userAccountRepository.create(userAccountInstance);

    let createdUserAccount: UserEntity;

    if (entityManager) {
      createdUserAccount = await entityManager.save(
        UserEntity,
        userAccountInstance,
      );
    } else {
      createdUserAccount =
        await this._userAccountRepository.save(userAccountInstance);
    }

    return plainToInstance(UserModel, createdUserAccount);
  }

  async create(
    userAccount: DeepPartial<UserModel>,
    entityManager?: EntityManager,
  ): Promise<UserModel> {
    let userAccountInstance = plainToInstance(UserEntity, userAccount);

    userAccountInstance =
      this._userAccountRepository.create(userAccountInstance);

    let createdUserAccount: UserEntity;

    if (entityManager) {
      createdUserAccount = await entityManager.save(
        UserEntity,
        userAccountInstance,
      );
    } else {
      createdUserAccount =
        await this._userAccountRepository.save(userAccountInstance);
    }

    return plainToInstance(UserModel, createdUserAccount);
  }
  saveMany(
    _t: UserModel[],
    _entityManager?: EntityManager,
  ): Promise<UserModel[]> {
    throw new Error('Method not implemented.');
  }
  findByIds(_ids: string[]): Promise<UserModel[]> {
    throw new Error('Method not implemented.');
  }
}
