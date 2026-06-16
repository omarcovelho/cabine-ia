import { Controller, Get, Param, Res } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';
import { ThemeService } from './theme.service';

@Controller('themes')
export class ThemesController {
  constructor(private readonly themeService: ThemeService) {}

  @Get(':themeId/scenes/:sceneId/example')
  serveExample(
    @Param('themeId') themeId: string,
    @Param('sceneId') sceneId: string,
    @Res() res: Response,
  ): void {
    const imagePath = this.themeService.getExampleImagePath(themeId, sceneId);
    res.setHeader('Content-Type', 'image/png');
    createReadStream(imagePath).pipe(res);
  }
}
