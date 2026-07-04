import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import {
  ISRoleRepository,
  ISUserAccountRepository,
} from '../interface-symbols/repository.symbols';
import { IRoleRepositoryInterface } from 'src/domain/repositories/role.repository-interface';
import { USER_ROLES, UserRoleType } from 'src/domain/enums/user-role.enum';
import { RoleModel } from 'src/domain/models/role.model';
import { IUserAccountRepositoryInterface } from 'src/domain/repositories/user-account.repository-interface';
import { UserModel } from 'src/domain/models/user.model';
import { PasswordService } from '../auth-module/services/password.service';
import { ConfigurationService } from '../configurations/base-config/config.service';

@Injectable()
export class ApplicationStartupHook implements OnApplicationBootstrap {
  // Logger instance initialization
  private readonly logger: Logger;
  constructor(
    @Inject(ISRoleRepository)
    private readonly _roleRepository: IRoleRepositoryInterface,

    @Inject(ISUserAccountRepository)
    private readonly _userAccountRepository: IUserAccountRepositoryInterface,

    private readonly _passwordService: PasswordService,

    private readonly _configService: ConfigurationService,
  ) {
    // Logger service
    this.logger = new Logger(ApplicationStartupHook.name);
  }

  async onApplicationBootstrap() {
    // populate the database with roles on application startup
    await this.populateSystemRoles();

    // populate the default admin account
    await this.populateAdminAccount();
  }

  private async populateSystemRoles() {
    const roles: string[] = USER_ROLES;

    //fetch all the roles in the db
    const allRoles = await this._roleRepository.findAll();

    //get the missing roles
    const missingRoles = roles.filter((role) => {
      return !allRoles.find((r) => r.name === role);
    });

    const createdRoles: RoleModel[] = [];

    //create the missing roles
    missingRoles.forEach((role) => {
      const roleInstance = new RoleModel();
      roleInstance.name = role;

      createdRoles.push(roleInstance);
    });

    if (missingRoles.length > 0) {
      await this._roleRepository.saveMany(createdRoles);
    }
  }

  private async populateAdminAccount() {
    //check if an admin account exists
    const admin = await this._userAccountRepository.checkAdminExists();

    //if there is no admin yet, create the default one
    if (!admin) {
      const adminRole = await this._roleRepository.fetchRoleByName(
        UserRoleType.ADMIN,
      );

      const { userName, email, password } = this._configService.adminConfig;

      const hashedPassword = await this._passwordService.hashPassword(password);

      const newAdmin = new UserModel();
      newAdmin.userName = userName;
      newAdmin.email = email;
      newAdmin.password = hashedPassword;
      newAdmin.role = adminRole;

      await this._userAccountRepository.create(newAdmin);

      this.logger.log(`Default admin account created for ${email}`);
    }
  }
}
