import { Injectable } from '@nestjs/common';
import { BoothSnapshot } from './booth.types';

const V0_SNAPSHOT: BoothSnapshot = {
  phase: 'attract',
  theme: null,
  scenes: [],
  config: {},
  session: null,
};

@Injectable()
export class BoothService {
  getSnapshot(): BoothSnapshot {
    return V0_SNAPSHOT;
  }
}
