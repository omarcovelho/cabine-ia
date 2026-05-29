import { Controller, Get } from '@nestjs/common';
import { BoothService } from './booth.service';

@Controller('booth')
export class BoothController {
  constructor(private readonly boothService: BoothService) {}

  @Get()
  getSnapshot() {
    return this.boothService.getSnapshot();
  }
}
