import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService, TOKEN_EXPIRES_IN_SECONDS } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { CreateEventDto } from './events/dto/create-event.dto';
import { EventsService } from './events/events.service';
import { LoginDto } from './dto/login.dto';
import { SetThemeDto } from './dto/set-theme.dto';
import { OperatorThemeService } from './operator-theme.service';

@Controller('operator')
@UseGuards(JwtAuthGuard)
export class OperatorController {
  constructor(
    private readonly authService: AuthService,
    private readonly operatorThemeService: OperatorThemeService,
    private readonly eventsService: EventsService,
  ) {}

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
    return { themes: this.operatorThemeService.listThemes() };
  }

  @Post('theme')
  @HttpCode(200)
  async setTheme(@Body() body: SetThemeDto) {
    const theme = await this.operatorThemeService.setActiveTheme(body.themeId);
    return { theme };
  }

  @Get('events')
  async listEvents() {
    const events = await this.eventsService.listEvents();
    return { events };
  }

  @Post('events')
  @HttpCode(200)
  async createEvent(@Body() body: CreateEventDto) {
    const event = await this.eventsService.createEvent(body.name);
    return { event };
  }

  @Post('events/:id/activate')
  @HttpCode(200)
  async activateEvent(@Param('id') id: string) {
    const event = await this.eventsService.activateEvent(id);
    return { event };
  }
}
