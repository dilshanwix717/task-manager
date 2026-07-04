import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/infrastructure/auth-module/decorators/auth.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
