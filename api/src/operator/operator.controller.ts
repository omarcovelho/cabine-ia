import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService, TOKEN_EXPIRES_IN_SECONDS } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('operator')
@UseGuards(JwtAuthGuard)
export class OperatorController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    if (!this.authService.validatePin(body.pin)) {
      throw new UnauthorizedException();
    }

    return {
      token: this.authService.signToken(),
      expiresIn: TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  @Get('themes')
  listThemes() {
    return { themes: [] };
  }
}
