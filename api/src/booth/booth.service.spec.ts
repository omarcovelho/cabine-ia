import { Test, TestingModule } from '@nestjs/testing';
import { BoothService } from './booth.service';

describe('BoothService', () => {
  let service: BoothService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoothService],
    }).compile();

    service = module.get(BoothService);
  });

  it('returns attract phase snapshot', () => {
    expect(service.getSnapshot().phase).toBe('attract');
  });
});
