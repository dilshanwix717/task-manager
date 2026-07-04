import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  // To compare the raw password with hash password
  public async compareWithHashedPassword(
    clearPassword: string,
    hashedPassword: string,
  ) {
    return await bcrypt.compare(clearPassword, hashedPassword);
  }

  // To hash the given password
  public async hashPassword(password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
  }
}
