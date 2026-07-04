import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

export class TokenPresenterDto {
  @Expose()
  @ApiProperty({ type: String, required: true, example: 'Bearer token' })
  access_token: string;
}
