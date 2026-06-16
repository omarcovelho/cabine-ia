import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { SelectSceneDto } from './dto/select-scene.dto';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  @HttpCode(200)
  start() {
    return this.sessionsService.start().then((session) => ({ session }));
  }

  @Post('current/scene')
  @HttpCode(200)
  selectScene(@Body() body: SelectSceneDto) {
    return this.sessionsService
      .selectScene(body.sceneId)
      .then((session) => ({ session }));
  }

  @Post('current/back')
  @HttpCode(200)
  goBack() {
    return this.sessionsService.goBack().then((session) => ({ session }));
  }
}
