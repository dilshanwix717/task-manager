import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignInWithEmailDto {
  @IsEmail()
  @ApiProperty({
    type: String,
    required: true,
    example: 'admin@tasktracker.dev',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true, example: 'admin123' })
  password: string;
}

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message:
      'userName can only contain letters, numbers, dots, underscores and hyphens',
  })
  @ApiProperty({ type: String, required: true, example: 'dilshan' })
  userName: string;

  @IsEmail()
  @MaxLength(255)
  @ApiProperty({ type: String, required: true, example: 'dilshan@example.com' })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @ApiProperty({ type: String, required: true, example: 'strong#password1' })
  password: string;
}

export class TokenPresenterDto {
  @Expose()
  @ApiProperty({ type: String, required: true, example: 'Bearer token' })
  access_token: string;
}
