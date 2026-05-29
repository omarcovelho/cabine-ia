import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OperatorController } from './operator.controller';

@Module({
  imports: [AuthModule],
  controllers: [OperatorController],
})
export class OperatorModule {}
